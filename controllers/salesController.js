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
// const createTransaction = async (req, res) => {
//   try {
//     const { buyerId, products, type, subjectId } = req.body;

//     // Validate buyer
//     if (!(await recordExists('customer', buyerId))) {
//       return res.status(404).json({ error: "Buyer not found" });
//     }

//     // Validate products and calculate total amount
//     let totalAmount = 0;
//     for (const item of products) {
//       if (!item.productId || !item.quantity) {
//         return res.status(400).json({ error: "Product ID and quantity are required for each item" });
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

//     // Use Prisma transaction for atomicity
//     const transaction = await prisma.$transaction(async (prisma) => {
//       // Create the transaction
//       const newTransaction = await prisma.transaction.create({
//         data: {
//           buyerId,
//           totalAmount,
//           status: "PENDING",
//           type,
//           subjectId,
//           products: {
//             connect: products.map((item) => ({ id: item.productId })),
//           },
//         },
//         include: {
//           products: true,
//           buyer: true,
//         },
//       });

//       // Update product quantities
//       for (const item of products) {
//         await updateProductQuantity(item.productId, -item.quantity);
//       }

//       return newTransaction;
//     });

//     res.status(201).json(transaction);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };
// const createTransaction = async (req, res) => {
//   try {
//     const { buyerId, products, produceId, totalAmount } = req.body;

//     // Validate required fields
//     if (!buyerId || (!products && !produceId)) {
//       return res.status(400).json({ error: "buyerId and either products or produceId are required" });
//     }

//     // Validate buyer
//     if (!(await recordExists('customer', buyerId))) {
//       return res.status(404).json({ error: "Buyer not found" });
//     }

//     // Validate produce (if provided)
//     if (produceId && !(await recordExists('produce', produceId))) {
//       return res.status(404).json({ error: "Produce not found" });
//     }

//     // Validate products (if provided)
//     if (products) {
//       for (const item of products) {
//         if (!item.productId || !item.quantity) {
//           return res.status(400).json({ error: "Product ID and quantity are required for each item" });
//         }

//         const product = await prisma.product.findUnique({
//           where: { id: item.productId },
//         });

//         if (!product) {
//           return res.status(404).json({ error: `Product not found: ${item.productId}` });
//         }

//         if (product.quantity < item.quantity) {
//           return res.status(400).json({ error: `Insufficient quantity for product: ${product.name}` });
//         }
//       }
//     }

//     // Use Prisma transaction for atomicity
//     const transaction = await prisma.$transaction(async (prisma) => {
//       // Create the transaction
//       const newTransaction = await prisma.transaction.create({
//         data: {
//           buyerId,
//           totalAmount,
//           status: "PENDING",
//           produceId: produceId || null, // Set produceId if provided, otherwise null
//           products: products
//             ? {
//                 connect: products.map((item) => ({ id: item.productId })),
//               }
//             : undefined, // Connect products if provided
//         },
//         include: {
//           products: true,
//           produce: true,
//           buyer: true,
//         },
//       });

//       // Update product quantities (if products are provided)
//       if (products) {
//         for (const item of products) {
//           await prisma.product.update({
//             where: { id: item.productId },
//             data: {
//               quantity: {
//                 decrement: item.quantity,
//               },
//             },
//           });
//         }
//       }

//       // Update produce status (if produce is provided)
//       if (produceId) {
//         await prisma.produce.update({
//           where: { id: produceId },
//           data: {
//             status: "DELIVERED", // Update produce status as needed
//           },
//         });
//       }

//       return newTransaction;
//     });

//     res.status(201).json(transaction);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };




// const createTransaction = async (req, res) => {
//   try {
//     const { buyerId, products = [], produce = [], services = [], inputs = [] } = req.body;

//     // Validate buyer exists
//     const buyer = await prisma.customer.findUnique({ 
//       where: { id: buyerId }
//     });
//     if (!buyer) {
//       return res.status(404).json({ error: "Customer not found" });
//     }

//     let totalAmount = 0;
//     const processedItems = {
//       products: [],
//       produce: [],
//       inputs: []
//     };

//     // Process Products
//     for (const item of products) {
//       const product = await prisma.product.findUnique({
//         where: { id: item.productId }
//       });
      
