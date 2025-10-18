// import { PrismaClient } from '@prisma/client';
// const prisma = new PrismaClient();

// // Create a new Facility
// const createFacility = async (req, res) => {
//   const { name, location, processingDetails } = req.body;

//   try {
//     const facility = await prisma.facility.create({
//       data: {
//         name,
//         location,
//         processingDetails,
//       },
//     });
//     res.status(201).json(facility);
//   } catch (error) {
//     res.status(500).json({ error: 'Error creating facility' });
//   }
// };

// // Get all Facilities
// const getAllFacilities = async (req, res) => {
//   try {
//     const facilities = await prisma.facility.findMany();
//     res.status(200).json(facilities);
//   } catch (error) {
//     res.status(500).json({ error: 'Error retrieving facilities' });
//   }
// };

// // Get a single Facility by ID
// const getFacilityById = async (req, res) => {
//   const { id } = req.params;

//   try {
//     const facility = await prisma.facility.findUnique({
//       where: { id },
//     });

//     if (!facility) {
//       return res.status(404).json({ error: 'Facility not found' });
//     }

//     res.status(200).json(facility);
//   } catch (error) {
//     res.status(500).json({ error: 'Error retrieving facility' });
//   }
// };

// // Update a Facility
// const updateFacility = async (req, res) => {
//   const { id } = req.params;
//   const { name, location, processingDetails } = req.body;

//   try {
//     const facility = await prisma.facility.update({
//       where: { id },
//       data: {
//         name,
//         location,
//         processingDetails,
//       },
//     });

//     res.status(200).json(facility);
//   } catch (error) {
//     res.status(500).json({ error: 'Error updating facility' });
//   }
// };

// // Delete a Facility
// const deleteFacility = async (req, res) => {
//   const { id } = req.params;

//   try {
//     const facility = await prisma.facility.delete({
//       where: { id },
//     });

//     res.status(200).json({ message: 'Facility deleted successfully', facility });
//   } catch (error) {
//     res.status(500).json({ error: 'Error deleting facility' });
//   }
// };

// // Get Produce handled by a Facility
// // const getProduceHandledByFacility = async (req, res) => {
// //   const { id } = req.params;

// //   try {
// //     const facility = await prisma.facility.findUnique({
// //       where: { id },
// //       include: {
// //         producesHandled: true, // Include the related produce records
// //       },
// //     });

// //     if (!facility) {
// //       return res.status(404).json({ error: 'Facility not found' });
// //     }

// //     res.status(200).json(facility.producesHandled);
// //   } catch (error) {
// //     res.status(500).json({ error: 'Error retrieving produce handled by the facility' });
// //   }
// // };
// const getProduceHandledByFacility = async (req, res) => {
//   const { id } = req.params;

//   try {
//     // Fetch the facility details along with its related data
//     const facilityDetails = await prisma.facility.findUnique({
//       where: {
//         id: id,
//       },
//       include: {
//         // shipments: true,
//         // storage: true,
//         loads: true,
//         // producesHandled: {
//         //   include: {
//         //     shipments: true,
//         //     qrCode: true,
//         //     storage: true,
//         //     loadAtFacility: true
//         //   }
//         // }
//       },
//     });

//     if (!facilityDetails) {
//       return res.status(404).json({ error: 'Facility not found' });
//     }

//     // Calculate total workload based on loadAtFacility records
//     const workload = facilityDetails.loads.reduce((total, load) => total + load.quantity, 0);
//     facilityDetails.workload = workload;

//     res.status(200).json(facilityDetails);
//   } catch (error) {
//     console.error("Error retrieving facility details:", error);
//     res.status(500).json({ error: 'Error retrieving facility details' });
//   }
// };


// // Get all shipments at a Facility
// const getShipmentsAtFacility = async (req, res) => {
//   const { id } = req.params;

//   try {
//     const facility = await prisma.facility.findUnique({
//       where: { id },
//       include: {
//         shipments: true, // Include the related shipment records
//       },
//     });

//     if (!facility) {
//       return res.status(404).json({ error: 'Facility not found' });
//     }

//     res.status(200).json(facility.shipments);
//   } catch (error) {
//     res.status(500).json({ error: 'Error retrieving shipments at the facility' });
//   }
// };

