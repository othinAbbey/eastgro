// import { PrismaClient } from '@prisma/client';
// import QRCode from 'qrcode';

// const prisma = new PrismaClient();

// // Generate QR Code with biofortification check
// const generateQRCode = async (req, res) => {
//   try {
//     const { produceId } = req.body;

//     // Check if the produce exists and fetch biofortification status
//     const produce = await prisma.produce.findUnique({
//       where: { id: produceId },
//     });

//     if (!produce) {
//       return res.status(404).json({ error: 'Produce not found' });
//     }

//     // Include biofortification status in QR code data
//     const qrCodeData = JSON.stringify({
//       traceUrl: `${process.env.BASE_URL}/qrcodes/trace/${produceId}`,
//       isBiofortified: produce.isBiofortified,
//     });

//     // Generate QR Code image
//     const qrCodeImage = await QRCode.toDataURL(qrCodeData);
//     res.json({ qrCodeImage });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

// // Trace product and include biofortification status
// const traceProduct = async (req, res) => {
//   try {
//     const { id } = req.params;

//     // Fetch product details with related entities
//     const produce = await prisma.produce.findUnique({
//       where: { id },
//       include: {
//         farmer: true,
//         shipments: {
//           include: {
//             transporter: true,
//             facility: true,
//           },
//         },
//       },
//     });

//     if (!produce) {
//       return res.status(404).json({ error: 'Produce not found' });
//     }

//     // Return detailed produce data including biofortification status
//     res.json({
//       id: produce.id,
//       type: produce.type,
//       quantity: produce.quantity,
//       status: produce.status,
//       isBiofortified: produce.isBiofortified,
//       harvestDate: produce.harvestDate,
//       farmer: produce.farmer,
//       shipments: produce.shipments,
//     });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

// export { generateQRCode, traceProduct };
import QRCode from 'qrcode';

// Use the same connection function from previous conversions
const createConnection = async () => {
  // Your existing connection code here
};

