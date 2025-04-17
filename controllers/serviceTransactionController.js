// // src/controllers/serviceTransactions.controller.js
// import { PrismaClient } from '@prisma/client';
// const prisma = new PrismaClient();

//   /**
//    * Create a service transaction
//    */
// const createTransaction =async(req, res) => {
//     try {
//       const { buyerId, totalAmount, paymentMethod, serviceType, serviceDetails } = req.body;

//       const transaction = await prisma.transaction.create({
//         data: {
//           buyerId,
//           totalAmount,
//           paymentMethod: paymentMethod || 'CASH',
//           status: 'PENDING',
//           services: {
//             create: {
//               // You might want to expand this with service details
//             },
//           },
//         },
//         include: {
//           services: true,
//         },
//       });

//       res.status(201).json(transaction);
//     } catch (error) {
//       res.status(500).json({ error: 'Failed to create service transaction' });
//     }
//   }

//   /**
//    * Get all transactions for a farmer
//    */
//   const getFarmerTransactions = async(req, res)=>{
//     try {
//       const { farmerId } = req.params;

//       const transactions = await prisma.transaction.findMany({
//         where: { buyerId: farmerId },
//         include: {
//           services: true,
//           FarmInput: true,
//           products: true,
//           produce: true,
//         },
//         orderBy: {
//           createdAt: 'desc',
//         },
//       });

//       res.json(transactions);
//     } catch (error) {
//       res.status(500).json({ error: 'Failed to fetch transactions' });
//     }
//   }

//   /**
//    * Update transaction status
//    */
//   const updateTransactionStatus=async(req, res)=> {
//     try {
//       const { transactionId } = req.params;
//       const { status } = req.body;

//       const transaction = await prisma.transaction.update({
//         where: { id: transactionId },
//         data: { status },
//       });

//       res.json(transaction);
//     } catch (error) {
//       res.status(500).json({ error: 'Failed to update transaction status' });
//     }
//   }

//   /**
//    * Process payment for a transaction
//    */
//   const processPayment= async (req, res)=>{
//     try {
//       const { transactionId } = req.params;
//       const { amount, paymentMethod, paymentReference } = req.body;

//       // In a real app, you would integrate with a payment gateway here

//       const transaction = await prisma.transaction.update({
//         where: { id: transactionId },
//         data: {
//           status: 'PAID',
//           paymentMethod,
//           // You might want to add payment details to your schema
//         },
//       });

//       res.json(transaction);
//     } catch (error) {
//       res.status(500).json({ error: 'Failed to process payment' });
//     }
//   }

// export default {

//     createTransaction,
//     getFarmerTransactions,
//     updateTransactionStatus,
//     processPayment
// }

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// Book a service
const bookService = async (req, res) => {
  try {
    const { buyerId, serviceOfferingId, quantity, paymentMethod } = req.body;
    
    // Get service offering details
    const offering = await prisma.serviceOffering.findUnique({
      where: { id: serviceOfferingId },
      include: {
        service: true,
        serviceProvider: true
      }
    });

    if (!offering || !offering.isActive) {
      return res.status(400).json({ error: 'Service offering not available' });
    }

    // Validate quantity
    if (quantity < (offering.minQuantity || 1)) {
      return res.status(400).json({ 
        error: `Minimum quantity is ${offering.minQuantity || 1}` 
      });
    }

    // Calculate total amount
    const totalAmount = offering.rate * quantity;

    // Create transaction
    const transaction = await prisma.transaction.create({
      data: {
        buyerId,
        serviceProviderId: offering.serviceProviderId,
        totalAmount,
        paymentMethod,
        status: 'PENDING',
        services: {
          connect: { id: offering.serviceId }
        }
      },
      include: {
        services: true,
        serviceProvider: true
      }
    });

    res.status(201).json(transaction);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get provider's bookings
const getProviderBookings = async (req, res) => {
  try {
    const { providerId } = req.params;
    
    const bookings = await prisma.transaction.findMany({
      where: { 
        serviceProviderId: providerId,
        services: { some: {} } // Ensure it's a service transaction
      },
      include: {
        buyer: true,
        services: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export default {
    bookService,
    getProviderBookings
    };