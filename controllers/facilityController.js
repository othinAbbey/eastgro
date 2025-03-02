import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// Create a new Facility
const createFacility = async (req, res) => {
  const { name, location, processingDetails } = req.body;

  try {
    const facility = await prisma.facility.create({
      data: {
        name,
        location,
        processingDetails,
      },
    });
    res.status(201).json(facility);
  } catch (error) {
    res.status(500).json({ error: 'Error creating facility' });
  }
};

// Get all Facilities
const getAllFacilities = async (req, res) => {
  try {
    const facilities = await prisma.facility.findMany();
    res.status(200).json(facilities);
  } catch (error) {
    res.status(500).json({ error: 'Error retrieving facilities' });
  }
};

// Get a single Facility by ID
const getFacilityById = async (req, res) => {
  const { id } = req.params;

  try {
    const facility = await prisma.facility.findUnique({
      where: { id },
    });

    if (!facility) {
      return res.status(404).json({ error: 'Facility not found' });
    }

    res.status(200).json(facility);
  } catch (error) {
    res.status(500).json({ error: 'Error retrieving facility' });
  }
};

// Update a Facility
const updateFacility = async (req, res) => {
  const { id } = req.params;
  const { name, location, processingDetails } = req.body;

  try {
    const facility = await prisma.facility.update({
      where: { id },
      data: {
        name,
        location,
        processingDetails,
      },
    });

    res.status(200).json(facility);
  } catch (error) {
    res.status(500).json({ error: 'Error updating facility' });
  }
};

// Delete a Facility
const deleteFacility = async (req, res) => {
  const { id } = req.params;

  try {
    const facility = await prisma.facility.delete({
      where: { id },
    });

    res.status(200).json({ message: 'Facility deleted successfully', facility });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting facility' });
  }
};

// Get Produce handled by a Facility
// const getProduceHandledByFacility = async (req, res) => {
//   const { id } = req.params;

//   try {
//     const facility = await prisma.facility.findUnique({
//       where: { id },
//       include: {
//         producesHandled: true, // Include the related produce records
//       },
//     });

//     if (!facility) {
//       return res.status(404).json({ error: 'Facility not found' });
//     }

//     res.status(200).json(facility.producesHandled);
//   } catch (error) {
//     res.status(500).json({ error: 'Error retrieving produce handled by the facility' });
//   }
// };
const getProduceHandledByFacility = async (req, res) => {
  const { id } = req.params;

  try {
    // Fetch the facility details along with its related data
    const facilityDetails = await prisma.facility.findUnique({
      where: {
        id: id,
      },
      include: {
        // shipments: true,
        // storage: true,
        loads: true,
        // producesHandled: {
        //   include: {
        //     shipments: true,
        //     qrCode: true,
        //     storage: true,
        //     loadAtFacility: true
        //   }
        // }
      },
    });

    if (!facilityDetails) {
      return res.status(404).json({ error: 'Facility not found' });
    }

    // Calculate total workload based on loadAtFacility records
    const workload = facilityDetails.loads.reduce((total, load) => total + load.quantity, 0);
    facilityDetails.workload = workload;

    res.status(200).json(facilityDetails);
  } catch (error) {
    console.error("Error retrieving facility details:", error);
    res.status(500).json({ error: 'Error retrieving facility details' });
  }
};


// Get all shipments at a Facility
const getShipmentsAtFacility = async (req, res) => {
  const { id } = req.params;

  try {
    const facility = await prisma.facility.findUnique({
      where: { id },
      include: {
        shipments: true, // Include the related shipment records
      },
    });

    if (!facility) {
      return res.status(404).json({ error: 'Facility not found' });
    }

    res.status(200).json(facility.shipments);
  } catch (error) {
    res.status(500).json({ error: 'Error retrieving shipments at the facility' });
  }
};

// Add produce to a Facility (link produce and facility)
const addProduceToFacility = async (req, res) => {
  const { facilityId, produceId, quantities } = req.body;

  try {
    // Check if produceId and quantities are arrays and have the same length
    if (!Array.isArray(produceId) || !Array.isArray(quantities)) {
      return res.status(400).json({ error: 'produceId and quantities must be arrays' });
    }

    if (produceId.length !== quantities.length) {
      return res.status(400).json({ error: 'produceId and quantities arrays must have the same length' });
    }

    // Create loads array by matching each produceId with its corresponding quantity
    const loads = produceId.map((id, index) => {
      return {
        produceId: id,  // The produceId
        quantity: quantities[index],  // The corresponding quantity
      };
    });

    // Update the facility with the new loads
    const facility = await prisma.facility.update({
      where: { id: facilityId },
      data: {
        loads: {
          create: loads,  // Create multiple loads
        },
      },
    });

    res.status(200).json(facility);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: 'Error adding produce to facility' });
  }
};



 
// Function to get a specific facility's name and workload by ID
const getFacilityWorkloadById = async (req, res) => {
  try {
    const { id } = req.params;

    // Querying the Facility table for name and workload
    const facility = await prisma.facility.findUnique({
      where: {
        id: id,
      },
      select: {
        name: true,
        workload: true,
      },
    });

    if (!facility) {
      return res.status(404).json({ message: "Facility not found" });
    }

    return res.status(200).json(facility);
  } catch (error) {
    console.error("Error fetching facility workload by ID:", error);
    return res.status(500).json({ message: "An error occurred while fetching facility workload." });
  }
};

// Function to get all facilities' workloads in a given location
const getFacilitiesWorkloadByLocation = async (req, res) => {
  try {
    const { location } = req.params;

    // Querying the Facility table for all facilities in a given location
    const facilities = await prisma.facility.findMany({
      where: {
        location: location,
      },
      select: {
        name: true,
        workload: true,
      },
    });

    if (facilities.length === 0) {
      return res.status(404).json({ message: "No facilities found in this location" });
    }

    return res.status(200).json(facilities);
  } catch (error) {
    console.error("Error fetching facilities workload by location:", error);
    return res.status(500).json({ message: "An error occurred while fetching facilities' workloads." });
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
  getFacilitiesWorkloadByLocation

};
