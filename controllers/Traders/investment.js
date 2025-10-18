// import { PrismaClient } from '@prisma/client';
// import { InvestmentStatus, PayoutStatus } from '@prisma/client';
// import dotenv from 'dotenv';
// dotenv.config();

// const prisma = new PrismaClient();

// // Helper function to calculate next payout date
// function calculateNextPayoutDate() {
//   const nextPayoutDate = new Date();
//   nextPayoutDate.setMonth(nextPayoutDate.getMonth() + 1);
//   nextPayoutDate.setDate(1);
//   return nextPayoutDate;
// }

// // Helper function to calculate inventory metrics
// function calculateInventoryMetrics(initialAmount) {
//   const averageBuyPrice = 500; // ₦500 per kg
//   const currentMarketPrice = 850; // ₦850 per kg
//   const totalPurchased = Math.floor(initialAmount / averageBuyPrice);
//   const currentValue = totalPurchased * currentMarketPrice;

//   return {
//     totalPurchased,
//     averageBuyPrice,
//     currentMarketPrice,
//     currentValue
//   };
// }

// // Get all investments for current user
// const getUserInvestments = async (req, res) => {
//   try {
//     const userId = req.user.id;

//     const investments = await prisma.investment.findMany({
//       where: { investorId: userId },
//       include: {
//         inventory: {
//           include: {
//             sales: {
//               orderBy: { date: 'desc' }
//             }
//           }
//         },
//         transactions: {
//           orderBy: { date: 'desc' }
//         },
//         payouts: {
//           orderBy: { scheduledDate: 'desc' }
//         }
//       },
//       orderBy: { createdAt: 'desc' }
//     });

//     return res.json({
//       success: true,
//       data: investments
//     });

//   } catch (error) {
//     console.error('Get investments error:', error);
//     return res.status(500).json({ 
//       success: false,
//       error: 'Failed to fetch investments' 
//     });
//   }
// }

// // Get single investment by ID
// const getInvestmentById = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const userId = req.user.id;

//     const investment = await prisma.investment.findFirst({
//       where: { 
//         id,
//         investorId: userId 
//       },
//       include: {
//         inventory: {
//           include: {
//             sales: {
//               orderBy: { date: 'desc' }
//             }
//           }
//         },
//         transactions: {
//           orderBy: { date: 'desc' }
//         },
//         payouts: {
//           orderBy: { scheduledDate: 'desc' }
//         }
//       }
//     });

//     if (!investment) {
//       return res.status(404).json({
//         success: false,
//         error: 'Investment not found'
//       });
//     }

//     return res.json({
//       success: true,
//       data: investment
//     });

//   } catch (error) {
//     console.error('Get investment error:', error);
//     return res.status(500).json({ 
//       success: false,
//       error: 'Failed to fetch investment' 
//     });
//   }
// }

// // Create new investment
// const createInvestment = async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const { initialAmount, monthlyReturnRate = 7.1, productType = 'Rice' } = req.body;

//     // Validate input
//     if (!initialAmount || initialAmount <= 0) {
//       return res.status(400).json({
//         success: false,
//         error: 'Valid initial amount is required'
//       });
//     }

//     if (initialAmount < 100000) {
//       return res.status(400).json({
//         success: false,
//         error: 'Minimum investment amount is ₦100,000'
//       });
//     }

//     const nextPayoutDate = calculateNextPayoutDate();
//     const inventoryMetrics = calculateInventoryMetrics(initialAmount);

//     const investment = await prisma.investment.create({
//       data: {
//         investorId: userId,
//         initialAmount,
//         currentBalance: initialAmount,
//         monthlyReturnRate,
//         totalEarned: 0,
//         nextPayoutDate,
//         status: 'ACTIVE',
//         inventory: {
//           create: {
//             productType,
//             totalPurchased: inventoryMetrics.totalPurchased,
//             sold: 0,
//             remaining: inventoryMetrics.totalPurchased,
//             averageBuyPrice: inventoryMetrics.averageBuyPrice,
//             currentMarketPrice: inventoryMetrics.currentMarketPrice,
//             currentValue: inventoryMetrics.currentValue,
//           }
//         },
//         transactions: {
//           create: {
//             type: 'investment',
//             amount: initialAmount,
//             description: 'Initial Investment',
//             status: 'completed',
//           }
//         }
//       },
//       include: {
//         inventory: {
//           include: {
//             sales: true
//           }
//         },
//         transactions: true,
//         payouts: true,
//       }
//     });

//     return res.status(201).json({
//       success: true,
//       message: 'Investment created successfully',
//       data: investment
//     });

//   } catch (error) {
//     console.error('Create investment error:', error);
//     return res.status(500).json({ 
//       success: false,
//       error: 'Failed to create investment' 
//     });
//   }
// }

// // Add more funds to existing investment
// const addFunds = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { amount } = req.body;
//     const userId = req.user.id;

//     if (!amount || amount <= 0) {
//       return res.status(400).json({
//         success: false,
//         error: 'Valid amount is required'
//       });
//     }

//     const investment = await prisma.investment.findFirst({
//       where: { 
//         id,
//         investorId: userId 
//       }
//     });

//     if (!investment) {
//       return res.status(404).json({
//         success: false,
//         error: 'Investment not found'
//       });
//     }

//     if (investment.status !== 'ACTIVE') {
//       return res.status(400).json({
//         success: false,
//         error: 'Cannot add funds to inactive investment'
//       });
//     }