//       if (!product) throw new Error(`Product not found: ${item.productId}`);
//       if (product.quantity < item.quantity) {
//         throw new Error(`Insufficient stock for ${product.name}`);
//       }

//       const itemTotal = product.price * item.quantity;
//       totalAmount += itemTotal;
//       processedItems.products.push({
//         productId: product.id,
//         quantity: item.quantity,
//         price: product.price
//       });
//     }

//     // Process Produce
//     // for (const item of produce) {
//     //   const produceItem = await prisma.produce.findUnique({
//     //     where: { id: item.produceId }
//     //   });
      
//     //   if (!produceItem) throw new Error(`Produce not found: ${item.produceId}`);
//     //   if (produceItem.quantity < item.quantity) {
//     //     throw new Error(`Insufficient quantity for ${produceItem.type}`);
//     //   }
//     //   if (!['HARVESTED', 'PROCESSED'].includes(produceItem.status)) {
//     //     throw new Error(`Produce status invalid for sale: ${produceItem.status}`);
//     //   }

//     //   const itemTotal = produceItem.price * item.quantity;
//     //   totalAmount += itemTotal;
//     //   processedItems.produce.push({
//     //     produceId: produceItem.id,
//     //     quantity: item.quantity,
//     //     price: produceItem.price
//     //   });
//     // }
// // Process Produce
// for (const item of produce) {
//   const produceItem = await prisma.produce.findUnique({
//     where: { id: item.produceId }
//   });

//   // Check if produce exists
//   if (!produceItem) {
//     throw new Error(`Produce not found: ${item.produceId}`);
//   }

//   // Check if produce can be sold (status + quantity validation)
//   if (
//     !['HARVESTED', 'PROCESSED', 'DELIVERED'].includes(produceItem.status) ||
//     produceItem.quantity < item.quantity
//   ) {
//     throw new Error(
//       produceItem.quantity < item.quantity
//         ? `Insufficient quantity for ${produceItem.type} (Available: ${produceItem.quantity}, Requested: ${item.quantity})`
//         : `Produce cannot be sold (Status: ${produceItem.status})`
//     );
//   }

//   // Calculate total price
//   const itemTotal = produceItem.price * item.quantity;
//   totalAmount += itemTotal;

//   // Track processed produce
//   processedItems.produce.push({
//     produceId: produceItem.id,
//     quantity: item.quantity,
//     price: produceItem.price
//   });
// }
//     // Process Inputs
//     for (const item of inputs) {
//       const input = await prisma.farmInput.findUnique({
//         where: { id: item.inputId }
//       });
      
//       if (!input) throw new Error(`Input not found: ${item.inputId}`);
//       if (input.quantity < item.quantity) {
//         throw new Error(`Insufficient stock for ${input.name}`);
//       }

//       const itemTotal = input.price * item.quantity;
//       totalAmount += itemTotal;
//       processedItems.inputs.push({
//         inputId: input.id,
//         quantity: item.quantity,
//         price: input.price
//       });
//     }

//     // Validate totalAmount
//     if (isNaN(totalAmount)) {
//       throw new Error("Invalid total amount calculation");
//     }

//     // Create Transaction
//     const transaction = await prisma.$transaction(async (prisma) => {
//       // 1. Create Transaction
//       const newTransaction = await prisma.transaction.create({
//         data: {
//           buyer: { connect: { id: buyerId } },
//           totalAmount: totalAmount, // THIS WAS MISSING IN YOUR IMPLEMENTATION
//           status: "PENDING",
//           paymentMethod: "CASH",
//           ...(processedItems.products.length > 0 && {
//             products: { 
//               connect: processedItems.products.map(p => ({ id: p.productId }))
//             }
//           }),
//           ...(processedItems.produce.length > 0 && {
//             produce: { 
//               connect: processedItems.produce.map(p => ({ id: p.produceId }))
//             }
//           }),
//           ...(processedItems.inputs.length > 0 && {
//             FarmInput: { 
//               connect: processedItems.inputs.map(i => ({ id: i.inputId }))
//             }
//           })
//         },
//         include: {
//           buyer: true,
//           products: true,
//           produce: true,
//           FarmInput: true
//         }
//       });

