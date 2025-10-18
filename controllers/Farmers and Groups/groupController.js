import { query, getClient } from "../../config/database.js";

const assignFarmerToGroup = async (req, res) => {
  const client = await getClient();
  
  try {
    await client.query('BEGIN');

    const { farmerId, cropType, region, quantity } = req.body;

    // Basic validation
    if (!farmerId || !cropType || !region || quantity === undefined) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        error: 'Missing required fields: farmerId, cropType, region, quantity',
      });
    }

    if (typeof quantity !== 'number' || isNaN(quantity) || quantity <= 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        error: 'Quantity must be a valid number greater than 0',
      });
    }

    // Check if the farmer exists
    const farmerResult = await client.query(
      'SELECT id FROM farmers WHERE id = $1',
      [farmerId]
    );

    if (farmerResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Farmer not found' });
    }

    // Check if a group already exists
    const existingGroupResult = await client.query(
      'SELECT id, total_quantity as "totalQuantity" FROM groups WHERE crop_type = $1 AND region = $2',
      [cropType, region]
    );

    let group;
    
    if (existingGroupResult.rows.length === 0) {
      // Create a new group
      const newGroupResult = await client.query(
        `INSERT INTO groups (crop_type, region, total_quantity, created_at) 
         VALUES ($1, $2, $3, NOW()) 
         RETURNING id, crop_type as "cropType", region, total_quantity as "totalQuantity", created_at`,
        [cropType, region, quantity]
      );
      group = newGroupResult.rows[0];
    } else {
      // Update group quantity
      const existingGroup = existingGroupResult.rows[0];
      const newTotalQuantity = existingGroup.totalQuantity + quantity;
      
      const updateGroupResult = await client.query(
        `UPDATE groups 
         SET total_quantity = $1, updated_at = NOW() 
         WHERE id = $2 
         RETURNING id, crop_type as "cropType", region, total_quantity as "totalQuantity", updated_at`,
        [newTotalQuantity, existingGroup.id]
      );
      group = updateGroupResult.rows[0];
    }

    // Assign farmer to group
    await client.query(
      'UPDATE farmers SET group_id = $1, updated_at = NOW() WHERE id = $2',
      [group.id, farmerId]
    );

    await client.query('COMMIT');

    res.json({ 
      success: true,
      message: '✅ Farmer successfully assigned to group', 
      group 
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Group assignment error:', error);
    res.status(500).json({ 
      error: 'Internal Server Error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  } finally {
    client.release();
  }
};

// Retrieve grouped farmers for bulk sales
const getGroupedFarmers = async (req, res) => {
  try {
    const groupsResult = await query(
      `SELECT g.id, g.crop_type as "cropType", g.region, g.total_quantity as "totalQuantity", 
              g.created_at, g.updated_at,
              json_agg(
                json_build_object(
                  'id', f.id,
                  'name', f.name,
                  'contact', f.contact,
                  'location', f.location
                )
              ) as farmers
       FROM groups g
       LEFT JOIN farmers f ON g.id = f.group_id
       GROUP BY g.id, g.crop_type, g.region, g.total_quantity, g.created_at, g.updated_at
       ORDER BY g.created_at DESC`
    );

    res.json({
      success: true,
      groups: groupsResult.rows,
      count: groupsResult.rows.length
    });
  } catch (error) {
    console.error('Error fetching grouped farmers:', error);
    res.status(500).json({ 
      error: 'Failed to fetch groups',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get farmers by crop type or region
const getFarmersByCriteria = async (req, res) => {
  try {
    const { cropType, region } = req.query;

    // Validate query parameters
    if (!cropType && !region) {
      return res.status(400).json({ 
        error: "Please provide cropType or region as query parameters." 
      });
    }

    // Build the query filter
    let whereConditions = [];
    let queryParams = [];
    let paramCount = 0;

    if (cropType) {
      paramCount++;
      whereConditions.push(`p.type = $${paramCount}`);
      queryParams.push(cropType);
    }

    if (region) {
      paramCount++;
      whereConditions.push(`f.location = $${paramCount}`);
      queryParams.push(region);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    const farmersResult = await query(
      `SELECT DISTINCT f.id, f.name, f.contact, f.location, f.farm_details as "farmDetails", f.created_at,
              json_agg(
                json_build_object(
                  'id', p.id,
                  'type', p.type,
                  'quantity', p.quantity,
                  'harvestDate', p.harvest_date,
                  'status', p.status
                )
              ) as produce
       FROM farmers f
       LEFT JOIN produce p ON f.id = p.farmer_id
       ${whereClause}
       GROUP BY f.id, f.name, f.contact, f.location, f.farm_details, f.created_at
       ORDER BY f.created_at DESC`,
      queryParams
    );

    // If no farmers are found, return a 404 error
    if (farmersResult.rows.length === 0) {
      return res.status(404).json({ 
        success: false,
        error: "No farmers found for the given criteria." 
      });
    }

    res.json({
      success: true,
      farmers: farmersResult.rows,
      count: farmersResult.rows.length
    });
  } catch (error) {
    console.error("Error fetching farmers:", error);
    res.status(500).json({ 
      error: "Failed to fetch farmers",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get groups where farmer belongs by farmer id
const getFarmerGroups = async (req, res) => {
  const farmerId = req.params.id;

  try {
    // First check if farmer exists
    const farmerResult = await query(
      'SELECT id, name FROM farmers WHERE id = $1',
      [farmerId]
    );

    if (farmerResult.rows.length === 0) {
      return res.status(404).json({ 
        success: false,
        error: "Farmer not found." 
      });
    }

    // Get farmer's group
    const groupResult = await query(
      `SELECT g.id, g.crop_type as "cropType", g.region, g.total_quantity as "totalQuantity", 
              g.created_at, g.updated_at
       FROM groups g
       INNER JOIN farmers f ON g.id = f.group_id
       WHERE f.id = $1`,
      [farmerId]
    );

    if (groupResult.rows.length === 0) {
      return res.status(404).json({ 
        success: false,
        message: "Farmer is not assigned to any group." 
      });
    }

    res.json({
      success: true,
      group: groupResult.rows[0]
    });
  } catch (error) {
    console.error("Error fetching farmer groups:", error);
    res.status(500).json({ 
      error: "Failed to fetch farmer groups",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Additional useful functions

const createGroup = async (req, res) => {
  const client = await getClient();
  
  try {
    await client.query('BEGIN');

    const { cropType, region, totalQuantity = 0 } = req.body;

    if (!cropType || !region) {
      await client.query('ROLLBACK');
      return res.status(400).json({ 
        error: 'Missing required fields: cropType, region' 
      });
    }

    // Check if group already exists
    const existingGroup = await client.query(
      'SELECT id FROM groups WHERE crop_type = $1 AND region = $2',
      [cropType, region]
    );

    if (existingGroup.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ 
        error: 'Group with this crop type and region already exists' 
      });
    }

    const groupResult = await client.query(
      `INSERT INTO groups (crop_type, region, total_quantity, created_at) 
       VALUES ($1, $2, $3, NOW()) 
       RETURNING id, crop_type as "cropType", region, total_quantity as "totalQuantity", created_at`,
      [cropType, region, totalQuantity]
    );

    await client.query('COMMIT');

    res.status(201).json({
      success: true,
      message: 'Group created successfully',
      group: groupResult.rows[0]
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating group:', error);
    res.status(500).json({ 
      error: 'Failed to create group',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  } finally {
    client.release();
  }
};

const removeFarmerFromGroup = async (req, res) => {
  const client = await getClient();
  
  try {
    await client.query('BEGIN');

    const { farmerId } = req.params;

    // Check if farmer exists and is in a group
    const farmerResult = await client.query(
      'SELECT id, group_id FROM farmers WHERE id = $1',
      [farmerId]
    );

    if (farmerResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ 
        error: 'Farmer not found' 
      });
    }

    const farmer = farmerResult.rows[0];

    if (!farmer.group_id) {
      await client.query('ROLLBACK');
      return res.status(400).json({ 
        error: 'Farmer is not assigned to any group' 
      });
    }

    // Remove farmer from group
    await client.query(
      'UPDATE farmers SET group_id = NULL, updated_at = NOW() WHERE id = $1',
      [farmerId]
    );

    await client.query('COMMIT');

    res.json({
      success: true,
      message: '✅ Farmer successfully removed from group'
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error removing farmer from group:', error);
    res.status(500).json({ 
      error: 'Failed to remove farmer from group',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  } finally {
    client.release();
  }
};

export default { 
  assignFarmerToGroup, 
  getGroupedFarmers, 
  getFarmersByCriteria, 
  getFarmerGroups,
  createGroup,
  removeFarmerFromGroup 
};