//     // Update investment balance and inventory
//     const inventoryMetrics = calculateInventoryMetrics(amount);
//     const updatedInvestment = await prisma.$transaction([
//       prisma.investment.update({
//         where: { id },
//         data: {
//           initialAmount: investment.initialAmount + amount,
//           currentBalance: investment.currentBalance + amount,
//         }
//       }),
//       prisma.investmentInventory.update({
//         where: { investmentId: id },
//         data: {
//           totalPurchased: { increment: inventoryMetrics.totalPurchased },
//           remaining: { increment: inventoryMetrics.totalPurchased },
//           currentValue: { increment: inventoryMetrics.currentValue },
//         }
//       }),
//       prisma.investmentTransaction.create({
//         data: {
//           investmentId: id,
//           type: 'investment',
//           amount: amount,
//           description: 'Additional Investment',
//           status: 'completed',
//         }
//       })
//     ]);

//     return res.json({
//       success: true,
//       message: 'Funds added successfully',
//       data: updatedInvestment[0]
//     });

//   } catch (error) {
//     console.error('Add funds error:', error);
//     return res.status(500).json({ 
//       success: false,
//       error: 'Failed to add funds' 
//     });
//   }
// }

// // Request payout
// const requestPayout = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const userId = req.user.id;

//     const investment = await prisma.investment.findFirst({
//       where: { 
//         id,
//         investorId: userId,
//         status: 'ACTIVE'
//       }
//     });

//     if (!investment) {
//       return res.status(404).json({
//         success: false,
//         error: 'Active investment not found'
//       });
//     }

//     // Check if payout date has been reached
//     const today = new Date();
//     if (today < investment.nextPayoutDate) {
//       return res.status(400).json({
//         success: false,
//         error: 'Payout date has not been reached yet'
//       });
//     }

//     // Calculate monthly return
//     const payoutAmount = investment.initialAmount * (investment.monthlyReturnRate / 100);
//     const nextPayoutDate = calculateNextPayoutDate();

//     const [payout, updatedInvestment] = await prisma.$transaction([
//       prisma.payout.create({
//         data: {
//           investmentId: id,
//           amount: payoutAmount,
//           scheduledDate: investment.nextPayoutDate,
//           status: 'PENDING'
//         }
//       }),
//       prisma.investment.update({
//         where: { id },
//         data: {
//           totalEarned: investment.totalEarned + payoutAmount,
//           nextPayoutDate: nextPayoutDate,
//           transactions: {
//             create: {
//               type: 'payout',
//               amount: payoutAmount,
//               description: `Monthly Return (${investment.monthlyReturnRate}%)`,
//               status: 'pending',
//             }
//           }
//         }
//       })
//     ]);

//     return res.json({
//       success: true,
//       message: 'Payout requested successfully',
//       data: {
//         payout,
//         investment: updatedInvestment
//       }
//     });

//   } catch (error) {
//     console.error('Request payout error:', error);
//     return res.status(500).json({ 
//       success: false,
//       error: 'Failed to request payout' 
//     });
//   }
// }

// // Record a sale
// const recordSale = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { quantity, pricePerUnit, buyer } = req.body;
//     const userId = req.user.id;

//     // Validate input
//     if (!quantity || quantity <= 0) {
//       return res.status(400).json({
//         success: false,
//         error: 'Valid quantity is required'
//       });
//     }

//     if (!pricePerUnit || pricePerUnit <= 0) {
//       return res.status(400).json({
//         success: false,
//         error: 'Valid price per unit is required'
//       });
//     }

//     if (!buyer) {
//       return res.status(400).json({
//         success: false,
//         error: 'Buyer name is required'
//       });
//     }

//     const investment = await prisma.investment.findFirst({
//       where: { 
//         id,
//         investorId: userId 
//       },
//       include: {
//         inventory: true
//       }
//     });

//     if (!investment) {
//       return res.status(404).json({
//         success: false,
//         error: 'Investment not found'
//       });
//     }

//     const inventory = investment.inventory[0];
    
//     if (quantity > inventory.remaining) {
//       return res.status(400).json({
//         success: false,
//         error: 'Insufficient inventory'
//       });
//     }

//     const totalAmount = quantity * pricePerUnit;

//     const [sale, updatedInventory] = await prisma.$transaction([
//       prisma.investmentSale.create({
//         data: {
//           inventoryId: inventory.id,
//           quantity,
//           pricePerUnit,
//           totalAmount,
//           buyer
//         }
//       }),
//       prisma.investmentInventory.update({
//         where: { id: inventory.id },
//         data: {
//           sold: inventory.sold + quantity,
//           remaining: inventory.remaining - quantity,
//           currentValue: (inventory.remaining - quantity) * inventory.currentMarketPrice
//         }
//       }),
//       prisma.investmentTransaction.create({
//         data: {
//           investmentId: id,
//           type: 'sale',
//           amount: totalAmount,
//           description: `Sale of ${quantity}kg to ${buyer}`,
//           status: 'completed',
//         }
//       })
//     ]);

//     return res.json({
//       success: true,
//       message: 'Sale recorded successfully',
//       data: {
//         sale,
//         inventory: updatedInventory
//       }
//     });

//   } catch (error) {
//     console.error('Record sale error:', error);
//     return res.status(500).json({ 
//       success: false,
//       error: 'Failed to record sale' 
//     });
//   }
// }

// // Get investment analytics
// const getInvestmentAnalytics = async (req, res) => {
//   try {
//     const userId = req.user.id;

//     const investments = await prisma.investment.findMany({
//       where: { investorId: userId },
//       include: {
//         inventory: true,
//         transactions: true,
//         payouts: true,
//       }
//     });

//     // Calculate analytics
//     const totalInvested = investments.reduce((sum, inv) => sum + inv.initialAmount, 0);
//     const totalEarned = investments.reduce((sum, inv) => sum + inv.totalEarned, 0);
//     const currentPortfolioValue = investments.reduce((sum, inv) => sum + inv.currentBalance, 0);
//     const totalROI = totalInvested > 0 ? (totalEarned / totalInvested) * 100 : 0;

