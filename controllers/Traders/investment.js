import { PrismaClient } from '@prisma/client';
import { InvestmentStatus, PayoutStatus } from '@prisma/client';
import dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient();

// Helper function to calculate next payout date
function calculateNextPayoutDate() {
  const nextPayoutDate = new Date();
  nextPayoutDate.setMonth(nextPayoutDate.getMonth() + 1);
  nextPayoutDate.setDate(1);
  return nextPayoutDate;
}

// Helper function to calculate inventory metrics
function calculateInventoryMetrics(initialAmount) {
  const averageBuyPrice = 500; // ₦500 per kg
  const currentMarketPrice = 850; // ₦850 per kg
  const totalPurchased = Math.floor(initialAmount / averageBuyPrice);
  const currentValue = totalPurchased * currentMarketPrice;

  return {
    totalPurchased,
    averageBuyPrice,
    currentMarketPrice,
    currentValue
  };
}

// Get all investments for current user
const getUserInvestments = async (req, res) => {
  try {
    const userId = req.user.id;

    const investments = await prisma.investment.findMany({
      where: { investorId: userId },
      include: {
        inventory: {
          include: {
            sales: {
              orderBy: { date: 'desc' }
            }
          }
        },
        transactions: {
          orderBy: { date: 'desc' }
        },
        payouts: {
          orderBy: { scheduledDate: 'desc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return res.json({
      success: true,
      data: investments
    });

  } catch (error) {
    console.error('Get investments error:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Failed to fetch investments' 
    });
  }
}

// Get single investment by ID
const getInvestmentById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const investment = await prisma.investment.findFirst({
      where: { 
        id,
        investorId: userId 
      },
      include: {
        inventory: {
          include: {
            sales: {
              orderBy: { date: 'desc' }
            }
          }
        },
        transactions: {
          orderBy: { date: 'desc' }
        },
        payouts: {
          orderBy: { scheduledDate: 'desc' }
        }
      }
    });

    if (!investment) {
      return res.status(404).json({
        success: false,
        error: 'Investment not found'
      });
    }

    return res.json({
      success: true,
      data: investment
    });

  } catch (error) {
    console.error('Get investment error:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Failed to fetch investment' 
    });
  }
}

// Create new investment
const createInvestment = async (req, res) => {
  try {
    const userId = req.user.id;
    const { initialAmount, monthlyReturnRate = 7.1, productType = 'Rice' } = req.body;

    // Validate input
    if (!initialAmount || initialAmount <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Valid initial amount is required'
      });
    }

    if (initialAmount < 100000) {
      return res.status(400).json({
        success: false,
        error: 'Minimum investment amount is ₦100,000'
      });
    }

    const nextPayoutDate = calculateNextPayoutDate();
    const inventoryMetrics = calculateInventoryMetrics(initialAmount);

    const investment = await prisma.investment.create({
      data: {
        investorId: userId,
        initialAmount,
        currentBalance: initialAmount,
        monthlyReturnRate,
        totalEarned: 0,
        nextPayoutDate,
        status: 'ACTIVE',
        inventory: {
          create: {
            productType,
            totalPurchased: inventoryMetrics.totalPurchased,
            sold: 0,
            remaining: inventoryMetrics.totalPurchased,
            averageBuyPrice: inventoryMetrics.averageBuyPrice,
            currentMarketPrice: inventoryMetrics.currentMarketPrice,
            currentValue: inventoryMetrics.currentValue,
          }
        },
        transactions: {
          create: {
            type: 'investment',
            amount: initialAmount,
            description: 'Initial Investment',
            status: 'completed',
          }
        }
      },
      include: {
        inventory: {
          include: {
            sales: true
          }
        },
        transactions: true,
        payouts: true,
      }
    });

    return res.status(201).json({
      success: true,
      message: 'Investment created successfully',
      data: investment
    });

  } catch (error) {
    console.error('Create investment error:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Failed to create investment' 
    });
  }
}

// Add more funds to existing investment
const addFunds = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount } = req.body;
    const userId = req.user.id;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Valid amount is required'
      });
    }

    const investment = await prisma.investment.findFirst({
      where: { 
        id,
        investorId: userId 
      }
    });

    if (!investment) {
      return res.status(404).json({
        success: false,
        error: 'Investment not found'
      });
    }

    if (investment.status !== 'ACTIVE') {
      return res.status(400).json({
        success: false,
        error: 'Cannot add funds to inactive investment'
      });
    }

    // Update investment balance and inventory
    const inventoryMetrics = calculateInventoryMetrics(amount);
    const updatedInvestment = await prisma.$transaction([
      prisma.investment.update({
        where: { id },
        data: {
          initialAmount: investment.initialAmount + amount,
          currentBalance: investment.currentBalance + amount,
        }
      }),
      prisma.investmentInventory.update({
        where: { investmentId: id },
        data: {
          totalPurchased: { increment: inventoryMetrics.totalPurchased },
          remaining: { increment: inventoryMetrics.totalPurchased },
          currentValue: { increment: inventoryMetrics.currentValue },
        }
      }),
      prisma.investmentTransaction.create({
        data: {
          investmentId: id,
          type: 'investment',
          amount: amount,
          description: 'Additional Investment',
          status: 'completed',
        }
      })
    ]);

    return res.json({
      success: true,
      message: 'Funds added successfully',
      data: updatedInvestment[0]
    });

  } catch (error) {
    console.error('Add funds error:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Failed to add funds' 
    });
  }
}

