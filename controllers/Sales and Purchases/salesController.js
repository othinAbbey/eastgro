// Import dependencies
import { PrismaClient } from '@prisma/client';
import { recordExists, updateProductQuantity } from '../../utils/dbUtils.js';
// import { recordTransactionOnBlockchain } from '../utils/blockchain.js';

const prisma = new PrismaClient();

// Market Controller Functions

/**
 * Fetch available biofortified crop listings
 * @route GET /market/listings
 */
const getMarketListings = async (req, res) => {
  try {
    const listings = await prisma.produce.findMany({
      where: { status: 'HARVESTED' },
      include: { farmer: true },
    });
    res.json(listings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Group farmers growing the same biofortified crops for aggregation
 * @route POST /market/group
 * @param {string} cropType - Type of crop to group farmers by
 */
const groupFarmersByCrop = async (req, res) => {
  try {
    const { cropType } = req.body;
    const groupedFarmers = await prisma.produce.findMany({
      where: { type: cropType },
      include: { farmer: true },
    });
    res.json({ cropType, groupedFarmers });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Allow buyers to place offers on crops, recording transaction on blockchain
 * @route POST /market/offer
 * @param {string} produceId - ID of the produce
 * @param {string} buyerId - ID of the buyer
 * @param {number} offerPrice - Offer price for the produce
 */
const placeOffer = async (req, res) => {
  try {
    const { produceId, buyerId, offerPrice } = req.body;
    const transaction = await prisma.transaction.create({
      data: {
        produceId,
        buyerId,
        offerPrice,
        status: 'PENDING',
      },
    });
    // Record the offer on the blockchain for traceability
    await recordTransactionOnBlockchain(transaction);
    res.status(201).json(transaction);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Retrieve a buyer's transaction history
 * @route GET /market/transactions/:userId
 * @param {string} userId - ID of the buyer
 */
const getTransactionHistory = async (req, res) => {
  try {
    const { userId } = req.params;
    const transactions = await prisma.transaction.findMany({
      where: { buyerId: userId },
      include: {
        produce: { include: { farmer: true } },
      },
    });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


//Product Crud operations

// const createProduct = async (req, res) => {
//   try {
//     const { name, price, units, quantity, farmerId, facilityId, transporterId } = req.body;

//     const product = await prisma.product.create({
//       data: {
//         name,
//         price,
//         units,
//         quantity,
//         farmer: farmerId ? { connect: { id: farmerId } } : undefined,
//         Processing_Facility: facilityId ? { connect: { id: facilityId } } : undefined,
//         transporter: transporterId ? { connect: { id: transporterId } } : undefined,
//       },
//     });

//     res.status(201).json(product);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };
const createProduct = async (req, res) => {
  try {
    const { name, price, units, quantity, farmerId, facilityId, transporterId } = req.body;

    // Check if farmer exists if farmerId is provided
    if (farmerId) {
      const farmerExists = await prisma.farmer.findUnique({
        where: { id: farmerId },
      });
      if (!farmerExists) {
        return res.status(404).json({ error: "Farmer not found" });
      }
    }

    // Check if facility exists if facilityId is provided
    if (facilityId) {
      const facilityExists = await prisma.facility.findUnique({
        where: { id: facilityId },
      });
      if (!facilityExists) {
        return res.status(404).json({ error: "Facility not found" });
      }
    }

    // Check if transporter exists if transporterId is provided
    if (transporterId) {
      const transporterExists = await prisma.transporter.findUnique({
        where: { id: transporterId },
      });
      if (!transporterExists) {
        return res.status(404).json({ error: "Transporter not found" });
      }
    }

    // Create the product
    const product = await prisma.product.create({
      data: {
        name,
        price,
        units,
        quantity,
        farmer: farmerId ? { connect: { id: farmerId } } : undefined,
        Processing_Facility: facilityId ? { connect: { id: facilityId } } : undefined,
        transporter: transporterId ? { connect: { id: transporterId } } : undefined,
      },
    });

    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getAllProducts = async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      include: {
        farmer: true,
        Processing_Facility: true,
        transporter: true,
      },
    });
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        farmer: true,
        Processing_Facility: true,
        transporter: true,
      },
    });
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, units, quantity, farmerId, facilityId, transporterId } = req.body;
    const product = await prisma.product.update({
      where: { id },
      data: {
        name,
        price,
        units,
        quantity,
        farmer: farmerId ? { connect: { id: farmerId } } : undefined,
        Processing_Facility: facilityId ? { connect: { id: facilityId } } : undefined,
        transporter: transporterId ? { connect: { id: transporterId } } : undefined,
      },
    });
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    // Delete the product
    await prisma.product.delete({
      where: { id },
    });

    // Success message for delete
    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


const createTransaction = async (req, res) => {
  try {
    const { buyerId, products = [], produce = [], services = [], inputs = [], serviceOffering = [] } = req.body;

    // Validate buyer exists
    const buyer = await prisma.customer.findUnique({ where: { id: buyerId } });
    if (!buyer) return res.status(404).json({ error: "Customer not found" });

    let totalAmount = 0;

    const processedItems = {
      products: [],
      produce: [],
      inputs: [],
      serviceOffering: []
    };

    // Process Products
    for (const item of products) {
      const product = await prisma.product.findUnique({ where: { id: item.productId } });
      if (!product) throw new Error(`Product not found: ${item.productId}`);
      if (product.quantity < item.quantity) throw new Error(`Insufficient stock for ${product.name}`);

      const itemTotal = product.price * item.quantity;
      totalAmount += itemTotal;

      processedItems.products.push({
        productId: product.id,
        quantity: item.quantity,
        price: product.price
      });
    }

    // Process Produce
    for (const item of produce) {
      const produceItem = await prisma.produce.findUnique({ where: { id: item.produceId } });
      if (!produceItem) throw new Error(`Produce not found: ${item.produceId}`);
      if (!['HARVESTED', 'PROCESSED', 'DELIVERED'].includes(produceItem.status) || produceItem.quantity < item.quantity) {
        throw new Error(`Produce not available or quantity too low`);
      }

      const itemTotal = produceItem.price * item.quantity;
      totalAmount += itemTotal;

      processedItems.produce.push({
        produceId: produceItem.id,
        quantity: item.quantity,
        price: produceItem.price
      });
    }

    // Process Inputs
    for (const item of inputs) {
      const input = await prisma.farmInput.findUnique({ where: { id: item.inputId } });
      if (!input) throw new Error(`Input not found: ${item.inputId}`);
      if (input.quantity < item.quantity) throw new Error(`Insufficient stock for ${input.name}`);

      const itemTotal = input.price * item.quantity;
      totalAmount += itemTotal;

      processedItems.inputs.push({
        inputId: input.id,
        quantity: item.quantity,
        price: input.pricez
      });
    }

    // Process Service Offering
    for (const item of serviceOffering) {
      const offering = await prisma.serviceOffering.findUnique({
        where: { id: item.offeringId },
        include: { service: true }
      });

      if (!offering) throw new Error(`Service offering not found: ${item.offeringId}`);
      if (!offering.isActive) throw new Error(`Service offering is inactive`);
      if (offering.minQuantity > (item.quantity || 1)) {
        throw new Error(`Minimum quantity not met for ${offering.service.name}`);
      }

      const itemTotal = offering.rate * (item.quantity || 1);
      totalAmount += itemTotal;

      processedItems.serviceOffering.push({
        offeringId: offering.id,
        serviceId: offering.serviceId,
        providerId: offering.serviceProviderId,
        quantity: item.quantity || 1,
        rate: offering.rate,
        notes: item.notes || offering.notes
      });
    }

    if (isNaN(totalAmount)) throw new Error("Invalid total amount calculation");

    const transaction = await prisma.$transaction(async (prisma) => {
      const newTransaction = await prisma.transaction.create({
        data: {
          buyer: { connect: { id: buyerId } },
          totalAmount,
          status: "PENDING",
          paymentMethod: "CASH",
          ...(processedItems.products.length > 0 && {
            products: { connect: processedItems.products.map(p => ({ id: p.productId })) }
          }),
          ...(processedItems.produce.length > 0 && {
            produce: { connect: processedItems.produce.map(p => ({ id: p.produceId })) }
          }),
          ...(processedItems.inputs.length > 0 && {
            FarmInput: { connect: processedItems.inputs.map(i => ({ id: i.inputId })) }
          }),
          ...(processedItems.serviceOffering.length > 0 && {
            serviceOfferings: {
              create: processedItems.serviceOffering.map(s => ({
                offeringId: s.offeringId,
                providerId: s.providerId,
                serviceId: s.serviceId,
                quantity: s.quantity,
                rate: s.rate,
                notes: s.notes
              }))
            }
          })
        },
        include: {
          buyer: true,
          products: true,
          produce: true,
          FarmInput: true,
          // serviceOffering: true
        }
      });

      // Update stocks
      await Promise.all([
        ...processedItems.products.map(item =>
          prisma.product.update({
            where: { id: item.productId },
            data: { quantity: { decrement: item.quantity } }
          })
        ),
        ...processedItems.produce.map(item =>
          prisma.produce.update({
            where: { id: item.produceId },
            data: {
              quantity: { decrement: item.quantity },
              status: item.quantity <= 0 ? "DELIVERED" : "HARVESTED"
            }
          })
        ),
        ...processedItems.inputs.map(item =>
          prisma.farmInput.update({
            where: { id: item.inputId },
            data: { quantity: { decrement: item.quantity } }
          })
        )
      ]);

      return newTransaction;
    });

    res.status(201).json({
      success: true,
      message: "Transaction created successfully",
      transaction,
      summary: {
        totalAmount,
        items: {
          products: processedItems.products.length,
          produce: processedItems.produce.length,
          inputs: processedItems.inputs.length,
          serviceOffering: processedItems.serviceOffering.length
        }
      }
    });

  } catch (error) {
    console.error("Transaction Error:", error);
    res.status(500).json({
      error: "Transaction failed",
      message: error.message,
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    });
  }
};

const getAllTransactions = async (req, res) => {
  try {
    const transactions = await prisma.transaction.findMany({
      include: {
        products: true,
        buyer: true,
      },
    });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getTransactionById = async (req, res) => {
  try {
    const { id } = req.params;
    // Fetch the transaction
    const transaction = await prisma.transaction.findUnique({
      where: { id },
      include: {
        buyer: true, // Include buyer details
        products: true, // Include products
      },
    });

    // If transaction is not found, return a 404 error
    if (!transaction) {
      return res.status(404).json({ error: "Transaction not found" });
    }

    console.log("Transaction:", transaction); // Debugging: Log the transaction

    // Resolve the subject based on the type (if subjectId and type exist)
    let subject = null;
    if (transaction.subjectId && transaction.type) {
      if (transaction.type === "PRODUCT") {
        subject = await prisma.product.findUnique({
          where: { id: transaction.subjectId },
        });
      } else if (transaction.type === "PRODUCE") {
        subject = await prisma.produce.findUnique({
          where: { id: transaction.subjectId },
        });
      } else {
        console.warn("Invalid transaction type:", transaction.type); // Debugging: Log invalid type
        return res.status(400).json({ error: `Invalid transaction type: ${transaction.type}` });
      }

      if (!subject) {
        console.warn("Subject not found for transaction:", transaction.id); // Debugging: Log missing subject
        return res.status(404).json({ error: "Subject not found" });
      }
    } else {
      console.warn("Missing subjectId or type in transaction:", transaction.id); // Debugging: Log missing fields
    }

    // Combine the transaction with the resolved subject
    const response = {
      ...transaction,
      subject: subject || null, // Set subject to null if not found
    };

    res.json(response);
  } catch (error) {
    console.error("Error fetching transaction:", error); // Debugging: Log the error
    res.status(500).json({ error: error.message });
  }
};
const getfarmerTransactions = async (req, res) => {
  try {
    const { id } = req.params;

    // Fetch the farmer's transactions
    const getFarmerData = async (id) => {
      return await prisma.farmer.findUnique({
        where: { id },
        include: {
          products: {
            include: {
              transactions: true,
            },
          },
          produce: {
            include: {
              transactions: true,
            },
          },
        },
      });
    };

    const farmerData = await getFarmerData(id);

    if (!farmerData) {
      return res.status(404).json({ message: 'Farmer not found' });
    }

    // Extract transactions from products and produce
    const transactions = [
      ...farmerData.products.flatMap(product => product.transactions),
      ...farmerData.produce.flatMap(produce => produce.transactions),
    ];

    if (transactions.length === 0) {
      return res.status(200).json({ message: 'No transactions found', transactions: [] });
    }

    res.status(200).json(transactions);
  } catch (error) {
    console.error('Error fetching farmer transactions:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};


const getTransactionsByCustomerId = async (req, res) => {
  const { id } = req.params;
  
    try {
      const transactions = await prisma.transaction.findMany({
        where: { id},
        include: { products: true }, // Include products associated with the transaction
      });
  
      if (!transactions || transactions.length === 0) {
        return res.status(404).json({ message: 'No transactions found for this customer' });
      }
  
      res.status(200).json(transactions);
    } catch (err) { 
      console.error('Error details:', err); // Log error for debugging
      res.status(500).send('Error fetching transactions');
    }
  }
const updateTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validate status
    const validStatuses = ["PENDING", "COMPLETED", "CANCELLED"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    // Update the transaction
    const transaction = await prisma.transaction.update({
      where: { id },
      data: { status },
    });

    res.json(transaction);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// const deleteTransaction = async (req, res) => {
//   try {
//     const { id } = req.params;
//     await prisma.transaction.delete({
//       where: { id },
//     });
//     res.status(204).send();
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };
// const deleteTransaction = async (req, res) => {
//   try {
//     const { id } = req.params;

//     // Fetch the transaction to get the product details
//     const transaction = await prisma.transaction.findUnique({
//       where: { id },
//       include: {
//         products: true,
//       },
//     });
//     if (!transaction) {
//       return res.status(404).json({ error: "Transaction not found" });
//     }

//     // Restore product quantities
//     for (const product of transaction.products) {
//       await prisma.product.update({
//         where: { id: product.id },
//         data: {
//           quantity: {
//             increment: product.quantity,
//           },
//         },
//       });
//     }

//     // Delete the transaction
//     await prisma.transaction.delete({
//       where: { id },
//     });

//     res.status(200).json({ message: "Transaction deleted successfully" });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

const deleteTransaction = async (req, res) => {
  try {
    const { id } = req.params;

    // Fetch the transaction to get product details
    const transaction = await prisma.transaction.findUnique({
      where: { id },
      include: { products: true },
    });

    if (!transaction) {
      return res.status(404).json({ error: "Transaction not found" });
    }

    // Use Prisma transaction for atomicity
    await prisma.$transaction(async (prisma) => {
      // Restore product quantities
      for (const product of transaction.products) {
        await updateProductQuantity(product.id, product.quantity);
      }

      // Delete the transaction
      await prisma.transaction.delete({ where: { id } });
    });

    res.status(200).json({ message: "Transaction deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};




export default {
  getMarketListings,
  groupFarmersByCrop,
  placeOffer,
  getTransactionHistory,
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  createTransaction,
  getAllTransactions,
  getTransactionById,
  updateTransaction,
  deleteTransaction,
  getfarmerTransactions,
  getTransactionsByCustomerId
  // createFarmInput,
  // getAllFarmInputs,
  // getFarmInputById,
  // updateFarmInput,
  // deleteFarmInput,

};