//     const analytics = {
//       totalInvestments: investments.length,
//       totalInvested,
//       totalEarned,
//       currentPortfolioValue,
//       totalROI: Number(totalROI.toFixed(2)),
//       activeInvestments: investments.filter(inv => inv.status === 'ACTIVE').length,
//       completedInvestments: investments.filter(inv => inv.status === 'COMPLETED').length,
//       nextPayout: investments.length > 0 ? investments[0].nextPayoutDate : null,
//       portfolioBreakdown: investments.map(inv => ({
//         id: inv.id,
//         initialAmount: inv.initialAmount,
//         currentBalance: inv.currentBalance,
//         roi: Number(((inv.totalEarned / inv.initialAmount) * 100).toFixed(2)),
//         status: inv.status
//       }))
//     };

//     return res.json({
//       success: true,
//       data: analytics
//     });

//   } catch (error) {
//     console.error('Get analytics error:', error);
//     return res.status(500).json({ 
//       success: false,
//       error: 'Failed to fetch analytics' 
//     });
//   }
// }

// // Get investment transactions
// const getInvestmentTransactions = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const userId = req.user.id;

//     const investment = await prisma.investment.findFirst({
//       where: { 
//         id,
//         investorId: userId 
//       }
//     });

//     if (!investment) {
//       return res.status(404).json({
//         success: false,
//         error: 'Investment not found'
//       });
//     }

//     const transactions = await prisma.investmentTransaction.findMany({
//       where: { investmentId: id },
//       orderBy: { date: 'desc' }
//     });

//     return res.json({
//       success: true,
//       data: transactions
//     });

//   } catch (error) {
//     console.error('Get transactions error:', error);
//     return res.status(500).json({ 
//       success: false,
//       error: 'Failed to fetch transactions' 
//     });
//   }
// }

// // Get investment sales
// const getInvestmentSales = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const userId = req.user.id;

//     const investment = await prisma.investment.findFirst({
//       where: { 
//         id,
//         investorId: userId 
//       },
//       include: {
//         inventory: {
//           include: {
//             sales: {
//               orderBy: { date: 'desc' }
//             }
//           }
//         }
//       }
//     });

//     if (!investment) {
//       return res.status(404).json({
//         success: false,
//         error: 'Investment not found'
//       });
//     }

//     const sales = investment.inventory[0]?.sales || [];

//     return res.json({
//       success: true,
//       data: sales
//     });

//   } catch (error) {
//     console.error('Get sales error:', error);
//     return res.status(500).json({ 
//       success: false,
//       error: 'Failed to fetch sales' 
//     });
//   }
// }

// // Close investment
// const closeInvestment = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const userId = req.user.id;

//     const investment = await prisma.investment.findFirst({
//       where: { 
//         id,
//         investorId: userId,
//         status: 'ACTIVE'
//       }
//     });

//     if (!investment) {
//       return res.status(404).json({
//         success: false,
//         error: 'Active investment not found'
//       });
//     }

//     // Check if investment can be closed (minimum 6 months)
//     const sixMonthsAgo = new Date();
//     sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

//     if (investment.startDate > sixMonthsAgo) {
//       return res.status(400).json({
//         success: false,
//         error: 'Investment must be active for at least 6 months before closing'
//       });
//     }

//     const closedInvestment = await prisma.investment.update({
//       where: { id },
//       data: {
//         status: 'COMPLETED',
//         endDate: new Date(),
//         currentBalance: 0
//       }
//     });

//     return res.json({
//       success: true,
//       message: 'Investment closed successfully',
//       data: closedInvestment
//     });

//   } catch (error) {
//     console.error('Close investment error:', error);
//     return res.status(500).json({ 
//       success: false,
//       error: 'Failed to close investment' 
//     });
//   }
// }

// // Admin: Get all investments (paginated)
// const getAllInvestments = async (req, res) => {
//   try {
//     // Check if user is admin
//     if (req.user.role !== 'ADMIN') {
//       return res.status(403).json({ 
//         success: false,
//         error: 'Unauthorized' 
//       });
//     }

//     const page = parseInt(req.query.page) || 1;
//     const limit = parseInt(req.query.limit) || 10;
//     const skip = (page - 1) * limit;
//     const status = req.query.status;

//     const where = status ? { status } : {};

//     const [investments, total] = await Promise.all([
//       prisma.investment.findMany({
//         where,
//         skip,
//         take: limit,
//         include: {
//           investor: {
//             select: {
//               id: true,
//               name: true,
//               email: true,
//               contact: true
//             }
//           },
//           inventory: true,
//           transactions: {
//             take: 5,
//             orderBy: { date: 'desc' }
//           }
//         },
//         orderBy: { createdAt: 'desc' }
//       }),
//       prisma.investment.count({ where })
//     ]);

//     return res.json({
//       success: true,
//       data: investments,
//       meta: {
//         total,
//         page,
//         limit,
//         totalPages: Math.ceil(total / limit)
//       }
//     });

//   } catch (error) {
//     console.error('Get all investments error:', error);
//     return res.status(500).json({ 
//       success: false,
//       error: 'Failed to get investments' 
//     });
//   }
// }

// // Admin: Update investment status
// const updateInvestmentStatus = async (req, res) => {
//   try {
//     if (req.user.role !== 'ADMIN') {
//       return res.status(403).json({ 
//         success: false,
//         error: 'Unauthorized' 
//       });
//     }

//     const { id } = req.params;
//     const { status } = req.body;

//     if (!Object.values(InvestmentStatus).includes(status)) {
//       return res.status(400).json({
//         success: false,
//         error: 'Invalid status'
//       });
//     }