//       // 2. Update Quantities
//       await Promise.all([
//         ...processedItems.products.map(item =>
//           prisma.product.update({
//             where: { id: item.productId },
//             data: { quantity: { decrement: item.quantity } }
//           })
//         ),
//         // ...processedItems.produce.map(item =>
//         //   prisma.produce.update({
//         //     where: { id: item.produceId },
//         //     data: { 
//         //       quantity: { decrement: item.quantity },
//         //       status: "DELIVERED"
//         //     }
//         //   })
//         // ),
//         // Inside the transaction (where you update quantities)
// ...processedItems.produce.map(item =>
//   prisma.produce.update({
//     where: { id: item.produceId },
//     data: { 
//       quantity: { decrement: item.quantity },
//       // Only mark as DELIVERED if quantity reaches 0
//       status: produceItem.quantity - item.quantity <= 0 ? "DELIVERED" : produceItem.status
//     }
//   })
// ),
//         ...processedItems.inputs.map(item =>
//           prisma.farmInput.update({
//             where: { id: item.inputId },
//             data: { quantity: { decrement: item.quantity } }
//           })
//         )
//       ]);

//       return newTransaction;
//     });

//     res.status(201).json({
//       success: true,
//       message: "Transaction created successfully",
//       transaction,
//       summary: {
//         totalAmount,
//         items: {
//           products: processedItems.products.length,
//           produce: processedItems.produce.length,
//           inputs: processedItems.inputs.length
//         }
//       }
//     });

//   } catch (error) {
//     console.error("Transaction Error:", error);
//     res.status(500).json({
//       error: "Transaction failed",
//       message: error.message,
//       ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
//     });
//   }
// };
// const createTransaction = async (req, res) => {
//   try {
//     const { buyerId, products = [], produce = [], services = [], inputs = [] } = req.body;

//     // Validate buyer exists
//     const buyer = await prisma.customer.findUnique({ 
//       where: { id: buyerId }
//     });
//     if (!buyer) {
//       return res.status(404).json({ error: "Customer not found" });
//     }

//     let totalAmount = 0;
//     const processedItems = {
//       products: [],
//       produce: [], // This will now store both the item and produce data
//       inputs: []
//     };

//     // Process Products
//     for (const item of products) {
//       const product = await prisma.product.findUnique({
//         where: { id: item.productId }
//       });
      
//       if (!product) throw new Error(`Product not found: ${item.productId}`);
//       if (product.quantity < item.quantity) {
//         throw new Error(`Insufficient stock for ${product.name}`);
//       }

//       const itemTotal = product.price * item.quantity;
//       totalAmount += itemTotal;
//       processedItems.products.push({
//         productId: product.id,
//         quantity: item.quantity,
//         price: product.price
//       });
//     }

//     // Process Produce
//     for (const item of produce) {
//       const produceItem = await prisma.produce.findUnique({
//         where: { id: item.produceId }
//       });

//       if (!produceItem) {
//         throw new Error(`Produce not found: ${item.produceId}`);
//       }

//       if (
//         !['HARVESTED', 'PROCESSED', 'DELIVERED'].includes(produceItem.status) ||
//         produceItem.quantity < item.quantity
//       ) {
//         throw new Error(
//           produceItem.quantity < item.quantity
//             ? `Insufficient quantity for ${produceItem.type} (Available: ${produceItem.quantity}, Requested: ${item.quantity})`
//             : `Produce cannot be sold (Status: ${produceItem.status})`
//         );
//       }

//       const itemTotal = produceItem.price * item.quantity;
//       totalAmount += itemTotal;

//       processedItems.produce.push({
//         item, // Store the request item
//         produceItem, // Store the full produce record
//         produceId: produceItem.id,
//         quantity: item.quantity,
//         price: produceItem.price
//       });
//     }

//     // Process Inputs
//     for (const item of inputs) {
//       const input = await prisma.farmInput.findUnique({
//         where: { id: item.inputId }
//       });
      
//       if (!input) throw new Error(`Input not found: ${item.inputId}`);
//       if (input.quantity < item.quantity) {
//         throw new Error(`Insufficient stock for ${input.name}`);
//       }

//       const itemTotal = input.price * item.quantity;
//       totalAmount += itemTotal;
//       processedItems.inputs.push({
//         inputId: input.id,
//         quantity: item.quantity,
//         price: input.price
//       });
//     }

