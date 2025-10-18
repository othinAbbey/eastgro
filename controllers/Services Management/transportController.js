// import { PrismaClient } from '@prisma/client';
// const prisma = new PrismaClient();

// const createTransporter = async (req, res) => {
//   try {
//     const { name, contact, vehicleDetails,status,Region} = req.body;
//     const transporter = await prisma.transporter.create({
//       data: { name, contact, vehicleDetails,status,Region },
//     });
//     res.json(transporter);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

// const getTransporters = async (req, res) => {
//   try {
//     const transporters = await prisma.transporter.findMany();
//     res.json(transporters);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };
// //get one transporter based on selected region and status, where his available or not
// const getTransporter = async (req, res) => {
//   try {
//     // Get the transporter ID from the request body
//     const { id } = req.body;

//     // Fetch the transporter from the database using the ID
//     const transporter = await prisma.transporter.findUnique({
//       where: { id }, // equivalent to { id: id }
//     });

//     // If no transporter is found, return a 404 error
//     if (!transporter) {
//       return res.status(404).json({ error: "Transporter not found" });
//     }

//     // Send the found transporter as the response
//     res.json(transporter);
//   } catch (error) {
//     // If something goes wrong, return a 500 with the error message
//     res.status(500).json({ error: error.message });
//   }
// };




// export { createTransporter, getTransporters ,getTransporter};



// Use the same connection function from previous conversions
const createConnection = async () => {
  // Your existing connection code here
};

