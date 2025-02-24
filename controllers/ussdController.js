import africasTalking from '../config/africastalking.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// USSD Handler
const ussdHandler = async (req, res) => {
  const { sessionId, serviceCode, phoneNumber, text } = req.body;

  let response = '';

  // Split user input by '*'
  const inputs = text.split('*');

  if (text === '') {
    response = `CON Welcome to Biofortified Crop Reporting
1. Report New Crop
2. Check My Submissions`;
  } else if (text === '1') {
    response = 'CON Enter crop type:';
  } else if (inputs.length === 2) {
    response = 'CON Enter quantity (in kilograms):';
  } else if (inputs.length === 3) {
    response = 'CON Is this crop biofortified? (Yes/No):';
  } else if (inputs.length === 4) {
    const cropType = inputs[1];
    const quantity = parseInt(inputs[2]);
    const isBiofortified = inputs[3].toLowerCase() === 'yes';

    try {
      // Find farmer by phone number
      const farmer = await prisma.farmer.findUnique({
        where: { contact: phoneNumber },
      });

      if (!farmer) {
        response = 'END You are not registered as a farmer.';
      } else {
        // Save crop details
        await prisma.produce.create({
          data: {
            farmerId: farmer.id,
            type: cropType,
            quantity,
            harvestDate: new Date(),
            isBiofortified,
          },
        });

        response = 'END Crop submission successful!';
      }
    } catch (error) {
      response = 'END An error occurred while submitting your crop data.';
    }
  } else {
    response = 'END Invalid input. Please try again.';
  }

  res.set('Content-Type', 'text/plain');
  res.send(response);
};

export { ussdHandler };