//     // Validate totalAmount
//     if (isNaN(totalAmount)) {
//       throw new Error("Invalid total amount calculation");
//     }

//     // Create Transaction
//     const transaction = await prisma.$transaction(async (prisma) => {
//       // 1. Create Transaction
//       const newTransaction = await prisma.transaction.create({
//         data: {
//           buyer: { connect: { id: buyerId } },
//           totalAmount: totalAmount,
//           status: "PENDING",
//           paymentMethod: "CASH",
//           ...(processedItems.products.length > 0 && {
//             products: { 
//               connect: processedItems.products.map(p => ({ id: p.productId }))
//             }
//           }),
//           ...(processedItems.produce.length > 0 && {
//             produce: { 
//               connect: processedItems.produce.map(p => ({ id: p.produceId }))
//             }
//           }),
//           ...(processedItems.inputs.length > 0 && {
//             FarmInput: { 
//               connect: processedItems.inputs.map(i => ({ id: i.inputId }))
//             }
//           })
//         },
//         include: {
//           buyer: true,
//           products: true,
//           produce: true,
//           FarmInput: true
//         }
//       });

//       // 2. Update Quantities
//       await Promise.all([
//         ...processedItems.products.map(item =>
//           prisma.product.update({
//             where: { id: item.productId },
//             data: { quantity: { decrement: item.quantity } }
//           })
//         ),
//         ...processedItems.produce.map(item => {
//           const newQuantity = item.produceItem.quantity - item.quantity;
//           return prisma.produce.update({
//             where: { id: item.produceId },
//             data: { 
//               quantity: { decrement: item.quantity },
//               status: newQuantity <= 0 ? "DELIVERED" : item.produceItem.status
//             }
//           });
//         }),
//         ...processedItems.inputs.map(item =>
//           prisma.farmInput.update({
//             where: { id: item.inputId },
//             data: { quantity: { decrement: item.quantity } }
//           })
//         )
//       ]);

//       return newTransaction;
//     });

//     res.status(201).json({
//       success: true,
//       message: "Transaction created successfully",
//       transaction,
//       summary: {
//         totalAmount,
//         items: {
//           products: processedItems.products.length,
//           produce: processedItems.produce.length,
//           inputs: processedItems.inputs.length
//         }
//       }
//     });

//   } catch (error) {
//     console.error("Transaction Error:", error);
//     res.status(500).json({
//       error: "Transaction failed",
//       message: error.message,
//       ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
//     });
//   }
// };
// const createTransaction = async (req, res) => {
//   try {
//     const { buyerId, products = [], produce = [], services = [], inputs = [] ,serviceOffering = []} = req.body;

//     // Validate buyer exists
//     const buyer = await prisma.customer.findUnique({ 
//       where: { id: buyerId }
//     });
//     if (!buyer) {
//       return res.status(404).json({ error: "Customer not found" });
//     }

//     let totalAmount = 0;
//     const processedItems = {
//       products: [],
//       produce: [],
//       ServiceOffering: [],
//       inputs: [],
//       serviceOffering: []
//     };

//     // Process Products
//     for (const item of products) {
//       const product = await prisma.product.findUnique({ where: { id: item.productId } });
//       if (!product) throw new Error(`Product not found: ${item.productId}`);
//       if (product.quantity < item.quantity) {
//         throw new Error(`Insufficient stock for ${product.name}`);
//       }

//       const itemTotal = product.price * item.quantity;
//       totalAmount += itemTotal;
//       processedItems.products.push({
//         productId: product.id,
//         quantity: item.quantity,
//         price: product.price
//       });
//     }

//     // Process Produce
//     for (const item of produce) {
//       const produceItem = await prisma.produce.findUnique({ where: { id: item.produceId } });
//       if (!produceItem) throw new Error(`Produce not found: ${item.produceId}`);
//       if (!['HARVESTED', 'PROCESSED', 'DELIVERED'].includes(produceItem.status) || produceItem.quantity < item.quantity) {
//         throw new Error(`Produce not available or quantity too low`);
//       }

//       const itemTotal = produceItem.price * item.quantity;
//       totalAmount += itemTotal;
//       processedItems.produce.push({
//         produceId: produceItem.id,
//         quantity: item.quantity,
//         price: produceItem.price
//       });
//     }