// // Add produce to a Facility (link produce and facility)
// const addProduceToFacility = async (req, res) => {
//   const { facilityId, produceId, quantities } = req.body;

//   try {
//     // Check if produceId and quantities are arrays and have the same length
//     if (!Array.isArray(produceId) || !Array.isArray(quantities)) {
//       return res.status(400).json({ error: 'produceId and quantities must be arrays' });
//     }

//     if (produceId.length !== quantities.length) {
//       return res.status(400).json({ error: 'produceId and quantities arrays must have the same length' });
//     }

//     // Create loads array by matching each produceId with its corresponding quantity
//     const loads = produceId.map((id, index) => {
//       return {
//         produceId: id,  // The produceId
//         quantity: quantities[index],  // The corresponding quantity
//       };
//     });

//     // Update the facility with the new loads
//     const facility = await prisma.facility.update({
//       where: { id: facilityId },
//       data: {
//         loads: {
//           create: loads,  // Create multiple loads
//         },
//       },
//     });

//     res.status(200).json(facility);
//   } catch (error) {
//     console.error("Error:", error);
//     res.status(500).json({ error: 'Error adding produce to facility' });
//   }
// };



 
// // Function to get a specific facility's name and workload by ID
// const getFacilityWorkloadById = async (req, res) => {
//   try {
//     const { id } = req.params;

//     // Querying the Facility table for name and workload
//     const facility = await prisma.facility.findUnique({
//       where: {
//         id: id,
//       },
//       select: {
//         name: true,
//         workload: true,
//       },
//     });

//     if (!facility) {
//       return res.status(404).json({ message: "Facility not found" });
//     }

//     return res.status(200).json(facility);
//   } catch (error) {
//     console.error("Error fetching facility workload by ID:", error);
//     return res.status(500).json({ message: "An error occurred while fetching facility workload." });
//   }
// };

// // Function to get all facilities' workloads in a given location
// const getFacilitiesWorkloadByLocation = async (req, res) => {
//   try {
//     const { location } = req.params;

//     // Querying the Facility table for all facilities in a given location
//     const facilities = await prisma.facility.findMany({
//       where: {
//         location: location,
//       },
//       select: {
//         name: true,
//         workload: true,
//       },
//     });

//     if (facilities.length === 0) {
//       return res.status(404).json({ message: "No facilities found in this location" });
//     }

//     return res.status(200).json(facilities);
//   } catch (error) {
//     console.error("Error fetching facilities workload by location:", error);
//     return res.status(500).json({ message: "An error occurred while fetching facilities' workloads." });
//   }
// };


// export default {
//   createFacility,
//   getAllFacilities,
//   getFacilityById,
//   updateFacility,
//   deleteFacility,
//   getProduceHandledByFacility,
//   getShipmentsAtFacility,
//   addProduceToFacility,
//   getFacilityWorkloadById,
//   getFacilitiesWorkloadByLocation

// };



// Use the same connection function from previous conversion
const createConnection = async () => {
  // Your existing connection code here
};

