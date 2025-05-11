// import africasTalking from '../config/africastalking.js';
// import { PrismaClient } from '@prisma/client';

// const prisma = new PrismaClient();

// // USSD Handler
// const ussdHandler = async (req, res) => {
//   const { sessionId, serviceCode, phoneNumber, text } = req.body;

//   let response = '';

//   // Split user input by '*'
//   const inputs = text.split('*');

//   if (text === '') {
//     response = `CON Welcome to Biofortified Crop Reporting
// 1. Report New Crop
// 2. Check My Submissions`;
//   } else if (text === '1') {
//     response = 'CON Enter crop type:';
//   } else if (inputs.length === 2) {
//     response = 'CON Enter quantity (in kilograms):';
//   } else if (inputs.length === 3) {
//     response = 'CON Is this crop biofortified? (Yes/No):';
//   } else if (inputs.length === 4) {
//     const cropType = inputs[1];
//     const quantity = parseInt(inputs[2]);
//     const isBiofortified = inputs[3].toLowerCase() === 'yes';

//     try {
//       // Find farmer by phone number
//       const farmer = await prisma.farmer.findUnique({
//         where: { contact: phoneNumber },
//       });

//       if (!farmer) {
//         response = 'END You are not registered as a farmer.';
//       } else {
//         // Save crop details
//         await prisma.produce.create({
//           data: {
//             farmerId: farmer.id,
//             type: cropType,
//             quantity,
//             harvestDate: new Date(),
//             isBiofortified,
//           },
//         });

//         response = 'END Crop submission successful!';
//       }
//     } catch (error) {
//       response = 'END An error occurred while submitting your crop data.';
//     }
//   } else {
//     response = 'END Invalid input. Please try again.';
//   }

//   res.set('Content-Type', 'text/plain');
//   res.send(response);
// };

// export default ussdHandler;


import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// USSD Controller
const ussdHandler = async (req, res) => {
  const { sessionId, serviceCode, phoneNumber, text } = req.body;

  let response = '';

  try {
    // Split the user input into an array
    const input = text.split('*');
    const step = input.length;

    switch (step) {
      case 1:
        // Initial menu
        response = `CON Welcome to Crop Management
        1. Register a Crop
        2. View My Crops
        3. Update a Crop
        4. Delete a Crop
        5. Exit`;
        break;

      case 2:
        // Handle the user's selection
        switch (input[1]) {
          case '1':
            // Register a Crop
            response = `CON Enter crop details in the format:
            type*quantity*harvestDate*isBiofortified (true/false)
            Example: Maize*100*2023-10-15*true`;
            break;

          case '2':
            // View My Crops
            const crops = await prisma.produce.findMany({
              where: { farmer: { contact: phoneNumber } }, // Fetch crops for the farmer's phone number
            });
            if (crops.length === 0) {
              response = 'END You have no registered crops.';
            } else {
              response = `END Your Crops:\n${crops
                .map((crop) => `Type: ${crop.type}, Quantity: ${crop.quantity}, Harvest Date: ${crop.harvestDate}`)
                .join('\n')}`;
            }
            break;

          case '3':
            // Update a Crop
            response = `CON Enter crop update details in the format:
            type*quantity*harvestDate*isBiofortified (true/false)
            Example: Maize*150*2023-10-20*false`;
            break;

          case '4':
            // Delete a Crop
            response = 'CON Enter the crop type to delete:';
            break;

          case '5':
            // Exit
            response = 'END Thank you for using Crop Management.';
            break;

          default:
            response = 'END Invalid option. Please try again.';
        }
        break;

      case 3:
        // Handle the user's input for each option
        switch (input[1]) {
          case '1':
            // Register a Crop
            const [type, quantity, harvestDate, isBiofortified] = input[2].split('*');
            const produce = await prisma.produce.create({
              data: {
                type,
                quantity: parseInt(quantity),
                harvestDate: new Date(harvestDate),
                isBiofortified: isBiofortified === 'true',
                status: 'HARVESTED',
                farmer: { connect: { contact: phoneNumber } }, // Link to the farmer's phone number
              },
            });
            response = `END Crop registered successfully:
            Type: ${produce.type}, Quantity: ${produce.quantity}`;
            break;

          case '3':
            // Update a Crop
            const [updateType, updateQuantity, updateHarvestDate, updateIsBiofortified] = input[2].split('*');
            const updatedCrop = await prisma.produce.updateMany({
              where: { type: updateType, farmer: { contact: phoneNumber } }, // Update based on crop type and farmer's phone number
              data: {
                type: updateType,
                quantity: parseInt(updateQuantity),
                harvestDate: new Date(updateHarvestDate),
                isBiofortified: updateIsBiofortified === 'true',
              },
            });
            if (updatedCrop.count === 0) {
              response = 'END No matching crop found to update.';
            } else {
              response = `END Crop updated successfully:
              Type: ${updateType}, Quantity: ${updateQuantity}`;
            }
            break;

          case '4':
            // Delete a Crop
            const deleteType = input[2];
            const deletedCrop = await prisma.produce.deleteMany({
              where: { type: deleteType, farmer: { contact: phoneNumber } }, // Delete based on crop type and farmer's phone number
            });
            if (deletedCrop.count === 0) {
              response = 'END No matching crop found to delete.';
            } else {
              response = `END Crop deleted successfully:
              Type: ${deleteType}`;
            }
            break;

          default:
            response = 'END Invalid option. Please try again.';
        }
        break;

      default:
        response = 'END Invalid input. Please try again.';
    }
  } catch (error) {
    console.error('Error in USSD flow:', error);
    response = 'END An error occurred. Please try again later.';
  }

  res.send(response);
};

export default ussdHandler;