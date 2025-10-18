// import { PrismaClient } from '@prisma/client';
// const prisma = new PrismaClient();

// const createShipment = async (req, res) => {
//   try {
//     const { transporterId, facilityId, status, departureTime, arrivalTime } = req.body;
//     const shipment = await prisma.shipment.create({
//       data: { transporterId, facilityId, status, departureTime: new Date(departureTime), arrivalTime: new Date(arrivalTime) },
//     });
//     res.json(shipment);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

// const getShipments = async (req, res) => {
//   try {
//     const shipments = await prisma.shipment.findMany();
//     res.json(shipments);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

// const getShipment = async(req,res) => {
//   try{
//     const shipment = await prisma.shipment.findUnique();
//     res.json(shipment)
//   } catch(error){
//     res.status(500).json({error: error.message})
//   }
// }

// export { createShipment, getShipments,getShipment };


// Use the same connection function from previous conversions
const createConnection = async () => {
  // Your existing connection code here
};

// Helper function to generate ID
function generateId(prefix) {
  return `${prefix}_` + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// Create Shipment
const createShipment = async (req, res) => {
  let db;
  try {
    db = await createConnection();
    const { transporterId, facilityId, status, departureTime, arrivalTime, items } = req.body;

    // Validate required fields
    if (!transporterId || !facilityId) {
      return res.status(400).json({ 
        error: 'Transporter ID and Facility ID are required' 
      });
    }

    // Validate transporter exists and has appropriate role
    const [transporters] = await db.execute(
      'SELECT id, userRole FROM users WHERE id = ? AND userRole IN (?, ?)',
      [transporterId, 'SOLETRADER', 'PASSIVETRADER']
    );

    if (transporters.length === 0) {
      return res.status(400).json({ 
        error: 'Invalid transporter ID or user is not a trader' 
      });
    }

    // Validate facility exists
    const [facilities] = await db.execute(
      'SELECT id FROM facilities WHERE id = ?',
      [facilityId]
    );

    if (facilities.length === 0) {
      return res.status(400).json({ error: 'Invalid facility ID' });
    }

    const shipmentId = generateId('shipment');
    
    // Start transaction for shipment creation
    await db.execute('START TRANSACTION');

    try {
      // Create shipment
      await db.execute(
        `INSERT INTO shipments (id, transporterId, facilityId, status, departureTime, arrivalTime) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          shipmentId, 
          transporterId, 
          facilityId, 
          status || 'PENDING',
          departureTime ? new Date(departureTime) : null,
          arrivalTime ? new Date(arrivalTime) : null
        ]
      );

      // Create initial tracking entry
      const trackingId = generateId('tracking');
      await db.execute(
        'INSERT INTO shipment_tracking (id, shipmentId, status, notes) VALUES (?, ?, ?, ?)',
        [trackingId, shipmentId, status || 'PENDING', 'Shipment created']
      );

      // Add shipment items if provided
      if (items && Array.isArray(items) && items.length > 0) {
        for (const item of items) {
          const itemId = generateId('item');
          await db.execute(
            `INSERT INTO shipment_items (id, shipmentId, produceId, quantity, unit, notes) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [
              itemId, 
              shipmentId, 
              item.produceId, 
              item.quantity, 
              item.unit || 'kg', 
              item.notes || null
            ]
          );
        }
      }

      await db.execute('COMMIT');

      // Get created shipment with details
      const [shipments] = await db.execute(
        `SELECT s.*, 
                u.name as transporterName,
                u.contact as transporterContact,
                f.name as facilityName,
                f.location as facilityLocation
         FROM shipments s
         LEFT JOIN users u ON s.transporterId = u.id
         LEFT JOIN facilities f ON s.facilityId = f.id
         WHERE s.id = ?`,
        [shipmentId]
      );

      res.status(201).json(shipments[0]);

    } catch (error) {
      await db.execute('ROLLBACK');
      throw error;
    }

  } catch (error) {
    console.error('Create shipment error:', error);
    
    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
      return res.status(400).json({ error: 'Invalid transporter or facility ID' });
    }
    
    res.status(500).json({ error: error.message });
  }
};

