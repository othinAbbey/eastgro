

// import { PrismaClient } from '@prisma/client';
// const prisma = new PrismaClient();

// // USSD Controller
// const ussdHandler = async (req, res) => {
//   const { sessionId, serviceCode, phoneNumber, text } = req.body;

//   let response = '';

//   try {
//     // Split the user input into an array
//     const input = text.split('*');
//     const step = input.length;

//     switch (step) {
//       case 1:
//         // Initial menu
//         response = `CON Welcome to Crop Management
//         1. Register a Crop
//         2. View My Crops
//         3. Update a Crop
//         4. Delete a Crop
//         5. Exit`;
//         break;

//       case 2:
//         // Handle the user's selection
//         switch (input[1]) {
//           case '1':
//             // Register a Crop
//             response = `CON Enter crop details in the format:
//             type*quantity*harvestDate*isBiofortified (true/false)
//             Example: Maize*100*2023-10-15*true`;
//             break;

//           case '2':
//             // View My Crops
//             const crops = await prisma.produce.findMany({
//               where: { farmer: { contact: phoneNumber } }, // Fetch crops for the farmer's phone number
//             });
//             if (crops.length === 0) {
//               response = 'END You have no registered crops.';
//             } else {
//               response = `END Your Crops:\n${crops
//                 .map((crop) => `Type: ${crop.type}, Quantity: ${crop.quantity}, Harvest Date: ${crop.harvestDate}`)
//                 .join('\n')}`;
//             }
//             break;

//           case '3':
//             // Update a Crop
//             response = `CON Enter crop update details in the format:
//             type*quantity*harvestDate*isBiofortified (true/false)
//             Example: Maize*150*2023-10-20*false`;
//             break;

//           case '4':
//             // Delete a Crop
//             response = 'CON Enter the crop type to delete:';
//             break;

//           case '5':
//             // Exit
//             response = 'END Thank you for using Crop Management.';
//             break;

//           default:
//             response = 'END Invalid option. Please try again.';
//         }
//         break;

//       case 3:
//         // Handle the user's input for each option
//         switch (input[1]) {
//           case '1':
//             // Register a Crop
//             const [type, quantity, harvestDate, isBiofortified] = input[2].split('*');
//             const produce = await prisma.produce.create({
//               data: {
//                 type,
//                 quantity: parseInt(quantity),
//                 harvestDate: new Date(harvestDate),
//                 isBiofortified: isBiofortified === 'true',
//                 status: 'HARVESTED',
//                 farmer: { connect: { contact: phoneNumber } }, // Link to the farmer's phone number
//               },
//             });
//             response = `END Crop registered successfully:
//             Type: ${produce.type}, Quantity: ${produce.quantity}`;
//             break;

//           case '3':
//             // Update a Crop
//             const [updateType, updateQuantity, updateHarvestDate, updateIsBiofortified] = input[2].split('*');
//             const updatedCrop = await prisma.produce.updateMany({
//               where: { type: updateType, farmer: { contact: phoneNumber } }, // Update based on crop type and farmer's phone number
//               data: {
//                 type: updateType,
//                 quantity: parseInt(updateQuantity),
//                 harvestDate: new Date(updateHarvestDate),
//                 isBiofortified: updateIsBiofortified === 'true',
//               },
//             });
//             if (updatedCrop.count === 0) {
//               response = 'END No matching crop found to update.';
//             } else {
//               response = `END Crop updated successfully:
//               Type: ${updateType}, Quantity: ${updateQuantity}`;
//             }
//             break;

//           case '4':
//             // Delete a Crop
//             const deleteType = input[2];
//             const deletedCrop = await prisma.produce.deleteMany({
//               where: { type: deleteType, farmer: { contact: phoneNumber } }, // Delete based on crop type and farmer's phone number
//             });
//             if (deletedCrop.count === 0) {
//               response = 'END No matching crop found to delete.';
//             } else {
//               response = `END Crop deleted successfully:
//               Type: ${deleteType}`;
//             }
//             break;

//           default:
//             response = 'END Invalid option. Please try again.';
//         }
//         break;

//       default:
//         response = 'END Invalid input. Please try again.';
//     }
//   } catch (error) {
//     console.error('Error in USSD flow:', error);
//     response = 'END An error occurred. Please try again later.';
//   }

//   res.send(response);
// };

// export default ussdHandler;

import pool from '../../config/database.js';

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
            const cropsResult = await pool.query(
              `SELECT p.* 
               FROM produce p 
               JOIN farmers f ON p.farmer_id = f.id 
               WHERE f.contact = $1 
               ORDER BY p.created_at DESC`,
              [phoneNumber]
            );
            
            if (cropsResult.rows.length === 0) {
              response = 'END You have no registered crops.';
            } else {
              const cropsList = cropsResult.rows.map(crop => 
                `Type: ${crop.type}, Quantity: ${crop.quantity}, Harvest Date: ${crop.harvest_date}`
              ).join('\n');
              response = `END Your Crops:\n${cropsList}`;
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
            
            // First, get or create farmer
            let farmerResult = await pool.query(
              'SELECT id FROM farmers WHERE contact = $1',
              [phoneNumber]
            );

            let farmerId;
            if (farmerResult.rows.length === 0) {
              // Create farmer if doesn't exist
              const newFarmer = await pool.query(
                'INSERT INTO farmers (name, contact, location) VALUES ($1, $2, $3) RETURNING id',
                ['Unknown Farmer', phoneNumber, 'Unknown Location']
              );
              farmerId = newFarmer.rows[0].id;
            } else {
              farmerId = farmerResult.rows[0].id;
            }

            // Create produce record
            const produceResult = await pool.query(
              `INSERT INTO produce 
               (farmer_id, type, quantity, harvest_date, is_biofortified, status) 
               VALUES ($1, $2, $3, $4, $5, 'HARVESTED') 
               RETURNING *`,
              [farmerId, type, parseInt(quantity), harvestDate, isBiofortified === 'true']
            );

            const produce = produceResult.rows[0];
            response = `END Crop registered successfully:
            Type: ${produce.type}, Quantity: ${produce.quantity}`;
            break;

          case '3':
            // Update a Crop
            const [updateType, updateQuantity, updateHarvestDate, updateIsBiofortified] = input[2].split('*');
            
            const updateResult = await pool.query(
              `UPDATE produce 
               SET quantity = $1, harvest_date = $2, is_biofortified = $3, updated_at = CURRENT_TIMESTAMP
               FROM farmers 
               WHERE produce.farmer_id = farmers.id 
               AND farmers.contact = $4 
               AND produce.type = $5
               RETURNING produce.*`,
              [
                parseInt(updateQuantity),
                updateHarvestDate,
                updateIsBiofortified === 'true',
                phoneNumber,
                updateType
              ]
            );

            if (updateResult.rows.length === 0) {
              response = 'END No matching crop found to update.';
            } else {
              response = `END Crop updated successfully:
              Type: ${updateType}, Quantity: ${updateQuantity}`;
            }
            break;

          case '4':
            // Delete a Crop
            const deleteType = input[2];
            
            const deleteResult = await pool.query(
              `DELETE FROM produce 
               USING farmers 
               WHERE produce.farmer_id = farmers.id 
               AND farmers.contact = $1 
               AND produce.type = $2
               RETURNING produce.*`,
              [phoneNumber, deleteType]
            );

            if (deleteResult.rows.length === 0) {
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

  res.set('Content-Type', 'text/plain');
  res.send(response);
};

export default ussdHandler;