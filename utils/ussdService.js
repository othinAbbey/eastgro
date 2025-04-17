import dotenv from 'dotenv';

dotenv.config();

class USSDService {
    static async handleUSSD(reqBody) {
        const { sessionId, serviceCode, phoneNumber, text } = reqBody;

        // Logic to handle USSD session
        let responseMessage = '';

        if (text === '') {
            // Initial request
            responseMessage = 'CON Welcome to My Service\n1. Option 1\n2. Option 2';
        } else if (text === '1') {
            responseMessage = 'CON You selected Option 1\n1. Sub-option 1\n2. Sub-option 2';
        } else if (text === '2') {
            responseMessage = `CON You selected Option 2\nYour phone number is ${phoneNumber}`;
        } else {
            responseMessage = 'END Invalid option. Please try again.';
        }

        return responseMessage;
    }
}

export default USSDService;
