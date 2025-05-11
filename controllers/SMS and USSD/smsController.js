// const SMSService = require('../services/smsService');
import SMSService from '../services/smsService.js';

class SMSController {
  static async broadcastSMS(req, res) {
    try {
      const { region, district, phoneNumbers } = req.body;

      if (!phoneNumbers || !Array.isArray(phoneNumbers) || phoneNumbers.length === 0) {
        return res.status(400).json({ 
          success: false, 
          message: 'Phone numbers are required and must be an array' 
        });
      }

      // Format message
      const message = `Important update for ${district} District, ${region} Region. Dial *234# to access the latest information.`;

      // Send SMS using Africa's Talking
      const result = await SMSService.sendBulkSMS(phoneNumbers, message);

      res.json({
        success: true,
        message: 'SMS broadcast initiated successfully',
        result
      });

    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to send SMS broadcast'
      });
    }
  }
}


// module.exports = SMSController;
export default SMSController;