// Helper function to generate ID
function generateId() {
  return 'facility_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// Create a new Facility
const createFacility = async (req, res) => {
  let db;
  try {
    db = await createConnection();
    const { name, location, processingDetails } = req.body;

    const facilityId = generateId();
    
    const [result] = await db.execute(
      'INSERT INTO facilities (id, name, location, processingDetails) VALUES (?, ?, ?, ?)',
      [facilityId, name, location, processingDetails]
    );

    // Get the created facility
    const [facilities] = await db.execute(
      'SELECT * FROM facilities WHERE id = ?',
      [facilityId]
    );

    res.status(201).json(facilities[0]);
  } catch (error) {
    console.error('Error creating facility:', error);
    res.status(500).json({ error: 'Error creating facility' });
  }
};

// Get all Facilities
const getAllFacilities = async (req, res) => {
  let db;
  try {
    db = await createConnection();
    
    const [facilities] = await db.execute(
      'SELECT * FROM facilities ORDER BY createdAt DESC'
    );

    res.status(200).json(facilities);
  } catch (error) {
    console.error('Error retrieving facilities:', error);
    res.status(500).json({ error: 'Error retrieving facilities' });
  }
};

// Get a single Facility by ID
const getFacilityById = async (req, res) => {
  let db;
  try {
    db = await createConnection();
    const { id } = req.params;

    const [facilities] = await db.execute(
      'SELECT * FROM facilities WHERE id = ?',
      [id]
    );

    if (facilities.length === 0) {
      return res.status(404).json({ error: 'Facility not found' });
    }

    res.status(200).json(facilities[0]);
  } catch (error) {
    console.error('Error retrieving facility:', error);
    res.status(500).json({ error: 'Error retrieving facility' });
  }
};

// Update a Facility
const updateFacility = async (req, res) => {
  let db;
  try {
    db = await createConnection();
    const { id } = req.params;
    const { name, location, processingDetails } = req.body;

    // Check if facility exists
    const [existingFacilities] = await db.execute(
      'SELECT id FROM facilities WHERE id = ?',
      [id]
    );

    if (existingFacilities.length === 0) {
      return res.status(404).json({ error: 'Facility not found' });
    }

    // Build dynamic update query
    const updates = [];
    const values = [];
    
    if (name !== undefined) { updates.push('name = ?'); values.push(name); }
    if (location !== undefined) { updates.push('location = ?'); values.push(location); }
    if (processingDetails !== undefined) { updates.push('processingDetails = ?'); values.push(processingDetails); }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    values.push(id);

    await db.execute(
      `UPDATE facilities SET ${updates.join(', ')}, updatedAt = CURRENT_TIMESTAMP WHERE id = ?`,
      values
    );

    // Get updated facility
    const [facilities] = await db.execute(
      'SELECT * FROM facilities WHERE id = ?',
      [id]
    );

    res.status(200).json(facilities[0]);
  } catch (error) {
    console.error('Error updating facility:', error);
    res.status(500).json({ error: 'Error updating facility' });
  }
};

// Delete a Facility
const deleteFacility = async (req, res) => {
  let db;
  try {
    db = await createConnection();
    const { id } = req.params;

    // Check if facility exists
    const [existingFacilities] = await db.execute(
      'SELECT id FROM facilities WHERE id = ?',
      [id]
    );

    if (existingFacilities.length === 0) {
      return res.status(404).json({ error: 'Facility not found' });
    }

    // Get facility before deletion for response
    const [facilities] = await db.execute(
      'SELECT * FROM facilities WHERE id = ?',
      [id]
    );

    await db.execute('DELETE FROM facilities WHERE id = ?', [id]);

    res.status(200).json({ 
      message: 'Facility deleted successfully', 
      facility: facilities[0] 
    });
  } catch (error) {
    console.error('Error deleting facility:', error);
    res.status(500).json({ error: 'Error deleting facility' });
  }
};

// Get Produce handled by a Facility
const getProduceHandledByFacility = async (req, res) => {
  let db;
  try {
    db = await createConnection();
    const { id } = req.params;

    // Get facility details
    const [facilities] = await db.execute(
      'SELECT * FROM facilities WHERE id = ?',
      [id]
    );

    if (facilities.length === 0) {
      return res.status(404).json({ error: 'Facility not found' });
    }

    const facility = facilities[0];

    // Get loads for this facility
    const [loads] = await db.execute(
      `SELECT l.*, p.name as produceName, p.type as produceType 
       FROM loads l 
       LEFT JOIN produces p ON l.produceId = p.id 
       WHERE l.facilityId = ?`,
      [id]
    );

    // Calculate total workload
    const workload = loads.reduce((total, load) => total + parseFloat(load.quantity), 0);
    
    // Update facility workload in database
    await db.execute(
      'UPDATE facilities SET workload = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?',
      [workload, id]
    );

    // Return combined facility details with loads
    const facilityDetails = {
      ...facility,
      loads: loads,
      workload: workload
    };

    res.status(200).json(facilityDetails);
  } catch (error) {
    console.error("Error retrieving facility details:", error);
    res.status(500).json({ error: 'Error retrieving facility details' });
  }
};

// Get all shipments at a Facility
const getShipmentsAtFacility = async (req, res) => {
  let db;
  try {
    db = await createConnection();
    const { id } = req.params;

    // Check if facility exists
    const [facilities] = await db.execute(
      'SELECT id FROM facilities WHERE id = ?',
      [id]
    );

    if (facilities.length === 0) {
      return res.status(404).json({ error: 'Facility not found' });
    }

    // Get shipments for this facility (assuming you have a shipments table)
    const [shipments] = await db.execute(
      'SELECT * FROM shipments WHERE facilityId = ? ORDER BY createdAt DESC',
      [id]
    );

    res.status(200).json(shipments);
  } catch (error) {
    console.error('Error retrieving shipments at the facility:', error);
    res.status(500).json({ error: 'Error retrieving shipments at the facility' });
  }
};

// Add produce to a Facility (link produce and facility)
const addProduceToFacility = async (req, res) => {
  let db;
  try {
    db = await createConnection();
    const { facilityId, produceId, quantities } = req.body;

    // Check if produceId and quantities are arrays and have the same length
    if (!Array.isArray(produceId) || !Array.isArray(quantities)) {
      return res.status(400).json({ error: 'produceId and quantities must be arrays' });
    }

    if (produceId.length !== quantities.length) {
      return res.status(400).json({ error: 'produceId and quantities arrays must have the same length' });
    }

    // Check if facility exists
    const [facilities] = await db.execute(
      'SELECT id FROM facilities WHERE id = ?',
      [facilityId]
    );

    if (facilities.length === 0) {
      return res.status(404).json({ error: 'Facility not found' });
    }

    // Start transaction for multiple inserts
    await db.execute('START TRANSACTION');

    try {
      // Create loads for each produceId-quantity pair
      for (let i = 0; i < produceId.length; i++) {
        const loadId = generateId();
        
        await db.execute(
          'INSERT INTO loads (id, facilityId, produceId, quantity) VALUES (?, ?, ?, ?)',
          [loadId, facilityId, produceId[i], quantities[i]]
        );
      }

      await db.execute('COMMIT');

      // Get updated facility with loads
      const [updatedFacilities] = await db.execute(
        'SELECT * FROM facilities WHERE id = ?',
        [facilityId]
      );

      res.status(200).json(updatedFacilities[0]);
    } catch (error) {
      await db.execute('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error("Error adding produce to facility:", error);
    
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Produce already exists in this facility' });
    }
    
    res.status(500).json({ error: 'Error adding produce to facility' });
  }
};

// Function to get a specific facility's name and workload by ID
const getFacilityWorkloadById = async (req, res) => {
  let db;
  try {
    db = await createConnection();
    const { id } = req.params;

    const [facilities] = await db.execute(
      'SELECT name, workload FROM facilities WHERE id = ?',
      [id]
    );

    if (facilities.length === 0) {
      return res.status(404).json({ message: "Facility not found" });
    }

    return res.status(200).json(facilities[0]);
  } catch (error) {
    console.error("Error fetching facility workload by ID:", error);
    return res.status(500).json({ message: "An error occurred while fetching facility workload." });
  }
};

// Function to get all facilities' workloads in a given location
const getFacilitiesWorkloadByLocation = async (req, res) => {
  let db;
  try {
    db = await createConnection();
    const { location } = req.params;

    const [facilities] = await db.execute(
      'SELECT name, workload FROM facilities WHERE location = ? ORDER BY workload DESC',
      [location]
    );

    if (facilities.length === 0) {
      return res.status(404).json({ message: "No facilities found in this location" });
    }

    return res.status(200).json(facilities);
  } catch (error) {
    console.error("Error fetching facilities workload by location:", error);
    return res.status(500).json({ message: "An error occurred while fetching facilities' workloads." });
  }
};

// Update facility workload (helper function that can be called internally)
const updateFacilityWorkload = async (facilityId) => {
  let db;
  try {
    db = await createConnection();
    
    // Calculate total workload from loads
    const [result] = await db.execute(
      'SELECT COALESCE(SUM(quantity), 0) as totalWorkload FROM loads WHERE facilityId = ?',
      [facilityId]
    );
    
    const totalWorkload = result[0].totalWorkload;
    
    // Update facility workload
    await db.execute(
      'UPDATE facilities SET workload = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?',
      [totalWorkload, facilityId]
    );
    
    return totalWorkload;
  } catch (error) {
    console.error('Error updating facility workload:', error);
    throw error;
  }
};

export default {
  createFacility,
  getAllFacilities,
  getFacilityById,
  updateFacility,
  deleteFacility,
  getProduceHandledByFacility,
  getShipmentsAtFacility,
  addProduceToFacility,
  getFacilityWorkloadById,
  getFacilitiesWorkloadByLocation,
  updateFacilityWorkload
};