// Request payout
const requestPayout = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const investment = await prisma.investment.findFirst({
      where: { 
        id,
        investorId: userId,
        status: 'ACTIVE'
      }
    });

    if (!investment) {
      return res.status(404).json({
        success: false,
        error: 'Active investment not found'
      });
    }

    // Check if payout date has been reached
    const today = new Date();
    if (today < investment.nextPayoutDate) {
      return res.status(400).json({
        success: false,
        error: 'Payout date has not been reached yet'
      });
    }

    // Calculate monthly return
    const payoutAmount = investment.initialAmount * (investment.monthlyReturnRate / 100);
    const nextPayoutDate = calculateNextPayoutDate();

    const [payout, updatedInvestment] = await prisma.$transaction([
      prisma.payout.create({
        data: {
          investmentId: id,
          amount: payoutAmount,
          scheduledDate: investment.nextPayoutDate,
          status: 'PENDING'
        }
      }),
      prisma.investment.update({
        where: { id },
        data: {
          totalEarned: investment.totalEarned + payoutAmount,
          nextPayoutDate: nextPayoutDate,
          transactions: {
            create: {
              type: 'payout',
              amount: payoutAmount,
              description: `Monthly Return (${investment.monthlyReturnRate}%)`,
              status: 'pending',
            }
          }
        }
      })
    ]);

    return res.json({
      success: true,
      message: 'Payout requested successfully',
      data: {
        payout,
        investment: updatedInvestment
      }
    });

  } catch (error) {
    console.error('Request payout error:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Failed to request payout' 
    });
  }
}

// Record a sale
const recordSale = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity, pricePerUnit, buyer } = req.body;
    const userId = req.user.id;

    // Validate input
    if (!quantity || quantity <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Valid quantity is required'
      });
    }

    if (!pricePerUnit || pricePerUnit <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Valid price per unit is required'
      });
    }

    if (!buyer) {
      return res.status(400).json({
        success: false,
        error: 'Buyer name is required'
      });
    }

    const investment = await prisma.investment.findFirst({
      where: { 
        id,
        investorId: userId 
      },
      include: {
        inventory: true
      }
    });

    if (!investment) {
      return res.status(404).json({
        success: false,
        error: 'Investment not found'
      });
    }

    const inventory = investment.inventory[0];
    
    if (quantity > inventory.remaining) {
      return res.status(400).json({
        success: false,
        error: 'Insufficient inventory'
      });
    }

    const totalAmount = quantity * pricePerUnit;

    const [sale, updatedInventory] = await prisma.$transaction([
      prisma.investmentSale.create({
        data: {
          inventoryId: inventory.id,
          quantity,
          pricePerUnit,
          totalAmount,
          buyer
        }
      }),
      prisma.investmentInventory.update({
        where: { id: inventory.id },
        data: {
          sold: inventory.sold + quantity,
          remaining: inventory.remaining - quantity,
          currentValue: (inventory.remaining - quantity) * inventory.currentMarketPrice
        }
      }),
      prisma.investmentTransaction.create({
        data: {
          investmentId: id,
          type: 'sale',
          amount: totalAmount,
          description: `Sale of ${quantity}kg to ${buyer}`,
          status: 'completed',
        }
      })
    ]);

    return res.json({
      success: true,
      message: 'Sale recorded successfully',
      data: {
        sale,
        inventory: updatedInventory
      }
    });

  } catch (error) {
    console.error('Record sale error:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Failed to record sale' 
    });
  }
}

// Get investment analytics
const getInvestmentAnalytics = async (req, res) => {
  try {
    const userId = req.user.id;

    const investments = await prisma.investment.findMany({
      where: { investorId: userId },
      include: {
        inventory: true,
        transactions: true,
        payouts: true,
      }
    });

    // Calculate analytics
    const totalInvested = investments.reduce((sum, inv) => sum + inv.initialAmount, 0);
    const totalEarned = investments.reduce((sum, inv) => sum + inv.totalEarned, 0);
    const currentPortfolioValue = investments.reduce((sum, inv) => sum + inv.currentBalance, 0);
    const totalROI = totalInvested > 0 ? (totalEarned / totalInvested) * 100 : 0;

    const analytics = {
      totalInvestments: investments.length,
      totalInvested,
      totalEarned,
      currentPortfolioValue,
      totalROI: Number(totalROI.toFixed(2)),
      activeInvestments: investments.filter(inv => inv.status === 'ACTIVE').length,
      completedInvestments: investments.filter(inv => inv.status === 'COMPLETED').length,
      nextPayout: investments.length > 0 ? investments[0].nextPayoutDate : null,
      portfolioBreakdown: investments.map(inv => ({
        id: inv.id,
        initialAmount: inv.initialAmount,
        currentBalance: inv.currentBalance,
        roi: Number(((inv.totalEarned / inv.initialAmount) * 100).toFixed(2)),
        status: inv.status
      }))
    };

    return res.json({
      success: true,
      data: analytics
    });

  } catch (error) {
    console.error('Get analytics error:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Failed to fetch analytics' 
    });
  }
}