//     const updatedInvestment = await prisma.Investment.update({
//       where: { id },
//       data: { status },
//       include: {
//         investor: {
//           select: {
//             id: true,
//             name: true,
//             email: true
//           }
//         }
//       }
//     });

//     return res.json({
//       success: true,
//       message: 'Investment status updated successfully',
//       data: updatedInvestment
//     });

//   } catch (error) {
//     console.error('Update investment status error:', error);
//     return res.status(500).json({ 
//       success: false,
//       error: 'Failed to update investment status' 
//     });
//   }
// }

// // Admin: Process payout
// const processPayout = async (req, res) => {
//   try {
//     if (req.user.role !== 'ADMIN') {
//       return res.status(403).json({ 
//         success: false,
//         error: 'Unauthorized' 
//       });
//     }

//     const { payoutId } = req.params;

//     const payout = await prisma.payout.findUnique({
//       where: { id: payoutId },
//       include: {
//         investment: true
//       }
//     });

//     if (!payout) {
//       return res.status(404).json({
//         success: false,
//         error: 'Payout not found'
//       });
//     }

//     if (payout.status !== 'PENDING') {
//       return res.status(400).json({
//         success: false,
//         error: 'Payout has already been processed'
//       });
//     }

//     const processedPayout = await prisma.$transaction([
//       prisma.payout.update({
//         where: { id: payoutId },
//         data: {
//           status: 'PAID',
//           paidDate: new Date()
//         }
//       }),
//       prisma.investmentTransaction.updateMany({
//         where: {
//           investmentId: payout.investmentId,
//           type: 'payout',
//           status: 'pending'
//         },
//         data: {
//           status: 'completed'
//         }
//       })
//     ]);

//     return res.json({
//       success: true,
//       message: 'Payout processed successfully',
//       data: processedPayout[0]
//     });

//   } catch (error) {
//     console.error('Process payout error:', error);
//     return res.status(500).json({ 
//       success: false,
//       error: 'Failed to process payout' 
//     });
//   }
// }

// export {
//   getUserInvestments,
//   getInvestmentById,
//   createInvestment,
//   addFunds,
//   requestPayout,
//   recordSale,
//   getInvestmentAnalytics,
//   getInvestmentTransactions,
//   getInvestmentSales,
//   closeInvestment,
//   getAllInvestments,
//   updateInvestmentStatus,
//   processPayout
// };

import pool from '../../config/database.js';

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

// Helper function to calculate months active
function calculateMonthsActive(startDate, endDate = null) {
  const start = new Date(startDate);
  const end = endDate ? new Date(endDate) : new Date();
  
  const months = (end.getFullYear() - start.getFullYear()) * 12 + 
                 (end.getMonth() - start.getMonth());
  
  return Math.max(0, months);
}

// Get all investments for current user
const getUserInvestments = async (req, res) => {
  try {
    const userId = req.user.id;

    const investmentsResult = await pool.query(
      `SELECT i.*, 
              inv.product_type, inv.total_purchased, inv.sold, inv.remaining,
              inv.average_buy_price, inv.current_market_price, inv.current_value
       FROM investments i
       LEFT JOIN investment_inventory inv ON i.id = inv.investment_id
       WHERE i.investor_id = $1
       ORDER BY i.created_at DESC`,
      [userId]
    );

    // Get transactions and payouts for each investment
    const investmentsWithDetails = await Promise.all(
      investmentsResult.rows.map(async (investment) => {
        const [transactions, payouts, sales] = await Promise.all([
          pool.query(
            'SELECT * FROM investment_transactions WHERE investment_id = $1 ORDER BY date DESC',
            [investment.id]
          ),
          pool.query(
            'SELECT * FROM payouts WHERE investment_id = $1 ORDER BY scheduled_date DESC',
            [investment.id]
          ),
          pool.query(
            `SELECT s.* FROM investment_sales s
             JOIN investment_inventory inv ON s.inventory_id = inv.id
             WHERE inv.investment_id = $1 ORDER BY s.date DESC`,
            [investment.id]
          )
        ]);

        return {
          ...investment,
          transactions: transactions.rows,
          payouts: payouts.rows,
          inventory: [{
            ...investment,
            sales: sales.rows
          }]
        };
      })
    );

    return res.json({
      success: true,
      data: investmentsWithDetails
    });

  } catch (error) {
    console.error('Get investments error:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Failed to fetch investments' 
    });
  }
};

// Get single investment by ID
const getInvestmentById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const investmentResult = await pool.query(
      `SELECT i.*, 
              inv.product_type, inv.total_purchased, inv.sold, inv.remaining,
              inv.average_buy_price, inv.current_market_price, inv.current_value
       FROM investments i
       LEFT JOIN investment_inventory inv ON i.id = inv.investment_id
       WHERE i.id = $1 AND i.investor_id = $2`,
      [id, userId]
    );

    if (investmentResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Investment not found'
      });
    }

    const investment = investmentResult.rows[0];

    // Get related data
    const [transactions, payouts, sales] = await Promise.all([
      pool.query(
        'SELECT * FROM investment_transactions WHERE investment_id = $1 ORDER BY date DESC',
        [id]
      ),
      pool.query(
        'SELECT * FROM payouts WHERE investment_id = $1 ORDER BY scheduled_date DESC',
        [id]
      ),
      pool.query(
        `SELECT s.* FROM investment_sales s
         JOIN investment_inventory inv ON s.inventory_id = inv.id
         WHERE inv.investment_id = $1 ORDER BY s.date DESC`,
        [id]
      )
    ]);

    const investmentWithDetails = {
      ...investment,
      transactions: transactions.rows,
      payouts: payouts.rows,
      inventory: [{
        ...investment,
        sales: sales.rows
      }]
    };

    return res.json({
      success: true,
      data: investmentWithDetails
    });

  } catch (error) {
    console.error('Get investment error:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Failed to fetch investment' 
    });
  }
};

