// Import dependencies
import { PrismaClient } from '@prisma/client';
import { recordExists, updateProductQuantity } from '../utils/dbUtils.js';
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


//Transactions 
// const createTransaction = async (req, res) => {
//   try {
//     const { produceId, buyerId, offerPrice } = req.body;

//     // Check if produce exists
//     const produce = await prisma.produce.findUnique({
//       where: { id: produceId },
//     });
//     if (!produce) {
//       return res.status(404).json({ error: "Produce not found" });
//     }

//     // Check if buyer exists
//     const buyer = await prisma.customer.findUnique({
//       where: { id: buyerId },
//     });
//     if (!buyer) {
//       return res.status(404).json({ error: "Buyer not found" });
//     }

//     // Create the transaction
//     const transaction = await prisma.transaction.create({
//       data: {
//         produceId,
//         buyerId,
//         offerPrice,
//         status: "PENDING",
//       },
//     });

//     res.status(201).json(transaction);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };
// const createTransaction = async (req, res) => {
//   try {
//     const { buyerId, products,type, subjectId} = req.body;

//     // Check if buyer exists
//     const buyer = await prisma.customer.findUnique({
//       where: { id: buyerId },
//     });
//     if (!buyer) {
//       return res.status(404).json({ error: "Buyer not found" });
//     }

    

//     // Validate products and calculate total amount
//     let totalAmount = 0;

//     for (const item of products) {
//       if (!item.productId) {
//         return res.status(400).json({ error: "Product ID is required for each item" });
//       }
    
//       const product = await prisma.product.findUnique({
//         where: { id: item.productId },
//       });
    
//       if (!product) {
//         return res.status(404).json({ error: `Product not found: ${item.productId}` });
//       }
    
//       if (product.quantity < item.quantity) {
//         return res.status(400).json({ error: `Insufficient quantity for product: ${product.name}` });
//       }
//       totalAmount += product.price * item.quantity;
//     }
    
//     // Create the transaction
//     const transaction = await prisma.transaction.create({
//       data: {
//         buyerId,
//         totalAmount,
//         status: "PENDING",
//         products: {
//           connect: products.map((item) => ({ id: item.productId })),
//         },
//         type,
//         subjectId
//       },
//       include: {
//         products: true,
//         buyer: true,
//       },
//     });

//     // Update product quantities
//     for (const item of products) {
//       await prisma.product.update({
//         where: { id: item.productId },
//         data: {
//           quantity: {
//             decrement: item.quantity,
//           },
//         },
//       });
//     }

//     res.status(201).json(transaction);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };
const createTransaction = async (req, res) => {
  try {
    const { buyerId, products, type, subjectId } = req.body;

    // Validate buyer
    if (!(await recordExists('customer', buyerId))) {
      return res.status(404).json({ error: "Buyer not found" });
    }

    // Validate products and calculate total amount
    let totalAmount = 0;
    for (const item of products) {
      if (!item.productId || !item.quantity) {
        return res.status(400).json({ error: "Product ID and quantity are required for each item" });
      }

      const product = await prisma.product.findUnique({
        where: { id: item.productId },
      });

      if (!product) {
        return res.status(404).json({ error: `Product not found: ${item.productId}` });
      }

      if (product.quantity < item.quantity) {
        return res.status(400).json({ error: `Insufficient quantity for product: ${product.name}` });
      }

      totalAmount += product.price * item.quantity;
    }

    // Use Prisma transaction for atomicity
    const transaction = await prisma.$transaction(async (prisma) => {
      // Create the transaction
      const newTransaction = await prisma.transaction.create({
        data: {
          buyerId,
          totalAmount,
          status: "PENDING",
          type,
          subjectId,
          products: {
            connect: products.map((item) => ({ id: item.productId })),
          },
        },
        include: {
          products: true,
          buyer: true,
        },
      });

      // Update product quantities
      for (const item of products) {
        await updateProductQuantity(item.productId, -item.quantity);
      }

      return newTransaction;
    });

    res.status(201).json(transaction);
  } catch (error) {
    res.status(500).json({ error: error.message });
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

// const getTransactionById = async (req, res) => {
//   try {
//     const { id } = req.params;

//     // Fetch the transaction
//     const transaction = await prisma.transaction.findUnique({
//       where: { id },
//       include: {
//         buyer: true, // Include buyer details
//       },
//     });

//     if (!transaction) {
//       return res.status(404).json({ error: "Transaction not found" });
//     }

//     // Resolve the subject (Product or Produce) based on the type
//     let subject;
//     if (transaction.type === "PRODUCT") {
//       subject = await prisma.product.findUnique({
//         where: { id: transaction.subjectId },
//       });
//     } else if (transaction.type === "PRODUCE") {
//       subject = await prisma.produce.findUnique({
//         where: { id: transaction.subjectId },
//       });
//     } else {
//       // Handle unknown types (optional)
//       return res.status(400).json({ error: "Invalid transaction type" });
//     }

//     if (!subject) {
//       return res.status(404).json({ error: "Subject not found" });
//     }

//     // Combine the transaction with the resolved subject
//     const response = {
//       ...transaction,
//       subject, // Add the resolved subject to the response
//     };

//     res.json(response);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };
const getTransactionById = async (req, res) => {
  try {
    const { id } = req.params;

    // Fetch the transaction
    const transaction = await prisma.transaction.findUnique({
      where: { id },
      include: { buyer: true, products: true },
    });

    if (!transaction) {
      return res.status(404).json({ error: "Transaction not found" });
    }

    // Resolve the subject based on the type
    let subject;
    if (transaction.type === "PRODUCT") {
      subject = await prisma.product.findUnique({
        where: { id: transaction.subjectId },
      });
    } else if (transaction.type === "PRODUCE") {
      subject = await prisma.produce.findUnique({
        where: { id: transaction.subjectId },
      });
    } else {
      return res.status(400).json({ error: "Invalid transaction type" });
    }

    if (!subject) {
      return res.status(404).json({ error: "Subject not found" });
    }

    // Combine the transaction with the resolved subject
    const response = {
      ...transaction,
      subject,
    };

    res.json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

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
};