// Get all shipments
const getShipments = async (req, res) => {
  let db;
  try {
    db = await createConnection();
    
    const [shipments] = await db.execute(
      `SELECT s.*, 
              u.name as transporterName,
              u.contact as transporterContact,
              f.name as facilityName,
              f.location as facilityLocation,
              (SELECT COUNT(*) FROM shipment_items si WHERE si.shipmentId = s.id) as itemCount,
              (SELECT SUM(si.quantity) FROM shipment_items si WHERE si.shipmentId = s.id) as totalQuantity
       FROM shipments s
       LEFT JOIN users u ON s.transporterId = u.id
       LEFT JOIN facilities f ON s.facilityId = f.id
       ORDER BY s.createdAt DESC`
    );

    res.json(shipments);
  } catch (error) {
    console.error('Get shipments error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get single shipment
const getShipment = async (req, res) => {
  let db;
  try {
    db = await createConnection();
    const { id } = req.params;

    // Get shipment details
    const [shipments] = await db.execute(
      `SELECT s.*, 
              u.name as transporterName,
              u.contact as transporterContact,
              u.email as transporterEmail,
              f.name as facilityName,
              f.location as facilityLocation,
              f.contact as facilityContact
       FROM shipments s
       LEFT JOIN users u ON s.transporterId = u.id
       LEFT JOIN facilities f ON s.facilityId = f.id
       WHERE s.id = ?`,
      [id]
    );

    if (shipments.length === 0) {
      return res.status(404).json({ error: 'Shipment not found' });
    }

    const shipment = shipments[0];

    // Get shipment items
    const [items] = await db.execute(
      `SELECT si.*, p.name as produceName, p.type as produceType
       FROM shipment_items si
       LEFT JOIN produces p ON si.produceId = p.id
       WHERE si.shipmentId = ?`,
      [id]
    );

    // Get tracking history
    const [tracking] = await db.execute(
      `SELECT * FROM shipment_tracking 
       WHERE shipmentId = ? 
       ORDER BY recordedAt DESC`,
      [id]
    );

    const shipmentWithDetails = {
      ...shipment,
      items: items,
      tracking: tracking
    };

    res.json(shipmentWithDetails);
  } catch (error) {
    console.error('Get shipment error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Update shipment
const updateShipment = async (req, res) => {
  let db;
  try {
    db = await createConnection();
    const { id } = req.params;
    const { status, departureTime, arrivalTime, location, notes } = req.body;

    // Check if shipment exists
    const [existingShipments] = await db.execute(
      'SELECT id FROM shipments WHERE id = ?',
      [id]
    );

    if (existingShipments.length === 0) {
      return res.status(404).json({ error: 'Shipment not found' });
    }

    // Start transaction
    await db.execute('START TRANSACTION');

    try {
      // Build dynamic update query for shipment
      const updateFields = [];
      const params = [];

      if (status !== undefined) {
        updateFields.push('status = ?');
        params.push(status);
      }
      if (departureTime !== undefined) {
        updateFields.push('departureTime = ?');
        params.push(new Date(departureTime));
      }
      if (arrivalTime !== undefined) {
        updateFields.push('arrivalTime = ?');
        params.push(new Date(arrivalTime));
      }

      if (updateFields.length > 0) {
        params.push(id);
        await db.execute(
          `UPDATE shipments SET ${updateFields.join(', ')}, updatedAt = CURRENT_TIMESTAMP WHERE id = ?`,
          params
        );
      }

      // Create tracking entry if status or location changed
      if (status !== undefined || location !== undefined) {
        const trackingId = generateId('tracking');
        await db.execute(
          'INSERT INTO shipment_tracking (id, shipmentId, status, location, notes) VALUES (?, ?, ?, ?, ?)',
          [trackingId, id, status || 'PENDING', location || null, notes || 'Shipment updated']
        );
      }

      await db.execute('COMMIT');

      // Get updated shipment
      const [updatedShipments] = await db.execute(
        `SELECT s.*, 
                u.name as transporterName,
                f.name as facilityName
         FROM shipments s
         LEFT JOIN users u ON s.transporterId = u.id
         LEFT JOIN facilities f ON s.facilityId = f.id
         WHERE s.id = ?`,
        [id]
      );

      res.json(updatedShipments[0]);

    } catch (error) {
      await db.execute('ROLLBACK');
      throw error;
    }

  } catch (error) {
    console.error('Update shipment error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Add item to shipment
const addShipmentItem = async (req, res) => {
  let db;
  try {
    db = await createConnection();
    const { id } = req.params;
    const { produceId, quantity, unit, notes } = req.body;

    // Validate required fields
    if (!produceId || !quantity) {
      return res.status(400).json({ error: 'Produce ID and quantity are required' });
    }

    // Check if shipment exists
    const [existingShipments] = await db.execute(
      'SELECT id FROM shipments WHERE id = ?',
      [id]
    );

    if (existingShipments.length === 0) {
      return res.status(404).json({ error: 'Shipment not found' });
    }

    // Check if produce exists
    const [produces] = await db.execute(
      'SELECT id FROM produces WHERE id = ?',
      [produceId]
    );

    if (produces.length === 0) {
      return res.status(400).json({ error: 'Invalid produce ID' });
    }

    const itemId = generateId('item');
    
    await db.execute(
      `INSERT INTO shipment_items (id, shipmentId, produceId, quantity, unit, notes) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [itemId, id, produceId, quantity, unit || 'kg', notes || null]
    );

    // Get created item with details
    const [items] = await db.execute(
      `SELECT si.*, p.name as produceName, p.type as produceType
       FROM shipment_items si
       LEFT JOIN produces p ON si.produceId = p.id
       WHERE si.id = ?`,
      [itemId]
    );

    res.status(201).json(items[0]);

  } catch (error) {
    console.error('Add shipment item error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get shipments by transporter
const getShipmentsByTransporter = async (req, res) => {
  let db;
  try {
    db = await createConnection();
    const { transporterId } = req.params;

    const [shipments] = await db.execute(
      `SELECT s.*, 
              f.name as facilityName,
              f.location as facilityLocation,
              (SELECT COUNT(*) FROM shipment_items si WHERE si.shipmentId = s.id) as itemCount,
              (SELECT SUM(si.quantity) FROM shipment_items si WHERE si.shipmentId = s.id) as totalQuantity
       FROM shipments s
       LEFT JOIN facilities f ON s.facilityId = f.id
       WHERE s.transporterId = ?
       ORDER BY s.createdAt DESC`,
      [transporterId]
    );

    res.json(shipments);
  } catch (error) {
    console.error('Get shipments by transporter error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get shipments by facility
const getShipmentsByFacility = async (req, res) => {
  let db;
  try {
    db = await createConnection();
    const { facilityId } = req.params;

    const [shipments] = await db.execute(
      `SELECT s.*, 
              u.name as transporterName,
              u.contact as transporterContact,
              (SELECT COUNT(*) FROM shipment_items si WHERE si.shipmentId = s.id) as itemCount,
              (SELECT SUM(si.quantity) FROM shipment_items si WHERE si.shipmentId = s.id) as totalQuantity
       FROM shipments s
       LEFT JOIN users u ON s.transporterId = u.id
       WHERE s.facilityId = ?
       ORDER BY s.createdAt DESC`,
      [facilityId]
    );

    res.json(shipments);
  } catch (error) {
    console.error('Get shipments by facility error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get shipments by status
const getShipmentsByStatus = async (req, res) => {
  let db;
  try {
    db = await createConnection();
    const { status } = req.params;

    const [shipments] = await db.execute(
      `SELECT s.*, 
              u.name as transporterName,
              f.name as facilityName,
              (SELECT COUNT(*) FROM shipment_items si WHERE si.shipmentId = s.id) as itemCount
       FROM shipments s
       LEFT JOIN users u ON s.transporterId = u.id
       LEFT JOIN facilities f ON s.facilityId = f.id
       WHERE s.status = ?
       ORDER BY s.createdAt DESC`,
      [status]
    );

    res.json(shipments);
  } catch (error) {
    console.error('Get shipments by status error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Delete shipment
const deleteShipment = async (req, res) => {
  let db;
  try {
    db = await createConnection();
    const { id } = req.params;

    // Check if shipment exists
    const [existingShipments] = await db.execute(
      'SELECT id FROM shipments WHERE id = ?',
      [id]
    );

    if (existingShipments.length === 0) {
      return res.status(404).json({ error: 'Shipment not found' });
    }

    // Start transaction
    await db.execute('START TRANSACTION');

    try {
      // Delete tracking entries
      await db.execute('DELETE FROM shipment_tracking WHERE shipmentId = ?', [id]);
      
      // Delete shipment items
      await db.execute('DELETE FROM shipment_items WHERE shipmentId = ?', [id]);
      
      // Delete shipment
      await db.execute('DELETE FROM shipments WHERE id = ?', [id]);

      await db.execute('COMMIT');

      res.json({ message: 'Shipment deleted successfully' });

    } catch (error) {
      await db.execute('ROLLBACK');
      throw error;
    }

  } catch (error) {
    console.error('Delete shipment error:', error);
    res.status(500).json({ error: error.message });
  }
};

export { 
  createShipment, 
  getShipments, 
  getShipment,
  updateShipment,
  addShipmentItem,
  getShipmentsByTransporter,
  getShipmentsByFacility,
  getShipmentsByStatus,
  deleteShipment
};