// Create new investment
const createInvestment = async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const userId = req.user.id;
    const { initialAmount, monthlyReturnRate = 7.1, productType = 'Rice' } = req.body;

    // Validate input
    if (!initialAmount || initialAmount <= 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        error: 'Valid initial amount is required'
      });
    }

    if (initialAmount < 100000) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        error: 'Minimum investment amount is ₦100,000'
      });
    }

    const nextPayoutDate = calculateNextPayoutDate();
    const inventoryMetrics = calculateInventoryMetrics(initialAmount);

    // Create investment
    const investmentResult = await client.query(
      `INSERT INTO investments 
       (investor_id, initial_amount, current_balance, monthly_return_rate, 
        total_earned, next_payout_date, status) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) 
       RETURNING *`,
      [userId, initialAmount, initialAmount, monthlyReturnRate, 0, nextPayoutDate, 'ACTIVE']
    );

    const investment = investmentResult.rows[0];

    // Create inventory
    const inventoryResult = await client.query(
      `INSERT INTO investment_inventory 
       (investment_id, product_type, total_purchased, sold, remaining, 
        average_buy_price, current_market_price, current_value) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
       RETURNING *`,
      [
        investment.id, productType, inventoryMetrics.totalPurchased, 
        0, inventoryMetrics.totalPurchased, inventoryMetrics.averageBuyPrice,
        inventoryMetrics.currentMarketPrice, inventoryMetrics.currentValue
      ]
    );

    // Create transaction
    await client.query(
      `INSERT INTO investment_transactions 
       (investment_id, type, amount, description, status) 
       VALUES ($1, $2, $3, $4, $5)`,
      [investment.id, 'investment', initialAmount, 'Initial Investment', 'completed']
    );

    await client.query('COMMIT');

    // Fetch complete investment data
    const completeInvestment = await getCompleteInvestmentData(investment.id);

    return res.status(201).json({
      success: true,
      message: 'Investment created successfully',
      data: completeInvestment
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Create investment error:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Failed to create investment' 
    });
  } finally {
    client.release();
  }
};

// Add more funds to existing investment
const addFunds = async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const { id } = req.params;
    const { amount } = req.body;
    const userId = req.user.id;

    if (!amount || amount <= 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        error: 'Valid amount is required'
      });
    }

    // Check investment exists and belongs to user
    const investmentResult = await client.query(
      'SELECT * FROM investments WHERE id = $1 AND investor_id = $2',
      [id, userId]
    );

    if (investmentResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({
        success: false,
        error: 'Investment not found'
      });
    }

    const investment = investmentResult.rows[0];

    if (investment.status !== 'ACTIVE') {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        error: 'Cannot add funds to inactive investment'
      });
    }

    // Update investment balance
    const updatedInvestmentResult = await client.query(
      `UPDATE investments 
       SET initial_amount = initial_amount + $1, current_balance = current_balance + $1
       WHERE id = $2 
       RETURNING *`,
      [amount, id]
    );

    // Update inventory
    const inventoryMetrics = calculateInventoryMetrics(amount);
    await client.query(
      `UPDATE investment_inventory 
       SET total_purchased = total_purchased + $1, 
           remaining = remaining + $1,
           current_value = current_value + $2
       WHERE investment_id = $3`,
      [inventoryMetrics.totalPurchased, inventoryMetrics.currentValue, id]
    );

    // Create transaction
    await client.query(
      `INSERT INTO investment_transactions 
       (investment_id, type, amount, description, status) 
       VALUES ($1, $2, $3, $4, $5)`,
      [id, 'investment', amount, 'Additional Investment', 'completed']
    );

    await client.query('COMMIT');

    const updatedInvestment = updatedInvestmentResult.rows[0];

    return res.json({
      success: true,
      message: 'Funds added successfully',
      data: updatedInvestment
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Add funds error:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Failed to add funds' 
    });
  } finally {
    client.release();
  }
};

// Request payout
const requestPayout = async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const { id } = req.params;
    const userId = req.user.id;

    const investmentResult = await client.query(
      'SELECT * FROM investments WHERE id = $1 AND investor_id = $2 AND status = $3',
      [id, userId, 'ACTIVE']
    );

    if (investmentResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({
        success: false,
        error: 'Active investment not found'
      });
    }

    const investment = investmentResult.rows[0];

    // Check if payout date has been reached
    const today = new Date();
    if (today < investment.next_payout_date) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        error: 'Payout date has not been reached yet'
      });
    }

    // Calculate monthly return
    const payoutAmount = investment.initial_amount * (investment.monthly_return_rate / 100);
    const nextPayoutDate = calculateNextPayoutDate();

    // Create payout
    const payoutResult = await client.query(
      `INSERT INTO payouts 
       (investment_id, amount, scheduled_date, status) 
       VALUES ($1, $2, $3, $4) 
       RETURNING *`,
      [id, payoutAmount, investment.next_payout_date, 'PENDING']
    );

    // Update investment
    const updatedInvestmentResult = await client.query(
      `UPDATE investments 
       SET total_earned = total_earned + $1, next_payout_date = $2
       WHERE id = $3 
       RETURNING *`,
      [payoutAmount, nextPayoutDate, id]
    );

    // Create transaction
    await client.query(
      `INSERT INTO investment_transactions 
       (investment_id, type, amount, description, status) 
       VALUES ($1, $2, $3, $4, $5)`,
      [
        id, 'payout', payoutAmount, 
        `Monthly Return (${investment.monthly_return_rate}%)`, 
        'pending'
      ]
    );

    await client.query('COMMIT');

    return res.json({
      success: true,
      message: 'Payout requested successfully',
      data: {
        payout: payoutResult.rows[0],
        investment: updatedInvestmentResult.rows[0]
      }
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Request payout error:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Failed to request payout' 
    });
  } finally {
    client.release();
  }
};