// Get investment transactions
const getInvestmentTransactions = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const investment = await prisma.investment.findFirst({
      where: { 
        id,
        investorId: userId 
      }
    });

    if (!investment) {
      return res.status(404).json({
        success: false,
        error: 'Investment not found'
      });
    }

    const transactions = await prisma.investmentTransaction.findMany({
      where: { investmentId: id },
      orderBy: { date: 'desc' }
    });

    return res.json({
      success: true,
      data: transactions
    });

  } catch (error) {
    console.error('Get transactions error:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Failed to fetch transactions' 
    });
  }
}

// Get investment sales
const getInvestmentSales = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const investment = await prisma.investment.findFirst({
      where: { 
        id,
        investorId: userId 
      },
      include: {
        inventory: {
          include: {
            sales: {
              orderBy: { date: 'desc' }
            }
          }
        }
      }
    });

    if (!investment) {
      return res.status(404).json({
        success: false,
        error: 'Investment not found'
      });
    }

    const sales = investment.inventory[0]?.sales || [];

    return res.json({
      success: true,
      data: sales
    });

  } catch (error) {
    console.error('Get sales error:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Failed to fetch sales' 
    });
  }
}

// Close investment
const closeInvestment = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const investment = await prisma.investment.findFirst({
      where: { 
        id,
        investorId: userId,
        status: 'ACTIVE'
      }
    });

    if (!investment) {
      return res.status(404).json({
        success: false,
        error: 'Active investment not found'
      });
    }

    // Check if investment can be closed (minimum 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    if (investment.startDate > sixMonthsAgo) {
      return res.status(400).json({
        success: false,
        error: 'Investment must be active for at least 6 months before closing'
      });
    }

    const closedInvestment = await prisma.investment.update({
      where: { id },
      data: {
        status: 'COMPLETED',
        endDate: new Date(),
        currentBalance: 0
      }
    });

    return res.json({
      success: true,
      message: 'Investment closed successfully',
      data: closedInvestment
    });

  } catch (error) {
    console.error('Close investment error:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Failed to close investment' 
    });
  }
}

// Admin: Get all investments (paginated)
const getAllInvestments = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ 
        success: false,
        error: 'Unauthorized' 
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const status = req.query.status;

    const where = status ? { status } : {};

    const [investments, total] = await Promise.all([
      prisma.investment.findMany({
        where,
        skip,
        take: limit,
        include: {
          investor: {
            select: {
              id: true,
              name: true,
              email: true,
              contact: true
            }
          },
          inventory: true,
          transactions: {
            take: 5,
            orderBy: { date: 'desc' }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.investment.count({ where })
    ]);

    return res.json({
      success: true,
      data: investments,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get all investments error:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Failed to get investments' 
    });
  }
}

// Admin: Update investment status
const updateInvestmentStatus = async (req, res) => {
  try {
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ 
        success: false,
        error: 'Unauthorized' 
      });
    }

    const { id } = req.params;
    const { status } = req.body;

    if (!Object.values(InvestmentStatus).includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid status'
      });
    }

    const updatedInvestment = await prisma.Investment.update({
      where: { id },
      data: { status },
      include: {
        investor: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    return res.json({
      success: true,
      message: 'Investment status updated successfully',
      data: updatedInvestment
    });

  } catch (error) {
    console.error('Update investment status error:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Failed to update investment status' 
    });
  }
}

// Admin: Process payout
const processPayout = async (req, res) => {
  try {
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ 
        success: false,
        error: 'Unauthorized' 
      });
    }

    const { payoutId } = req.params;

    const payout = await prisma.payout.findUnique({
      where: { id: payoutId },
      include: {
        investment: true
      }
    });

    if (!payout) {
      return res.status(404).json({
        success: false,
        error: 'Payout not found'
      });
    }

    if (payout.status !== 'PENDING') {
      return res.status(400).json({
        success: false,
        error: 'Payout has already been processed'
      });
    }

    const processedPayout = await prisma.$transaction([
      prisma.payout.update({
        where: { id: payoutId },
        data: {
          status: 'PAID',
          paidDate: new Date()
        }
      }),
      prisma.investmentTransaction.updateMany({
        where: {
          investmentId: payout.investmentId,
          type: 'payout',
          status: 'pending'
        },
        data: {
          status: 'completed'
        }
      })
    ]);

    return res.json({
      success: true,
      message: 'Payout processed successfully',
      data: processedPayout[0]
    });

  } catch (error) {
    console.error('Process payout error:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Failed to process payout' 
    });
  }
}

export {
  getUserInvestments,
  getInvestmentById,
  createInvestment,
  addFunds,
  requestPayout,
  recordSale,
  getInvestmentAnalytics,
  getInvestmentTransactions,
  getInvestmentSales,
  closeInvestment,
  getAllInvestments,
  updateInvestmentStatus,
  processPayout
};