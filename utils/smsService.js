import axios from 'axios';
import config from '../config/africastalking.js';

class SMSService {
  static async sendBulkSMS(phoneNumbers, message) {
    console.log(config.apiUrl);
    try {
      
      const response = await axios.post(
        'https://api.africastalking.com/version1/messaging/bulk',
        {
          username: config.username,
          message,
          phoneNumbers: phoneNumbers
        },
        {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'apiKey': config.apiKey
          }
        }
      );
      
      return response.data;
    } catch (error) {
      console.log(error);
      console.error('SMS Broadcasting Error:', error.response?.data || error.message);
      throw new Error('Failed to send SMS broadcast');
    }
  }
}

// module.exports = SMSService;
export default SMSService;