// Record a sale
const recordSale = async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const { id } = req.params;
    const { quantity, pricePerUnit, buyer } = req.body;
    const userId = req.user.id;

    // Validate input
    if (!quantity || quantity <= 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        error: 'Valid quantity is required'
      });
    }

    if (!pricePerUnit || pricePerUnit <= 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        error: 'Valid price per unit is required'
      });
    }

    if (!buyer) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        error: 'Buyer name is required'
      });
    }

    // Check investment and inventory
    const investmentResult = await client.query(
      `SELECT i.*, inv.* 
       FROM investments i
       JOIN investment_inventory inv ON i.id = inv.investment_id
       WHERE i.id = $1 AND i.investor_id = $2`,
      [id, userId]
    );

    if (investmentResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({
        success: false,
        error: 'Investment not found'
      });
    }

    const { inventory_id, remaining, current_market_price } = investmentResult.rows[0];
    
    if (quantity > remaining) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        error: 'Insufficient inventory'
      });
    }

    const totalAmount = quantity * pricePerUnit;

    // Create sale
    const saleResult = await client.query(
      `INSERT INTO investment_sales 
       (inventory_id, quantity, price_per_unit, total_amount, buyer) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING *`,
      [inventory_id, quantity, pricePerUnit, totalAmount, buyer]
    );

    // Update inventory
    const updatedInventoryResult = await client.query(
      `UPDATE investment_inventory 
       SET sold = sold + $1, 
           remaining = remaining - $1,
           current_value = (remaining - $1) * $2
       WHERE id = $3 
       RETURNING *`,
      [quantity, current_market_price, inventory_id]
    );

    // Create transaction
    await client.query(
      `INSERT INTO investment_transactions 
       (investment_id, type, amount, description, status) 
       VALUES ($1, $2, $3, $4, $5)`,
      [id, 'sale', totalAmount, `Sale of ${quantity}kg to ${buyer}`, 'completed']
    );

    await client.query('COMMIT');

    return res.json({
      success: true,
      message: 'Sale recorded successfully',
      data: {
        sale: saleResult.rows[0],
        inventory: updatedInventoryResult.rows[0]
      }
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Record sale error:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Failed to record sale' 
    });
  } finally {
    client.release();
  }
};

// Get investment analytics
const getInvestmentAnalytics = async (req, res) => {
  try {
    const userId = req.user.id;

    const investmentsResult = await pool.query(
      `SELECT i.*, inv.current_value
       FROM investments i
       LEFT JOIN investment_inventory inv ON i.id = inv.investment_id
       WHERE i.investor_id = $1`,
      [userId]
    );

    const investments = investmentsResult.rows;

    // Calculate analytics
    const totalInvested = investments.reduce((sum, inv) => sum + parseFloat(inv.initial_amount), 0);
    const totalEarned = investments.reduce((sum, inv) => sum + parseFloat(inv.total_earned), 0);
    const currentPortfolioValue = investments.reduce((sum, inv) => sum + parseFloat(inv.current_balance), 0);
    const totalROI = totalInvested > 0 ? (totalEarned / totalInvested) * 100 : 0;

    const analytics = {
      totalInvestments: investments.length,
      totalInvested,
      totalEarned,
      currentPortfolioValue,
      totalROI: Number(totalROI.toFixed(2)),
      activeInvestments: investments.filter(inv => inv.status === 'ACTIVE').length,
      completedInvestments: investments.filter(inv => inv.status === 'COMPLETED').length,
      cancelledInvestments: investments.filter(inv => inv.status === 'CANCELLED').length,
      nextPayout: investments.length > 0 ? investments[0].next_payout_date : null,
      portfolioBreakdown: investments.map(inv => ({
        id: inv.id,
        initialAmount: parseFloat(inv.initial_amount),
        currentBalance: parseFloat(inv.current_balance),
        roi: Number(((parseFloat(inv.total_earned) / parseFloat(inv.initial_amount)) * 100).toFixed(2)),
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
};

// Get investment transactions
const getInvestmentTransactions = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Verify investment belongs to user
    const investmentResult = await pool.query(
      'SELECT id FROM investments WHERE id = $1 AND investor_id = $2',
      [id, userId]
    );

    if (investmentResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Investment not found'
      });
    }

    const transactionsResult = await pool.query(
      'SELECT * FROM investment_transactions WHERE investment_id = $1 ORDER BY date DESC',
      [id]
    );

    return res.json({
      success: true,
      data: transactionsResult.rows
    });

  } catch (error) {
    console.error('Get transactions error:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Failed to fetch transactions' 
    });
  }
};

// Get investment sales
const getInvestmentSales = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Verify investment and get inventory
    const inventoryResult = await pool.query(
      `SELECT inv.id 
       FROM investment_inventory inv
       JOIN investments i ON inv.investment_id = i.id
       WHERE i.id = $1 AND i.investor_id = $2`,
      [id, userId]
    );

    if (inventoryResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Investment not found'
      });
    }

    const inventoryId = inventoryResult.rows[0].id;

    const salesResult = await pool.query(
      'SELECT * FROM investment_sales WHERE inventory_id = $1 ORDER BY date DESC',
      [inventoryId]
    );

    return res.json({
      success: true,
      data: salesResult.rows
    });

  } catch (error) {
    console.error('Get sales error:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Failed to fetch sales' 
    });
  }
};

