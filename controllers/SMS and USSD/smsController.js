// // const SMSService = require('../services/smsService');
// import SMSService from '../services/smsService.js';

// class SMSController {
//   static async broadcastSMS(req, res) {
//     try {
//       const { region, district, phoneNumbers } = req.body;

//       if (!phoneNumbers || !Array.isArray(phoneNumbers) || phoneNumbers.length === 0) {
//         return res.status(400).json({ 
//           success: false, 
//           message: 'Phone numbers are required and must be an array' 
//         });
//       }

//       // Format message
//       const message = `Important update for ${district} District, ${region} Region. Dial *234# to access the latest information.`;

//       // Send SMS using Africa's Talking
//       const result = await SMSService.sendBulkSMS(phoneNumbers, message);

//       res.json({
//         success: true,
//         message: 'SMS broadcast initiated successfully',
//         result
//       });

//     } catch (error) {
//       res.status(500).json({
//         success: false,
//         message: error.message || 'Failed to send SMS broadcast'
//       });
//     }
//   }
// }


// // module.exports = SMSController;
// export default SMSController;

import pool from '../database.js';

class SMSController {
  static async broadcastSMS(req, res) {
    const client = await pool.connect();
    
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

      // Start transaction
      await client.query('BEGIN');

      // 1. Create broadcast record
      const broadcastResult = await client.query(
        `INSERT INTO sms_broadcasts (region, district, message, phone_numbers, sent_count) 
         VALUES ($1, $2, $3, $4, $5) 
         RETURNING *`,
        [region, district, message, JSON.stringify(phoneNumbers), phoneNumbers.length]
      );

      const broadcastId = broadcastResult.rows[0].id;

      // 2. Create SMS logs for each phone number
      const logQueries = phoneNumbers.map(phoneNumber =>
        client.query(
          `INSERT INTO sms_logs (broadcast_id, phone_number, message, status) 
           VALUES ($1, $2, $3, 'PENDING')`,
          [broadcastId, phoneNumber, message]
        )
      );

      await Promise.all(logQueries);

      // 3. Update user records if they exist
      await client.query(
        `UPDATE users 
         SET updated_at = CURRENT_TIMESTAMP 
         WHERE phone = ANY($1)`,
        [phoneNumbers]
      );

      // Commit transaction
      await client.query('COMMIT');

      // Send SMS using Africa's Talking (your existing service)
      // const result = await SMSService.sendBulkSMS(phoneNumbers, message);

      res.json({
        success: true,
        message: 'SMS broadcast initiated successfully',
        broadcastId,
        totalRecipients: phoneNumbers.length
        // result
      });

    } catch (error) {
      await client.query('ROLLBACK');
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to send SMS broadcast'
      });
    } finally {
      client.release();
    }
  }

  // Get broadcast history
  static async getBroadcastHistory(req, res) {
    try {
      const { page = 1, limit = 10 } = req.query;
      const offset = (page - 1) * limit;

      const result = await pool.query(
        `SELECT 
           id, region, district, message, 
           sent_count, failed_count, status,
           created_at,
           (SELECT COUNT(*) FROM sms_logs WHERE broadcast_id = sms_broadcasts.id) as total_messages
         FROM sms_broadcasts 
         ORDER BY created_at DESC 
         LIMIT $1 OFFSET $2`,
        [limit, offset]
      );

      const countResult = await pool.query('SELECT COUNT(*) FROM sms_broadcasts');

      res.json({
        success: true,
        broadcasts: result.rows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: parseInt(countResult.rows[0].count)
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch broadcast history'
      });
    }
  }

  // Get broadcast details with logs
  static async getBroadcastDetails(req, res) {
    try {
      const { id } = req.params;

      const broadcastResult = await pool.query(
        'SELECT * FROM sms_broadcasts WHERE id = $1',
        [id]
      );

      const logsResult = await pool.query(
        `SELECT * FROM sms_logs 
         WHERE broadcast_id = $1 
         ORDER BY sent_at DESC`,
        [id]
      );

      if (broadcastResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Broadcast not found'
        });
      }

      res.json({
        success: true,
        broadcast: broadcastResult.rows[0],
        logs: logsResult.rows
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch broadcast details'
      });
    }
  }
}

export default SMSController;