//     // Process Inputs
//     for (const item of inputs) {
//       const input = await prisma.farmInput.findUnique({ where: { id: item.inputId } });
//       if (!input) throw new Error(`Input not found: ${item.inputId}`);
//       if (input.quantity < item.quantity) {
//         throw new Error(`Insufficient stock for ${input.name}`);
//       }

//       const itemTotal = input.price * item.quantity;
//       totalAmount += itemTotal;
//       processedItems.inputs.push({
//         inputId: input.id,
//         quantity: item.quantity,
//         price: input.price
//       });
//     }
// //===========================================


// for (const item of serviceOffering) {
//   const offering = await prisma.serviceOffering.findUnique({ 
//     where: { id: item.offeringId },
//     include: { service: true }
//   });

//   if (!offering) throw new Error(`Service offering not found: ${item.offeringId}`);
//   if (!offering.isActive) throw new Error(`Service offering is inactive`);
//   if (offering.minQuantity > (item.quantity || 1)) {
//     throw new Error(`Minimum quantity not met for ${offering.service.name}`);
//   }

//   const itemTotal = offering.rate * (item.quantity || 1);
//   totalAmount += itemTotal;

//   processedItems.serviceOffering.push({
//     offeringId: offering.id,
//     serviceId: offering.serviceId,
//     providerId: offering.serviceProviderId,
//     quantity: item.quantity || 1,
//     rate: offering.rate,
//     notes: item.notes || offering.notes
//   });
// }

// //=========================================================
//     if (isNaN(totalAmount)) throw new Error("Invalid total amount calculation");

//     const transaction = await prisma.$transaction(async (prisma) => {
//       const newTransaction = await prisma.transaction.create({
//         data: {
//           buyer: { connect: { id: buyerId } },
//           totalAmount,
//           status: "PENDING",
//           paymentMethod: "CASH",
//           ...(processedItems.products.length > 0 && {
//             products: { connect: processedItems.products.map(p => ({ id: p.productId })) }
//           }),
//           ...(processedItems.produce.length > 0 && {
//             produce: { connect: processedItems.produce.map(p => ({ id: p.produceId })) }
//           }),
//           ...(processedItems.inputs.length > 0 && {
//             FarmInput: { connect: processedItems.inputs.map(i => ({ id: i.inputId })) }
//           }),
//           ...(processedItems.services.length > 0 && {
//             services: { connect: processedItems.services.map(s => ({ id: s.serviceId })) }
//           }),
//         },
//         include: {
//           buyer: true,
//           products: true,
//           produce: true,
//           FarmInput: true,
//           services: true,
//         }
//       });

//       // Reduce stock quantities for tangible goods
//       await Promise.all([
//         ...processedItems.products.map(item =>
//           prisma.product.update({
//             where: { id: item.productId },
//             data: { quantity: { decrement: item.quantity } }
//           })
//         ),
//         ...processedItems.produce.map(item => {
//           const newQuantity = item.produceItem?.quantity - item.quantity;
//           return prisma.produce.update({
//             where: { id: item.produceId },
//             data: { 
//               quantity: { decrement: item.quantity },
//               status: newQuantity <= 0 ? "DELIVERED" : "HARVESTED"
//             }
//           });
//         }),
//         ...processedItems.inputs.map(item =>
//           prisma.farmInput.update({
//             where: { id: item.inputId },
//             data: { quantity: { decrement: item.quantity } }
//           })
//         )
//       ]);

//       return newTransaction;
//     });

//     res.status(201).json({
//       success: true,
//       message: "Transaction created successfully",
//       transaction,
//       summary: {
//         totalAmount,
//         items: {
//           products: processedItems.products.length,
//           produce: processedItems.produce.length,
//           inputs: processedItems.inputs.length,
//           services: processedItems.services.length
//         }
//       }
//     });

//   } catch (error) {
//     console.error("Transaction Error:", error);
//     res.status(500).json({
//       error: "Transaction failed",
//       message: error.message,
//       ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
//     });
//   }
// };
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
        price: input.price
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
  // createFarmInput,
  // getAllFarmInputs,
  // getFarmInputById,
  // updateFarmInput,
  // deleteFarmInput,

};