// Helper function to generate ID
function generateId(prefix) {
  return `${prefix}_` + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// Generate QR Code with biofortification check
const generateQRCode = async (req, res) => {
  let db;
  try {
    db = await createConnection();
    const { produceId } = req.body;

    if (!produceId) {
      return res.status(400).json({ error: 'Produce ID is required' });
    }

    // Check if the produce exists and fetch biofortification status
    const [produces] = await db.execute(
      `SELECT p.*, u.name as farmerName, u.contact as farmerContact 
       FROM produces p 
       LEFT JOIN users u ON p.farmerId = u.id 
       WHERE p.id = ?`,
      [produceId]
    );

    if (produces.length === 0) {
      return res.status(404).json({ error: 'Produce not found' });
    }

    const produce = produces[0];

    // Check if QR code already exists
    const [existingQRCodes] = await db.execute(
      'SELECT id FROM qr_codes WHERE produceId = ?',
      [produceId]
    );

    if (existingQRCodes.length > 0) {
      return res.status(400).json({ error: 'QR code already exists for this produce' });
    }

    // Include biofortification status in QR code data
    const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
    const qrCodeData = JSON.stringify({
      produceId: produce.id,
      traceUrl: `${baseUrl}/api/qrcodes/trace/${produceId}`,
      type: produce.type,
      isBiofortified: produce.isBiofortified,
      harvestDate: produce.harvestDate,
      farmerName: produce.farmerName
    });

    // Generate QR Code image
    const qrCodeImage = await QRCode.toDataURL(qrCodeData);

    const qrCodeId = generateId('qrcode');
    
    // Store QR code in database
    await db.execute(
      `INSERT INTO qr_codes (id, produceId, qrCodeData, qrCodeImage, traceUrl) 
       VALUES (?, ?, ?, ?, ?)`,
      [
        qrCodeId,
        produceId,
        qrCodeData,
        qrCodeImage,
        `${baseUrl}/api/qrcodes/trace/${produceId}`
      ]
    );

    // Create initial trace history entry
    const traceHistoryId = generateId('trace');
    await db.execute(
      `INSERT INTO produce_trace_history (id, produceId, action, location, notes) 
       VALUES (?, ?, ?, ?, ?)`,
      [
        traceHistoryId,
        produceId,
        'HARVESTED',
        produce.storageLocation || 'Farm',
        'Produce harvested and QR code generated'
      ]
    );

    res.json({
      message: 'QR code generated successfully',
      qrCodeImage: qrCodeImage,
      produce: {
        id: produce.id,
        type: produce.type,
        isBiofortified: produce.isBiofortified,
        harvestDate: produce.harvestDate,
        farmerName: produce.farmerName
      }
    });

  } catch (error) {
    console.error('Generate QR code error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Trace product and include biofortification status
const traceProduct = async (req, res) => {
  let db;
  try {
    db = await createConnection();
    const { id } = req.params;

    // Fetch product details with related entities
    const [produces] = await db.execute(
      `SELECT p.*, 
              u.name as farmerName, 
              u.contact as farmerContact,
              u.location as farmerLocation
       FROM produces p 
       LEFT JOIN users u ON p.farmerId = u.id 
       WHERE p.id = ?`,
      [id]
    );

    if (produces.length === 0) {
      return res.status(404).json({ error: 'Produce not found' });
    }

    const produce = produces[0];

    // Fetch shipments for this produce
    const [shipments] = await db.execute(
      `SELECT s.*, 
              t.name as transporterName,
              t.contact as transporterContact,
              f.name as facilityName,
              f.location as facilityLocation
       FROM shipments s
       LEFT JOIN transporters t ON s.transporterId = t.id
       LEFT JOIN facilities f ON s.facilityId = f.id
       WHERE s.id IN (
         SELECT shipmentId FROM shipment_items WHERE produceId = ?
       )
       ORDER BY s.createdAt DESC`,
      [id]
    );

    // Fetch trace history
    const [traceHistory] = await db.execute(
      `SELECT th.*, u.name as performedByName
       FROM produce_trace_history th
       LEFT JOIN users u ON th.performedBy = u.id
       WHERE th.produceId = ?
       ORDER BY th.timestamp ASC`,
      [id]
    );

    // Fetch QR code scan history
    const [qrCodeInfo] = await db.execute(
      `SELECT qc.*, 
              (SELECT COUNT(*) FROM qr_code_scans WHERE qrCodeId = qc.id) as totalScans
       FROM qr_codes qc
       WHERE qc.produceId = ?`,
      [id]
    );

    // Record this trace as a scan if QR code exists
    if (qrCodeInfo.length > 0) {
      const qrCode = qrCodeInfo[0];
      const scanId = generateId('scan');
      
      await db.execute(
        `INSERT INTO qr_code_scans (id, qrCodeId, scannedBy, userAgent, ipAddress) 
         VALUES (?, ?, ?, ?, ?)`,
        [
          scanId,
          qrCode.id,
          'trace_system',
          req.get('User-Agent') || null,
          req.ip || req.connection.remoteAddress
        ]
      );

      // Update scan count
      await db.execute(
        'UPDATE qr_codes SET scannedCount = scannedCount + 1, lastScannedAt = CURRENT_TIMESTAMP WHERE id = ?',
        [qrCode.id]
      );
    }

    // Return detailed produce data including biofortification status
    const traceData = {
      id: produce.id,
      type: produce.type,
      variety: produce.variety,
      quantity: produce.quantity,
      unit: produce.unit,
      status: produce.status,
      isBiofortified: produce.isBiofortified,
      qualityGrade: produce.qualityGrade,
      harvestDate: produce.harvestDate,
      storageLocation: produce.storageLocation,
      pricePerKg: produce.pricePerKg,
      farmer: {
        id: produce.farmerId,
        name: produce.farmerName,
        contact: produce.farmerContact,
        location: produce.farmerLocation
      },
      shipments: shipments,
      traceHistory: traceHistory,
      qrCode: qrCodeInfo.length > 0 ? {
        id: qrCodeInfo[0].id,
        totalScans: qrCodeInfo[0].totalScans,
        generatedAt: qrCodeInfo[0].generatedAt,
        lastScannedAt: qrCodeInfo[0].lastScannedAt
      } : null
    };

    res.json(traceData);

  } catch (error) {
    console.error('Trace product error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get QR code by produce ID
const getQRCodeByProduceId = async (req, res) => {
  let db;
  try {
    db = await createConnection();
    const { produceId } = req.params;

    const [qrCodes] = await db.execute(
      `SELECT qc.*, p.type as produceType, p.isBiofortified
       FROM qr_codes qc
       LEFT JOIN produces p ON qc.produceId = p.id
       WHERE qc.produceId = ? AND qc.isActive = TRUE`,
      [produceId]
    );

    if (qrCodes.length === 0) {
      return res.status(404).json({ error: 'QR code not found for this produce' });
    }

    const qrCode = qrCodes[0];

    // Get scan history
    const [scanHistory] = await db.execute(
      `SELECT scannedAt, scanLocation, userAgent 
       FROM qr_code_scans 
       WHERE qrCodeId = ? 
       ORDER BY scannedAt DESC 
       LIMIT 10`,
      [qrCode.id]
    );

    res.json({
      ...qrCode,
      scanHistory: scanHistory
    });

  } catch (error) {
    console.error('Get QR code error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Add trace history entry
const addTraceHistory = async (req, res) => {
  let db;
  try {
    db = await createConnection();
    const { produceId } = req.params;
    const { action, location, notes, performedBy } = req.body;

    // Validate required fields
    if (!action || !produceId) {
      return res.status(400).json({ error: 'Action and produce ID are required' });
    }

    // Check if produce exists
    const [produces] = await db.execute(
      'SELECT id FROM produces WHERE id = ?',
      [produceId]
    );

    if (produces.length === 0) {
      return res.status(404).json({ error: 'Produce not found' });
    }

    const traceId = generateId('trace');
    
    await db.execute(
      `INSERT INTO produce_trace_history (id, produceId, action, location, performedBy, notes) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        traceId,
        produceId,
        action,
        location || null,
        performedBy || null,
        notes || null
      ]
    );

    // Update produce status based on action
    if (['STORED', 'SHIPPED', 'RECEIVED', 'PROCESSED', 'SOLD'].includes(action)) {
      let newStatus;
      switch (action) {
        case 'STORED':
          newStatus = 'IN_STORAGE';
          break;
        case 'SHIPPED':
          newStatus = 'IN_TRANSIT';
          break;
        case 'RECEIVED':
        case 'PROCESSED':
          newStatus = 'DELIVERED';
          break;
        case 'SOLD':
          newStatus = 'SOLD';
          break;
      }

      if (newStatus) {
        await db.execute(
          'UPDATE produces SET status = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?',
          [newStatus, produceId]
        );
      }
    }

    // Get created trace entry
    const [traceEntries] = await db.execute(
      `SELECT th.*, u.name as performedByName
       FROM produce_trace_history th
       LEFT JOIN users u ON th.performedBy = u.id
       WHERE th.id = ?`,
      [traceId]
    );

    res.status(201).json(traceEntries[0]);

  } catch (error) {
    console.error('Add trace history error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get QR code scan analytics
const getQRCodeAnalytics = async (req, res) => {
  let db;
  try {
    db = await createConnection();
    const { produceId } = req.params;

    const [analytics] = await db.execute(
      `SELECT 
          COUNT(qcs.id) as totalScans,
          COUNT(DISTINCT DATE(qcs.scannedAt)) as uniqueScanDays,
          MIN(qcs.scannedAt) as firstScan,
          MAX(qcs.scannedAt) as lastScan,
          COUNT(DISTINCT qcs.ipAddress) as uniqueDevices
       FROM qr_codes qc
       LEFT JOIN qr_code_scans qcs ON qc.id = qcs.qrCodeId
       WHERE qc.produceId = ?`,
      [produceId]
    );

    const [dailyScans] = await db.execute(
      `SELECT 
          DATE(scannedAt) as scanDate,
          COUNT(*) as scanCount
       FROM qr_code_scans qcs
       JOIN qr_codes qc ON qcs.qrCodeId = qc.id
       WHERE qc.produceId = ?
       GROUP BY DATE(scannedAt)
       ORDER BY scanDate DESC
       LIMIT 30`,
      [produceId]
    );

    res.json({
      overview: analytics[0],
      dailyScans: dailyScans
    });

  } catch (error) {
    console.error('Get QR code analytics error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get all biofortified products
const getBiofortifiedProducts = async (req, res) => {
  let db;
  try {
    db = await createConnection();
    
    const [produces] = await db.execute(
      `SELECT p.*, 
              u.name as farmerName,
              u.location as farmerLocation,
              qc.scannedCount,
              qc.lastScannedAt
       FROM produces p
       LEFT JOIN users u ON p.farmerId = u.id
       LEFT JOIN qr_codes qc ON p.id = qc.produceId
       WHERE p.isBiofortified = TRUE
       ORDER BY p.harvestDate DESC`
    );

    res.json(produces);

  } catch (error) {
    console.error('Get biofortified products error:', error);
    res.status(500).json({ error: error.message });
  }
};

export {
  generateQRCode,
  traceProduct,
  getQRCodeByProduceId,
  addTraceHistory,
  getQRCodeAnalytics,
  getBiofortifiedProducts
};