// Helper function to generate ID
function generateId(prefix) {
  return `${prefix}_` + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// Create Transporter
const createTransporter = async (req, res) => {
  let db;
  try {
    db = await createConnection();
    const { name, contact, vehicleDetails, status, region, capacity } = req.body;

    // Validate required fields
    if (!name || !contact) {
      return res.status(400).json({ 
        error: 'Name and contact are required' 
      });
    }

    // Check if contact already exists
    const [existingTransporters] = await db.execute(
      'SELECT id FROM transporters WHERE contact = ?',
      [contact]
    );

    if (existingTransporters.length > 0) {
      return res.status(400).json({ 
        error: 'Transporter with this contact already exists' 
      });
    }

    const transporterId = generateId('transporter');
    
    await db.execute(
      `INSERT INTO transporters (id, name, contact, vehicleDetails, status, region, capacity) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        transporterId,
        name,
        contact,
        vehicleDetails ? JSON.stringify(vehicleDetails) : null,
        status || 'AVAILABLE',
        region || 'EASTERN',
        capacity || 0
      ]
    );

    // Get created transporter
    const [transporters] = await db.execute(
      'SELECT * FROM transporters WHERE id = ?',
      [transporterId]
    );

    // Parse JSON fields
    const transporter = {
      ...transporters[0],
      vehicleDetails: transporters[0].vehicleDetails ? JSON.parse(transporters[0].vehicleDetails) : null
    };

    res.status(201).json(transporter);

  } catch (error) {
    console.error('Create transporter error:', error);
    
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ 
        error: 'Transporter with this contact already exists' 
      });
    }
    
    res.status(500).json({ error: error.message });
  }
};

// Get all transporters
const getTransporters = async (req, res) => {
  let db;
  try {
    db = await createConnection();
    
    const [transporters] = await db.execute(
      `SELECT t.*, 
              COUNT(tr.id) as reviewCount,
              AVG(tr.rating) as averageRating
       FROM transporters t
       LEFT JOIN transporter_reviews tr ON t.id = tr.transporterId
       WHERE t.isActive = TRUE
       GROUP BY t.id
       ORDER BY t.name ASC`
    );

    // Parse JSON fields and calculate ratings
    const transportersWithParsedData = transporters.map(transporter => ({
      ...transporter,
      vehicleDetails: transporter.vehicleDetails ? JSON.parse(transporter.vehicleDetails) : null,
      rating: transporter.averageRating ? parseFloat(transporter.averageRating) : 0.0,
      availableCapacity: transporter.capacity - transporter.currentLoad
    }));

    res.json(transportersWithParsedData);
  } catch (error) {
    console.error('Get transporters error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get one transporter by ID
const getTransporter = async (req, res) => {
  let db;
  try {
    db = await createConnection();
    const { id } = req.params;

    // Get transporter details
    const [transporters] = await db.execute(
      `SELECT t.*, 
              COUNT(tr.id) as reviewCount,
              AVG(tr.rating) as averageRating
       FROM transporters t
       LEFT JOIN transporter_reviews tr ON t.id = tr.transporterId
       WHERE t.id = ?
       GROUP BY t.id`,
      [id]
    );

    if (transporters.length === 0) {
      return res.status(404).json({ error: "Transporter not found" });
    }

    const transporter = transporters[0];

    // Get recent location
    const [locations] = await db.execute(
      `SELECT latitude, longitude, address, timestamp 
       FROM transporter_locations 
       WHERE transporterId = ? 
       ORDER BY timestamp DESC 
       LIMIT 1`,
      [id]
    );

    // Get recent reviews
    const [reviews] = await db.execute(
      `SELECT tr.*, u.name as customerName
       FROM transporter_reviews tr
       LEFT JOIN users u ON tr.customerId = u.id
       WHERE tr.transporterId = ?
       ORDER BY tr.createdAt DESC
       LIMIT 5`,
      [id]
    );

    // Get active shipments count
    const [activeShipments] = await db.execute(
      `SELECT COUNT(*) as activeCount 
       FROM shipments 
       WHERE transporterId = ? AND status IN ('PENDING', 'IN_TRANSIT')`,
      [id]
    );

    const transporterWithDetails = {
      ...transporter,
      vehicleDetails: transporter.vehicleDetails ? JSON.parse(transporter.vehicleDetails) : null,
      rating: transporter.averageRating ? parseFloat(transporter.averageRating) : 0.0,
      availableCapacity: transporter.capacity - transporter.currentLoad,
      currentLocation: locations.length > 0 ? locations[0] : null,
      reviews: reviews,
      activeShipments: activeShipments[0].activeCount
    };

    res.json(transporterWithDetails);

  } catch (error) {
    console.error('Get transporter error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get transporters by region and status
const getTransportersByRegionAndStatus = async (req, res) => {
  let db;
  try {
    db = await createConnection();
    const { region, status } = req.params;

    const [transporters] = await db.execute(
      `SELECT t.*, 
              COUNT(tr.id) as reviewCount,
              AVG(tr.rating) as averageRating
       FROM transporters t
       LEFT JOIN transporter_reviews tr ON t.id = tr.transporterId
       WHERE t.region = ? AND t.status = ? AND t.isActive = TRUE
       GROUP BY t.id
       ORDER BY t.currentLoad ASC, averageRating DESC`,
      [region, status]
    );

    const transportersWithParsedData = transporters.map(transporter => ({
      ...transporter,
      vehicleDetails: transporter.vehicleDetails ? JSON.parse(transporter.vehicleDetails) : null,
      rating: transporter.averageRating ? parseFloat(transporter.averageRating) : 0.0,
      availableCapacity: transporter.capacity - transporter.currentLoad
    }));

    res.json(transportersWithParsedData);
  } catch (error) {
    console.error('Get transporters by region and status error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Update transporter
const updateTransporter = async (req, res) => {
  let db;
  try {
    db = await createConnection();
    const { id } = req.params;
    const updates = req.body;

    // Remove fields that shouldn't be updated
    delete updates.id;
    delete updates.rating; // Rating should be calculated from reviews

    // Check if transporter exists
    const [existingTransporters] = await db.execute(
      'SELECT id FROM transporters WHERE id = ?',
      [id]
    );

    if (existingTransporters.length === 0) {
      return res.status(404).json({ error: 'Transporter not found' });
    }

    // Build dynamic update query
    const updateFields = [];
    const params = [];

    const allowedFields = [
      'name', 'contact', 'vehicleDetails', 'status', 'region', 
      'capacity', 'currentLoad', 'isActive'
    ];

    allowedFields.forEach(field => {
      if (updates[field] !== undefined) {
        updateFields.push(`${field} = ?`);
        if (field === 'vehicleDetails') {
          params.push(JSON.stringify(updates[field]));
        } else {
          params.push(updates[field]);
        }
      }
    });

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    params.push(id);

    await db.execute(
      `UPDATE transporters SET ${updateFields.join(', ')}, updatedAt = CURRENT_TIMESTAMP WHERE id = ?`,
      params
    );

    // Get updated transporter
    const [transporters] = await db.execute(
      'SELECT * FROM transporters WHERE id = ?',
      [id]
    );

    const transporter = {
      ...transporters[0],
      vehicleDetails: transporters[0].vehicleDetails ? JSON.parse(transporters[0].vehicleDetails) : null
    };

    res.json(transporter);

  } catch (error) {
    console.error('Update transporter error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Update transporter location
const updateTransporterLocation = async (req, res) => {
  let db;
  try {
    db = await createConnection();
    const { id } = req.params;
    const { latitude, longitude, address } = req.body;

    // Check if transporter exists
    const [existingTransporters] = await db.execute(
      'SELECT id FROM transporters WHERE id = ?',
      [id]
    );

    if (existingTransporters.length === 0) {
      return res.status(404).json({ error: 'Transporter not found' });
    }

    const locationId = generateId('location');
    
    await db.execute(
      `INSERT INTO transporter_locations (id, transporterId, latitude, longitude, address) 
       VALUES (?, ?, ?, ?, ?)`,
      [locationId, id, latitude, longitude, address || null]
    );

    res.json({ 
      message: 'Location updated successfully',
      location: { latitude, longitude, address, timestamp: new Date() }
    });

  } catch (error) {
    console.error('Update transporter location error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Add transporter review
const addTransporterReview = async (req, res) => {
  let db;
  try {
    db = await createConnection();
    const { id } = req.params;
    const { customerId, rating, comment } = req.body;

    // Validate required fields
    if (!customerId || !rating) {
      return res.status(400).json({ error: 'Customer ID and rating are required' });
    }

    // Validate rating range
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    // Check if transporter exists
    const [existingTransporters] = await db.execute(
      'SELECT id FROM transporters WHERE id = ?',
      [id]
    );

    if (existingTransporters.length === 0) {
      return res.status(404).json({ error: 'Transporter not found' });
    }

    // Check if customer exists
    const [existingCustomers] = await db.execute(
      'SELECT id FROM users WHERE id = ?',
      [customerId]
    );

    if (existingCustomers.length === 0) {
      return res.status(400).json({ error: 'Invalid customer ID' });
    }

    const reviewId = generateId('review');
    
    await db.execute(
      `INSERT INTO transporter_reviews (id, transporterId, customerId, rating, comment) 
       VALUES (?, ?, ?, ?, ?)`,
      [reviewId, id, customerId, rating, comment || null]
    );

    // Get created review with customer details
    const [reviews] = await db.execute(
      `SELECT tr.*, u.name as customerName
       FROM transporter_reviews tr
       LEFT JOIN users u ON tr.customerId = u.id
       WHERE tr.id = ?`,
      [reviewId]
    );

    res.status(201).json(reviews[0]);

  } catch (error) {
    console.error('Add transporter review error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get available transporters with capacity
const getAvailableTransportersWithCapacity = async (req, res) => {
  let db;
  try {
    db = await createConnection();
    const { region, requiredCapacity } = req.query;

    let query = `
      SELECT t.*, 
             COUNT(tr.id) as reviewCount,
             AVG(tr.rating) as averageRating
      FROM transporters t
      LEFT JOIN transporter_reviews tr ON t.id = tr.transporterId
      WHERE t.status = 'AVAILABLE' 
        AND t.isActive = TRUE
        AND (t.capacity - t.currentLoad) >= ?
    `;
    
    const params = [parseFloat(requiredCapacity) || 0];

    if (region) {
      query += ' AND t.region = ?';
      params.push(region);
    }

    query += ' GROUP BY t.id ORDER BY (t.capacity - t.currentLoad) DESC, averageRating DESC';

    const [transporters] = await db.execute(query, params);

    const transportersWithParsedData = transporters.map(transporter => ({
      ...transporter,
      vehicleDetails: transporter.vehicleDetails ? JSON.parse(transporter.vehicleDetails) : null,
      rating: transporter.averageRating ? parseFloat(transporter.averageRating) : 0.0,
      availableCapacity: transporter.capacity - transporter.currentLoad
    }));

    res.json(transportersWithParsedData);
  } catch (error) {
    console.error('Get available transporters error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Delete transporter
const deleteTransporter = async (req, res) => {
  let db;
  try {
    db = await createConnection();
    const { id } = req.params;

    // Check if transporter exists
    const [existingTransporters] = await db.execute(
      'SELECT id FROM transporters WHERE id = ?',
      [id]
    );

    if (existingTransporters.length === 0) {
      return res.status(404).json({ error: 'Transporter not found' });
    }

    // Soft delete by setting isActive to false
    await db.execute(
      'UPDATE transporters SET isActive = FALSE, updatedAt = CURRENT_TIMESTAMP WHERE id = ?',
      [id]
    );

    res.json({ message: 'Transporter deleted successfully' });

  } catch (error) {
    console.error('Delete transporter error:', error);
    res.status(500).json({ error: error.message });
  }
};

export { 
  createTransporter, 
  getTransporters, 
  getTransporter,
  getTransportersByRegionAndStatus,
  updateTransporter,
  updateTransporterLocation,
  addTransporterReview,
  getAvailableTransportersWithCapacity,
  deleteTransporter
};