// Close investment
const closeInvestment = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const investmentResult = await pool.query(
      'SELECT * FROM investments WHERE id = $1 AND investor_id = $2 AND status = $3',
      [id, userId, 'ACTIVE']
    );

    if (investmentResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Active investment not found'
      });
    }

    const investment = investmentResult.rows[0];

    // Check if investment can be closed (minimum 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    if (new Date(investment.created_at) > sixMonthsAgo) {
      return res.status(400).json({
        success: false,
        error: 'Investment must be active for at least 6 months before closing'
      });
    }

    const closedInvestmentResult = await pool.query(
      `UPDATE investments 
       SET status = $1, end_date = $2, current_balance = $3
       WHERE id = $4 
       RETURNING *`,
      ['COMPLETED', new Date(), 0, id]
    );

    return res.json({
      success: true,
      message: 'Investment closed successfully',
      data: closedInvestmentResult.rows[0]
    });

  } catch (error) {
    console.error('Close investment error:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Failed to close investment' 
    });
  }
};

// Get all investments (Admin function)
const getAllInvestments = async (req, res) => {
  try {
    // Check if user is admin (you'll need to implement your admin check logic)
    // if (req.user.role !== 'ADMIN') {
    //   return res.status(403).json({
    //     success: false,
    //     error: 'Unauthorized: Admin access required'
    //   });
    // }

    const {
      page = 1,
      limit = 10,
      status,
      investor_id,
      sortBy = 'created_at',
      sortOrder = 'DESC',
      search
    } = req.query;

    const offset = (page - 1) * limit;

    // Build WHERE clause dynamically
    let whereClause = 'WHERE 1=1';
    const queryParams = [];
    let paramCount = 1;

    if (status) {
      whereClause += ` AND i.status = $${paramCount}`;
      queryParams.push(status);
      paramCount++;
    }

    if (investor_id) {
      whereClause += ` AND i.investor_id = $${paramCount}`;
      queryParams.push(investor_id);
      paramCount++;
    }

    if (search) {
      whereClause += ` AND (
        u.name ILIKE $${paramCount} OR 
        u.email ILIKE $${paramCount} OR 
        u.contact ILIKE $${paramCount} OR
        inv.product_type ILIKE $${paramCount}
      )`;
      queryParams.push(`%${search}%`);
      paramCount++;
    }

    // Validate sort parameters to prevent SQL injection
    const validSortColumns = ['created_at', 'initial_amount', 'current_balance', 'total_earned', 'next_payout_date'];
    const validSortOrders = ['ASC', 'DESC'];
    
    const safeSortBy = validSortColumns.includes(sortBy) ? sortBy : 'created_at';
    const safeSortOrder = validSortOrders.includes(sortOrder.toUpperCase()) ? sortOrder.toUpperCase() : 'DESC';

    // Get investments with pagination
    const investmentsResult = await pool.query(
      `SELECT 
        i.*,
        u.name as investor_name,
        u.email as investor_email,
        u.contact as investor_contact,
        inv.product_type,
        inv.total_purchased,
        inv.sold,
        inv.remaining,
        inv.current_value as inventory_value,
        COUNT(*) OVER() as total_count
       FROM investments i
       LEFT JOIN users u ON i.investor_id = u.id
       LEFT JOIN investment_inventory inv ON i.id = inv.investment_id
       ${whereClause}
       ORDER BY i.${safeSortBy} ${safeSortOrder}
       LIMIT $${paramCount} OFFSET $${paramCount + 1}`,
      [...queryParams, limit, offset]
    );

    // Get summary statistics
    const statsResult = await pool.query(
      `SELECT 
        COUNT(*) as total_investments,
        COUNT(CASE WHEN status = 'ACTIVE' THEN 1 END) as active_investments,
        COUNT(CASE WHEN status = 'COMPLETED' THEN 1 END) as completed_investments,
        COUNT(CASE WHEN status = 'CANCELLED' THEN 1 END) as cancelled_investments,
        COUNT(CASE WHEN status = 'PENDING' THEN 1 END) as pending_investments,
        COALESCE(SUM(initial_amount), 0) as total_invested,
        COALESCE(SUM(total_earned), 0) as total_earned,
        COALESCE(SUM(current_balance), 0) as total_current_balance
       FROM investments`
    );

    const totalCount = investmentsResult.rows.length > 0 ? parseInt(investmentsResult.rows[0].total_count) : 0;

    // Format the response
    const investments = investmentsResult.rows.map(row => {
      const { total_count, ...investment } = row;
      return investment;
    });

    return res.json({
      success: true,
      data: {
        investments,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: totalCount,
          totalPages: Math.ceil(totalCount / limit),
          hasNext: page < Math.ceil(totalCount / limit),
          hasPrev: page > 1
        },
        statistics: {
          totalInvestments: parseInt(statsResult.rows[0].total_investments),
          activeInvestments: parseInt(statsResult.rows[0].active_investments),
          completedInvestments: parseInt(statsResult.rows[0].completed_investments),
          cancelledInvestments: parseInt(statsResult.rows[0].cancelled_investments),
          pendingInvestments: parseInt(statsResult.rows[0].pending_investments),
          totalInvested: parseFloat(statsResult.rows[0].total_invested),
          totalEarned: parseFloat(statsResult.rows[0].total_earned),
          totalCurrentBalance: parseFloat(statsResult.rows[0].total_current_balance)
        }
      }
    });

  } catch (error) {
    console.error('Get all investments error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch investments'
    });
  }
};

// Get investment details for admin (with all related data)
const getInvestmentDetailsAdmin = async (req, res) => {
  try {
    // Check if user is admin
    // if (req.user.role !== 'ADMIN') {
    //   return res.status(403).json({
    //     success: false,
    //     error: 'Unauthorized: Admin access required'
    //   });
    // }

    const { id } = req.params;

    // Get investment with investor details
    const investmentResult = await pool.query(
      `SELECT 
        i.*,
        u.name as investor_name,
        u.email as investor_email,
        u.contact as investor_contact,
        u.user_role as investor_role
       FROM investments i
       LEFT JOIN users u ON i.investor_id = u.id
       WHERE i.id = $1`,
      [id]
    );

    if (investmentResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Investment not found'
      });
    }

    const investment = investmentResult.rows[0];

    // Get all related data
    const [
      inventoryResult,
      transactionsResult,
      payoutsResult,
      salesResult
    ] = await Promise.all([
      pool.query(
        'SELECT * FROM investment_inventory WHERE investment_id = $1',
        [id]
      ),
      pool.query(
        'SELECT * FROM investment_transactions WHERE investment_id = $1 ORDER BY date DESC',
        [id]
      ),
      pool.query(
        'SELECT * FROM payouts WHERE investment_id = $1 ORDER BY scheduled_date DESC',
        [id]
      ),
      pool.query(
        `SELECT s.* FROM investment_sales s
         JOIN investment_inventory inv ON s.inventory_id = inv.id
         WHERE inv.investment_id = $1 ORDER BY s.date DESC`,
        [id]
      )
    ]);

    const investmentWithDetails = {
      ...investment,
      investor: {
        id: investment.investor_id,
        name: investment.investor_name,
        email: investment.investor_email,
        contact: investment.investor_contact,
        role: investment.investor_role
      },
      inventory: inventoryResult.rows.map(inv => ({
        ...inv,
        sales: salesResult.rows.filter(sale => sale.inventory_id === inv.id)
      })),
      transactions: transactionsResult.rows,
      payouts: payoutsResult.rows,
      performance: {
        totalReturn: parseFloat(investment.total_earned),
        currentValue: parseFloat(investment.current_balance),
        roi: investment.initial_amount > 0 ? 
          (parseFloat(investment.total_earned) / parseFloat(investment.initial_amount)) * 100 : 0,
        monthsActive: calculateMonthsActive(investment.start_date, investment.end_date)
      }
    };

    // Remove investor details from main level to avoid duplication
    delete investmentWithDetails.investor_name;
    delete investmentWithDetails.investor_email;
    delete investmentWithDetails.investor_contact;
    delete investmentWithDetails.investor_role;

    return res.json({
      success: true,
      data: investmentWithDetails
    });

  } catch (error) {
    console.error('Get investment details admin error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch investment details'
    });
  }
};

// Update investment status (Admin function)
const updateInvestmentStatus = async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    // Check if user is admin
    // if (req.user.role !== 'ADMIN') {
    //   await client.query('ROLLBACK');
    //   return res.status(403).json({
    //     success: false,
    //     error: 'Unauthorized: Admin access required'
    //   });
    // }

    const { id } = req.params;
    const { status, notes } = req.body;

    // Validate status
    const validStatuses = ['ACTIVE', 'COMPLETED', 'CANCELLED', 'PENDING'];
    if (!validStatuses.includes(status)) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        error: 'Invalid status. Must be one of: ACTIVE, COMPLETED, CANCELLED, PENDING'
      });
    }

    // Check if investment exists
    const investmentResult = await client.query(
      'SELECT * FROM investments WHERE id = $1',
      [id]
    );

    if (investmentResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({
        success: false,
        error: 'Investment not found'
      });
    }

    const updateData = { status };
    
    // Set end_date if completing or cancelling
    if (status === 'COMPLETED' || status === 'CANCELLED') {
      updateData.end_date = new Date();
    }

    // Update investment
    const updatedInvestmentResult = await client.query(
      `UPDATE investments 
       SET status = $1, end_date = $2, updated_at = CURRENT_TIMESTAMP
       WHERE id = $3 
       RETURNING *`,
      [status, updateData.end_date, id]
    );

    // Create status change transaction
    if (notes) {
      await client.query(
        `INSERT INTO investment_transactions 
         (investment_id, type, amount, description, status) 
         VALUES ($1, $2, $3, $4, $5)`,
        [id, 'status_change', 0, `Status changed to ${status}: ${notes}`, 'completed']
      );
    }

    await client.query('COMMIT');

    return res.json({
      success: true,
      message: `Investment status updated to ${status} successfully`,
      data: updatedInvestmentResult.rows[0]
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Update investment status error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to update investment status'
    });
  } finally {
    client.release();
  }
};

// Helper function to get complete investment data
async function getCompleteInvestmentData(investmentId) {
  const [investmentResult, inventoryResult, transactionsResult, payoutsResult, salesResult] = await Promise.all([
    pool.query('SELECT * FROM investments WHERE id = $1', [investmentId]),
    pool.query('SELECT * FROM investment_inventory WHERE investment_id = $1', [investmentId]),
    pool.query('SELECT * FROM investment_transactions WHERE investment_id = $1 ORDER BY date DESC', [investmentId]),
    pool.query('SELECT * FROM payouts WHERE investment_id = $1 ORDER BY scheduled_date DESC', [investmentId]),
    pool.query(
      `SELECT s.* FROM investment_sales s
       JOIN investment_inventory inv ON s.inventory_id = inv.id
       WHERE inv.investment_id = $1 ORDER BY s.date DESC`,
      [investmentId]
    )
  ]);

  return {
    ...investmentResult.rows[0],
    inventory: [{
      ...inventoryResult.rows[0],
      sales: salesResult.rows
    }],
    transactions: transactionsResult.rows,
    payouts: payoutsResult.rows
  };
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
  getInvestmentDetailsAdmin,
  updateInvestmentStatus
};