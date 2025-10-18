// import { PrismaClient }from '@prisma/client';
// const prisma = new PrismaClient();
// import bcrypt from 'bcrypt';
// import jwt from 'jsonwebtoken';

// const createServiceProvider = async (req, res) => {
//     try {
//       const { 
//         name, 
//         contact, 
//         email, 
//         password,
//         businessName,
//         description,
//         location,
//         region,
//         qualifications,
//         equipment,
//         minOrderAmount,
//         availability,
//         travelRadius
//       } = req.body;
  
//       // Validate required fields
//       if (!name || !contact || !email || !password || !businessName) {
//         return res.status(400).json({ 
//           error: 'Missing required fields',
//           requiredFields: ['name', 'contact', 'email', 'password', 'businessName']
//         });
//       }
  
//       // Hash the password with bcrypt
//       const saltRounds = 10;
//       const hashedPassword = await bcrypt.hash(password, saltRounds);
  
//       // Create service provider
//       const serviceProvider = await prisma.serviceProvider.create({
//         data: {
//           name,
//           contact,
//           email,
//           password: hashedPassword,
//           businessName,
//           description: description || null,
//           location: location || 'Not specified',
//           region: region || 'Eastern',
//           qualifications: qualifications || [],
//           equipment: equipment || [],
//           minOrderAmount: minOrderAmount || null,
//           availability: availability || 'Monday-Friday, 8AM-5PM',
//           travelRadius: travelRadius || null,
//           role: 'EXPERT'
//         }
//       });
  
//       // Remove password from response
//       const { password: _, ...responseData } = serviceProvider;
      
//       res.status(201).json(responseData);
  
//     } catch (error) {
//       console.error('Error creating service provider:', error);
      
//       // Handle unique constraint errors
//       if (error.code === 'P2002') {
//         const field = error.meta?.target?.[0];
//         return res.status(400).json({
//           error: `${field} already exists`,
//           field
//         });
//       }
      
//       res.status(500).json({ 
//         error: 'Failed to create service provider',
//         details: error.message 
//       });
//     }
//   };
// // Get all service providers
// const getAllServiceProviders = async (req, res) => {
//   try {
//     const { region, service, minRating } = req.query;
    
//     const where = {};
    
//     if (region) where.region = region;
//     if (minRating) where.rating = { gte: parseFloat(minRating) };
    
//     if (service) {
//       where.servicesOffered = {
//         some: {
//           service: {
//             name: { contains: service, mode: 'insensitive' }
//           }
//         }
//       };
//     }

//     const serviceProviders = await prisma.serviceProvider.findMany({
//       where,
//       include: {
//         servicesOffered: {
//           include: {
//             service: true
//           }
//         }
//       }
//     });

//     res.json(serviceProviders);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

// // Get single service provider
// const getServiceProvider = async (req, res) => {
//   try {
//     const { id } = req.params;
    
//     const serviceProvider = await prisma.serviceProvider.findUnique({
//       where: { id },
//       include: {
//         servicesOffered: {
//           include: {
//             service: true
//           }
//         },
//         transactions: true
//       }
//     });

//     if (!serviceProvider) {
//       return res.status(404).json({ error: 'Service provider not found' });
//     }

//     res.json(serviceProvider);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

// // Update service provider
// const updateServiceProvider = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const updates = req.body;

//     // Remove fields that shouldn't be updated
//     delete updates.id;
//     delete updates.email; // Email shouldn't be changed typically
//     delete updates.rating; // Rating should be calculated, not manually set

//     const updatedProvider = await prisma.serviceProvider.update({
//       where: { id },
//       data: updates
//     });

//     res.json(updatedProvider);
//   } catch (error) {
//     res.status(400).json({ error: error.message });
//   }
// };

// // Delete service provider
// const deleteServiceProvider = async (req, res) => {
//   try {
//     const { id } = req.params;

//     // First delete service offerings
//     await prisma.serviceOffering.deleteMany({
//       where: { serviceProviderId: id }
//     });

//     // Then delete the provider
//     await prisma.serviceProvider.delete({
//       where: { id }
//     });

//     res.json({ message: 'Service provider deleted successfully' });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

// // Add a service offering
// const addServiceOffering = async (req, res) => {
//   try {
//     // const { serviceProviderId } = req.params;
//     const { serviceId, rate, minQuantity, unit, notes,serviceProviderId } = req.body;

//     const offering = await prisma.serviceOfferings.create({
//       data: {
//         serviceId,
//         serviceProviderId,
//         rate,
//         minQuantity,
//         unit,
//         notes,
//         isActive: true
//       },
//       include: {
//         service: true,
//         serviceProvider: true
//       }
//     });

//     res.status(201).json(offering);
//   } catch (error) {
//     res.status(400).json({ error: error.message });
//   }
// };

// // Update a service offering
// const updateServiceOffering = async (req, res) => {
//   try {
//     const { offeringId } = req.params;
//     const updates = req.body;

//     // Remove fields that shouldn't be updated
//     delete updates.id;
//     delete updates.serviceId;
//     delete updates.serviceProviderId;

//     const updatedOffering = await prisma.serviceOffering.update({
//       where: { id: offeringId },
//       data: updates,
//       include: {
//         service: true
//       }
//     });

//     res.json(updatedOffering);
//   } catch (error) {
//     res.status(400).json({ error: error.message });
//   }
// };

// // Get all Service Offerings
// const getAllServiceOfferings = async (req, res) => {
//     try {
//       const offerings = await prisma.serviceOfferings.findMany({
//         include: {
//           service: {
//             include: {
//               // Include any nested relations inside service if you have them
//             }
//           },
//           serviceProvider: {
//             include: {
//               // Include any nested relations inside provider if needed
//             }
//           }
//         }
//       });
  
//       res.status(200).json(offerings);
//     } catch (error) {
//       console.error('[GetAllServiceOfferings Error]', error);
//       res.status(500).json({ error: 'Failed to fetch service offerings.' });
//     }
//   };
 


// ///==========SERVICE CONTROLLERS=================///
// const createService = async (req, res) => {
//     try {
//       const { name, description, basePrice, category } = req.body;
  
//       // Basic validation
//       if (!name || !description || !basePrice || !category) {
//         return res.status(400).json({ error: 'All fields are required.' });
//       }
  
//       // Create service
//       const newService = await prisma.service.create({
//         data: {
//           name,
//           description,
//           basePrice: parseFloat(basePrice),
//           category,
//           isActive: true, // default true
//         },
//       });
  
//       return res.status(201).json({
//         message: 'Service created successfully!',
//         service: newService,
//       });
  
//     } catch (error) {
//       console.error('Error creating service:', error.message);
//       return res.status(500).json({ error: 'Something went wrong.' });
//     }
//   };

// // Update service
// const updateService = async (req, res) => {
//     try {
//       const { id } = req.params;
//       const updates = req.body;
  
//       // Remove fields that shouldn't be updated
//       delete updates.id;
  
//       const updatedService = await prisma.service.update({
//         where: { id },
//         data: updates,
//       });
  
//       return res.status(200).json({
//         message: 'Service updated successfully!',
//         service: updatedService,
//       });
  
//     } catch (error) {
//       console.error('Error updating service:', error.message);
//       return res.status(500).json({ error: 'Something went wrong.' });
//     }
//   };
// // Delete service   
// const deleteService = async (req, res) => {
//     try {
//       const { id } = req.params;
  
//       await prisma.service.delete({
//         where: { id },
//       });
  
//       return res.status(200).json({
//         message: 'Service deleted successfully!',
//       });
  
//     } catch (error) {
//       console.error('Error deleting service:', error.message);
//       return res.status(500).json({ error: 'Something went wrong.' });
//     }
//   };
// // Get all services
// const getAllServices = async (req, res) => {
//     try {
//       const services = await prisma.service.findMany({
//         where: { isActive: true },
//       });
  
//       return res.status(200).json(services);
  
//     } catch (error) {
//       console.error('Error fetching services:', error.message);
//       return res.status(500).json({ error: 'Something went wrong.' });
//     }
//   };
// // Get a single service
// const getService = async (req, res) => {
//     try {
//       const { id } = req.params;
  
//       const service = await prisma.service.findUnique({
//         where: { id },
//       });
  
//       if (!service) {
//         return res.status(404).json({ error: 'Service not found.' });
//       }
  
//       return res.status(200).json(service);
  
//     } catch (error) {
//       console.error('Error fetching service:', error.message);
//       return res.status(500).json({ error: 'Something went wrong.' });
//     }
//   };
// // Get all services by category

// const getAllServiceCategories = async (req, res) => {
//     try {
//       const categories = await prisma.service.findMany({
//         where: {
//           isActive: true, // Only active services if needed
//         },
//         select: {
//           category: true,
//         },
//         distinct: ['category'], // Get unique categories only
//       });
  
//       res.status(200).json(categories.map(cat => cat.category));
//     } catch (error) {
//       console.error('[getAllServiceCategories Error]', error);
//       res.status(500).json({ error: 'Failed to fetch service categories.' });
//     }
//   };
// // Get all services by service category
// const getServicesByCategory = async (req, res) => {
//     const { category } = req.params;
  
//     try {
//       const services = await prisma.service.findMany({
//         where: {
//           category: category,
//           isActive: true, // Optional filter for active services
//         },
//       });
  
//       res.status(200).json(services);
//     } catch (error) {
//       console.error('[getServicesByCategory Error]', error);
//       res.status(500).json({ error: 'Failed to fetch services for this category.' });
//     }
//   };
  
// // Get all services by service provider
// const getProvidersByService = async (req, res) => {
//     const { serviceId } = req.params;
  
//     try {
//         const providers = await prisma.serviceProvider.findMany({
//             where: {
//               servicesOffered: {
//                 some: {
//                   serviceId: serviceId,
//                 },
//               },
//             },
//             include: {
//               servicesOffered: {
//                 include: {
//                   service: true,
//                 },
//               },
//             },
//           });
          
  
//       res.status(200).json(providers);
//     } catch (error) {
//       console.error('[getProvidersByService Error]', error);
//       res.status(500).json({ error: 'Failed to fetch providers for this service.' });
//     }
//   };
  
// // Get all services by location
// const getServicesByLocation = async (req, res) => {
//     try {
//       const { location } = req.params;
  
//       const services = await prisma.service.findMany({
//         where: { location, isActive: true },
//       });
  
//       return res.status(200).json(services);
  
//     } catch (error) {
//       console.error('Error fetching services by location:', error.message);
//       return res.status(500).json({ error: 'Something went wrong.' });
//     }
//   };
// // Get all services by region
// const getServicesByRegion = async (req, res) => {
//     try {
//       const { region } = req.params;
  
//       const services = await prisma.service.findMany({
//         where: { region, isActive: true },
//       });
  
//       return res.status(200).json(services);
  
//     } catch (error) {
//       console.error('Error fetching services by region:', error.message);
//       return res.status(500).json({ error: 'Something went wrong.' });
//     }
//   };

// // Get all services by price range
// const getServicesByPriceRange = async (req, res) => {
//     try {
//       const { minPrice, maxPrice } = req.params;
  
//       const services = await prisma.service.findMany({
//         where: { basePrice: { gte: minPrice, lte: maxPrice }, isActive: true },
//       });
  
//       return res.status(200).json(services);
  
//     } catch (error) {
//       console.error('Error fetching services by price range:', error.message);
//       return res.status(500).json({ error: 'Something went wrong.' });
//     }
//   };
// // Get all services by name
// const getServicesByName = async (req, res) => {
//     try {
//       const { name } = req.params;
  
//       const services = await prisma.service.findMany({
//         where: { name: { contains: name }, isActive: true },
//       });
  
//       return res.status(200).json(services);
  
//     } catch (error) {
//       console.error('Error fetching services by name:', error.message);
//       return res.status(500).json({ error: 'Something went wrong.' });
//     }
//   };

// export default {
//   createServiceProvider,
//   getAllServiceProviders,
//   getServiceProvider,
//   updateServiceProvider,
//   deleteServiceProvider,
//   addServiceOffering,
//   updateServiceOffering,
//   getAllServiceOfferings,
//   createService,
//     updateService,
//     deleteService,
//     getAllServices,
//     getService,
//     getAllServiceCategories,
//     getServicesByCategory,
//     getProvidersByService,
//     getServicesByLocation,
//     getServicesByRegion,
//     getServicesByPriceRange,
//     getServicesByName
    
// };

import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// Use the same connection function from previous conversions
const createConnection = async () => {
  // Your existing connection code here
};

// Helper functions to generate IDs
function generateId(prefix) {
  return `${prefix}_` + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// Create Service Provider
const createServiceProvider = async (req, res) => {
    let db;
    try {
      db = await createConnection();
      const { 
        name, 
        contact, 
        email, 
        password,
        businessName,
        description,
        location,
        region,
        qualifications,
        equipment,
        minOrderAmount,
        availability,
        travelRadius
      } = req.body;
  
      // Validate required fields
      if (!name || !contact || !email || !password || !businessName) {
        return res.status(400).json({ 
          error: 'Missing required fields',
          requiredFields: ['name', 'contact', 'email', 'password', 'businessName']
        });
      }
  
      // Check if email or contact already exists
      const [existingProviders] = await db.execute(
        'SELECT id FROM service_providers WHERE email = ? OR contact = ?',
        [email, contact]
      );

      if (existingProviders.length > 0) {
        return res.status(400).json({
          error: 'Email or contact already exists'
        });
      }
  
      // Hash the password
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);
  
      // Create service provider
      const providerId = generateId('provider');
      await db.execute(
        `INSERT INTO service_providers (
          id, name, contact, email, password, businessName, description, 
          location, region, qualifications, equipment, minOrderAmount, 
          availability, travelRadius, role
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          providerId, name, contact, email, hashedPassword, businessName,
          description || null, location || 'Not specified', region || 'EASTERN',
          qualifications ? JSON.stringify(qualifications) : null,
          equipment ? JSON.stringify(equipment) : null,
          minOrderAmount || null,
          availability || 'Monday-Friday, 8AM-5PM',
          travelRadius || null,
          'EXPERT'
        ]
      );
  
      // Get created provider without password
      const [providers] = await db.execute(
        `SELECT id, name, contact, email, businessName, description, location, 
                region, qualifications, equipment, minOrderAmount, availability, 
                travelRadius, rating, role, createdAt, updatedAt 
         FROM service_providers WHERE id = ?`,
        [providerId]
      );
      
      res.status(201).json(providers[0]);
  
    } catch (error) {
      console.error('Error creating service provider:', error);
      
      if (error.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({
          error: 'Email or contact already exists'
        });
      }
      
      res.status(500).json({ 
        error: 'Failed to create service provider',
        details: error.message 
      });
    }
};

// Get all service providers
const getAllServiceProviders = async (req, res) => {
  let db;
  try {
    db = await createConnection();
    const { region, service, minRating } = req.query;
    
    let query = `
      SELECT sp.*, 
             COUNT(DISTINCT so.id) as serviceCount,
             AVG(so.rate) as avgRate
      FROM service_providers sp
      LEFT JOIN service_offerings so ON sp.id = so.serviceProviderId
      WHERE sp.isActive = TRUE
    `;
    
    const params = [];
    
    if (region) {
      query += ' AND sp.region = ?';
      params.push(region);
    }
    
    if (minRating) {
      query += ' AND sp.rating >= ?';
      params.push(parseFloat(minRating));
    }
    
    if (service) {
      query += ` AND sp.id IN (
        SELECT so2.serviceProviderId 
        FROM service_offerings so2 
        JOIN services s ON so2.serviceId = s.id 
        WHERE s.name LIKE ? AND so2.isActive = TRUE
      )`;
      params.push(`%${service}%`);
    }
    
    query += ' GROUP BY sp.id ORDER BY sp.rating DESC, sp.createdAt DESC';
    
    const [providers] = await db.execute(query, params);

    // Get services for each provider
    const providersWithServices = await Promise.all(
      providers.map(async (provider) => {
        const [services] = await db.execute(
          `SELECT s.*, so.rate, so.minQuantity, so.unit, so.notes 
           FROM service_offerings so 
           JOIN services s ON so.serviceId = s.id 
           WHERE so.serviceProviderId = ? AND so.isActive = TRUE`,
          [provider.id]
        );
        
        return {
          ...provider,
          servicesOffered: services,
          qualifications: provider.qualifications ? JSON.parse(provider.qualifications) : [],
          equipment: provider.equipment ? JSON.parse(provider.equipment) : []
        };
      })
    );

    res.json(providersWithServices);
  } catch (error) {
    console.error('Get all service providers error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get single service provider
const getServiceProvider = async (req, res) => {
  let db;
  try {
    db = await createConnection();
    const { id } = req.params;
    
    const [providers] = await db.execute(
      `SELECT sp.*, 
              COUNT(DISTINCT so.id) as serviceCount,
              AVG(so.rate) as avgRate
       FROM service_providers sp
       LEFT JOIN service_offerings so ON sp.id = so.serviceProviderId
       WHERE sp.id = ?
       GROUP BY sp.id`,
      [id]
    );

    if (providers.length === 0) {
      return res.status(404).json({ error: 'Service provider not found' });
    }

    const provider = providers[0];

    // Get services offered
    const [services] = await db.execute(
      `SELECT s.*, so.rate, so.minQuantity, so.unit, so.notes 
       FROM service_offerings so 
       JOIN services s ON so.serviceId = s.id 
       WHERE so.serviceProviderId = ? AND so.isActive = TRUE`,
      [id]
    );

    // Get transactions
    const [transactions] = await db.execute(
      `SELECT st.*, u.name as customerName, s.name as serviceName
       FROM service_transactions st
       JOIN users u ON st.customerId = u.id
       JOIN services s ON st.serviceId = s.id
       WHERE st.serviceProviderId = ?
       ORDER BY st.createdAt DESC
       LIMIT 10`,
      [id]
    );

    const responseData = {
      ...provider,
      servicesOffered: services,
      transactions: transactions,
      qualifications: provider.qualifications ? JSON.parse(provider.qualifications) : [],
      equipment: provider.equipment ? JSON.parse(provider.equipment) : []
    };

    res.json(responseData);
  } catch (error) {
    console.error('Get service provider error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Update service provider
const updateServiceProvider = async (req, res) => {
  let db;
  try {
    db = await createConnection();
    const { id } = req.params;
    const updates = req.body;

    // Remove fields that shouldn't be updated
    delete updates.id;
    delete updates.email;
    delete updates.rating;

    // Check if provider exists
    const [existingProviders] = await db.execute(
      'SELECT id FROM service_providers WHERE id = ?',
      [id]
    );

    if (existingProviders.length === 0) {
      return res.status(404).json({ error: 'Service provider not found' });
    }

    // Build dynamic update query
    const updateFields = [];
    const params = [];

    const allowedFields = [
      'name', 'contact', 'businessName', 'description', 'location', 'region',
      'qualifications', 'equipment', 'minOrderAmount', 'availability', 'travelRadius'
    ];

    allowedFields.forEach(field => {
      if (updates[field] !== undefined) {
        updateFields.push(`${field} = ?`);
        if (field === 'qualifications' || field === 'equipment') {
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
      `UPDATE service_providers SET ${updateFields.join(', ')}, updatedAt = CURRENT_TIMESTAMP WHERE id = ?`,
      params
    );

    // Get updated provider
    const [providers] = await db.execute(
      `SELECT id, name, contact, email, businessName, description, location, 
              region, qualifications, equipment, minOrderAmount, availability, 
              travelRadius, rating, role, updatedAt 
       FROM service_providers WHERE id = ?`,
      [id]
    );

    res.json(providers[0]);
  } catch (error) {
    console.error('Update service provider error:', error);
    res.status(400).json({ error: error.message });
  }
};

// Delete service provider
const deleteServiceProvider = async (req, res) => {
  let db;
  try {
    db = await createConnection();
    const { id } = req.params;

    // Check if provider exists
    const [existingProviders] = await db.execute(
      'SELECT id FROM service_providers WHERE id = ?',
      [id]
    );

    if (existingProviders.length === 0) {
      return res.status(404).json({ error: 'Service provider not found' });
    }

    // Start transaction
    await db.execute('START TRANSACTION');

    try {
      // Delete service offerings
      await db.execute(
        'DELETE FROM service_offerings WHERE serviceProviderId = ?',
        [id]
      );

      // Delete the provider
      await db.execute(
        'DELETE FROM service_providers WHERE id = ?',
        [id]
      );

      await db.execute('COMMIT');
      res.json({ message: 'Service provider deleted successfully' });
    } catch (error) {
      await db.execute('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Delete service provider error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Add a service offering
const addServiceOffering = async (req, res) => {
  let db;
  try {
    db = await createConnection();
    const { serviceId, rate, minQuantity, unit, notes, serviceProviderId } = req.body;

    // Validate required fields
    if (!serviceId || !serviceProviderId || !rate) {
      return res.status(400).json({ error: 'Service ID, provider ID, and rate are required' });
    }

    // Check if service and provider exist
    const [services] = await db.execute('SELECT id FROM services WHERE id = ?', [serviceId]);
    const [providers] = await db.execute('SELECT id FROM service_providers WHERE id = ?', [serviceProviderId]);

    if (services.length === 0 || providers.length === 0) {
      return res.status(404).json({ error: 'Service or service provider not found' });
    }

    // Check if offering already exists
    const [existingOfferings] = await db.execute(
      'SELECT id FROM service_offerings WHERE serviceId = ? AND serviceProviderId = ?',
      [serviceId, serviceProviderId]
    );

    if (existingOfferings.length > 0) {
      return res.status(400).json({ error: 'Service offering already exists for this provider' });
    }

    const offeringId = generateId('offering');
    
    await db.execute(
      `INSERT INTO service_offerings (id, serviceId, serviceProviderId, rate, minQuantity, unit, notes) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [offeringId, serviceId, serviceProviderId, rate, minQuantity || null, unit || null, notes || null]
    );

    // Get created offering with details
    const [offerings] = await db.execute(
      `SELECT so.*, s.name as serviceName, s.description as serviceDescription,
              sp.name as providerName, sp.businessName
       FROM service_offerings so
       JOIN services s ON so.serviceId = s.id
       JOIN service_providers sp ON so.serviceProviderId = sp.id
       WHERE so.id = ?`,
      [offeringId]
    );

    res.status(201).json(offerings[0]);
  } catch (error) {
    console.error('Add service offering error:', error);
    res.status(400).json({ error: error.message });
  }
};

// Update a service offering
const updateServiceOffering = async (req, res) => {
  let db;
  try {
    db = await createConnection();
    const { offeringId } = req.params;
    const updates = req.body;

    // Remove fields that shouldn't be updated
    delete updates.id;
    delete updates.serviceId;
    delete updates.serviceProviderId;

    // Check if offering exists
    const [existingOfferings] = await db.execute(
      'SELECT id FROM service_offerings WHERE id = ?',
      [offeringId]
    );

    if (existingOfferings.length === 0) {
      return res.status(404).json({ error: 'Service offering not found' });
    }

    // Build dynamic update query
    const updateFields = [];
    const params = [];

    const allowedFields = ['rate', 'minQuantity', 'unit', 'notes', 'isActive'];

    allowedFields.forEach(field => {
      if (updates[field] !== undefined) {
        updateFields.push(`${field} = ?`);
        params.push(updates[field]);
      }
    });

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    params.push(offeringId);

    await db.execute(
      `UPDATE service_offerings SET ${updateFields.join(', ')}, updatedAt = CURRENT_TIMESTAMP WHERE id = ?`,
      params
    );

    // Get updated offering
    const [offerings] = await db.execute(
      `SELECT so.*, s.name as serviceName, s.description as serviceDescription
       FROM service_offerings so
       JOIN services s ON so.serviceId = s.id
       WHERE so.id = ?`,
      [offeringId]
    );

    res.json(offerings[0]);
  } catch (error) {
    console.error('Update service offering error:', error);
    res.status(400).json({ error: error.message });
  }
};

// Get all Service Offerings
const getAllServiceOfferings = async (req, res) => {
  let db;
  try {
    db = await createConnection();
    
    const [offerings] = await db.execute(
      `SELECT so.*, 
              s.name as serviceName, s.description as serviceDescription, s.category as serviceCategory,
              sp.name as providerName, sp.businessName, sp.location, sp.region, sp.rating
       FROM service_offerings so
       JOIN services s ON so.serviceId = s.id
       JOIN service_providers sp ON so.serviceProviderId = sp.id
       WHERE so.isActive = TRUE AND sp.isActive = TRUE
       ORDER BY so.createdAt DESC`
    );

    res.status(200).json(offerings);
  } catch (error) {
    console.error('Get all service offerings error:', error);
    res.status(500).json({ error: 'Failed to fetch service offerings.' });
  }
};

// ========== SERVICE CONTROLLERS =================
const createService = async (req, res) => {
  let db;
  try {
    db = await createConnection();
    const { name, description, basePrice, category } = req.body;

    // Basic validation
    if (!name || !description || !basePrice || !category) {
      return res.status(400).json({ error: 'All fields are required.' });
    }

    const serviceId = generateId('service');
    
    await db.execute(
      'INSERT INTO services (id, name, description, basePrice, category) VALUES (?, ?, ?, ?, ?)',
      [serviceId, name, description, parseFloat(basePrice), category]
    );

    // Get created service
    const [services] = await db.execute(
      'SELECT * FROM services WHERE id = ?',
      [serviceId]
    );

    return res.status(201).json({
      message: 'Service created successfully!',
      service: services[0],
    });

  } catch (error) {
    console.error('Error creating service:', error);
    return res.status(500).json({ error: 'Something went wrong.' });
  }
};

// Update service
const updateService = async (req, res) => {
  let db;
  try {
    db = await createConnection();
    const { id } = req.params;
    const updates = req.body;

    // Remove fields that shouldn't be updated
    delete updates.id;

    // Check if service exists
    const [existingServices] = await db.execute(
      'SELECT id FROM services WHERE id = ?',
      [id]
    );

    if (existingServices.length === 0) {
      return res.status(404).json({ error: 'Service not found' });
    }

    // Build dynamic update query
    const updateFields = [];
    const params = [];

    const allowedFields = ['name', 'description', 'basePrice', 'category', 'isActive'];

    allowedFields.forEach(field => {
      if (updates[field] !== undefined) {
        updateFields.push(`${field} = ?`);
        params.push(updates[field]);
      }
    });

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    params.push(id);

    await db.execute(
      `UPDATE services SET ${updateFields.join(', ')}, updatedAt = CURRENT_TIMESTAMP WHERE id = ?`,
      params
    );

    // Get updated service
    const [services] = await db.execute(
      'SELECT * FROM services WHERE id = ?',
      [id]
    );

    return res.status(200).json({
      message: 'Service updated successfully!',
      service: services[0],
    });

  } catch (error) {
    console.error('Error updating service:', error);
    return res.status(500).json({ error: 'Something went wrong.' });
  }
};

// Delete service   
const deleteService = async (req, res) => {
  let db;
  try {
    db = await createConnection();
    const { id } = req.params;

    // Check if service exists
    const [existingServices] = await db.execute(
      'SELECT id FROM services WHERE id = ?',
      [id]
    );

    if (existingServices.length === 0) {
      return res.status(404).json({ error: 'Service not found' });
    }

    await db.execute('DELETE FROM services WHERE id = ?', [id]);

    return res.status(200).json({
      message: 'Service deleted successfully!',
    });

  } catch (error) {
    console.error('Error deleting service:', error);
    return res.status(500).json({ error: 'Something went wrong.' });
  }
};

// Get all services
const getAllServices = async (req, res) => {
  let db;
  try {
    db = await createConnection();
    
    const [services] = await db.execute(
      'SELECT * FROM services WHERE isActive = TRUE ORDER BY name ASC'
    );

    return res.status(200).json(services);

  } catch (error) {
    console.error('Error fetching services:', error);
    return res.status(500).json({ error: 'Something went wrong.' });
  }
};

// Get a single service
const getService = async (req, res) => {
  let db;
  try {
    db = await createConnection();
    const { id } = req.params;

    const [services] = await db.execute(
      'SELECT * FROM services WHERE id = ?',
      [id]
    );

    if (services.length === 0) {
      return res.status(404).json({ error: 'Service not found.' });
    }

    return res.status(200).json(services[0]);

  } catch (error) {
    console.error('Error fetching service:', error);
    return res.status(500).json({ error: 'Something went wrong.' });
  }
};

// Get all service categories
const getAllServiceCategories = async (req, res) => {
  let db;
  try {
    db = await createConnection();
    
    const [categories] = await db.execute(
      'SELECT DISTINCT category FROM services WHERE isActive = TRUE ORDER BY category ASC'
    );

    const categoryNames = categories.map(cat => cat.category);
    res.status(200).json(categoryNames);
  } catch (error) {
    console.error('Get all service categories error:', error);
    res.status(500).json({ error: 'Failed to fetch service categories.' });
  }
};

// Get all services by service category
const getServicesByCategory = async (req, res) => {
  let db;
  try {
    db = await createConnection();
    const { category } = req.params;

    const [services] = await db.execute(
      'SELECT * FROM services WHERE category = ? AND isActive = TRUE ORDER BY name ASC',
      [category]
    );

    res.status(200).json(services);
  } catch (error) {
    console.error('Get services by category error:', error);
    res.status(500).json({ error: 'Failed to fetch services for this category.' });
  }
};

// Get all service providers by service
const getProvidersByService = async (req, res) => {
  let db;
  try {
    db = await createConnection();
    const { serviceId } = req.params;

    const [providers] = await db.execute(
      `SELECT sp.*, so.rate, so.minQuantity, so.unit, so.notes
       FROM service_providers sp
       JOIN service_offerings so ON sp.id = so.serviceProviderId
       WHERE so.serviceId = ? AND so.isActive = TRUE AND sp.isActive = TRUE
       ORDER BY sp.rating DESC, so.rate ASC`,
      [serviceId]
    );

    // Parse JSON fields
    const providersWithParsedData = providers.map(provider => ({
      ...provider,
      qualifications: provider.qualifications ? JSON.parse(provider.qualifications) : [],
      equipment: provider.equipment ? JSON.parse(provider.equipment) : []
    }));

    res.status(200).json(providersWithParsedData);
  } catch (error) {
    console.error('Get providers by service error:', error);
    res.status(500).json({ error: 'Failed to fetch providers for this service.' });
  }
};

// Get all services by location
const getServicesByLocation = async (req, res) => {
  let db;
  try {
    db = await createConnection();
    const { location } = req.params;

    const [services] = await db.execute(
      `SELECT s.* 
       FROM services s
       JOIN service_offerings so ON s.id = so.serviceId
       JOIN service_providers sp ON so.serviceProviderId = sp.id
       WHERE sp.location = ? AND s.isActive = TRUE AND so.isActive = TRUE
       GROUP BY s.id
       ORDER BY s.name ASC`,
      [location]
    );

    return res.status(200).json(services);

  } catch (error) {
    console.error('Error fetching services by location:', error);
    return res.status(500).json({ error: 'Something went wrong.' });
  }
};

// Get all services by region
const getServicesByRegion = async (req, res) => {
  let db;
  try {
    db = await createConnection();
    const { region } = req.params;

    const [services] = await db.execute(
      `SELECT s.* 
       FROM services s
       JOIN service_offerings so ON s.id = so.serviceId
       JOIN service_providers sp ON so.serviceProviderId = sp.id
       WHERE sp.region = ? AND s.isActive = TRUE AND so.isActive = TRUE
       GROUP BY s.id
       ORDER BY s.name ASC`,
      [region]
    );

    return res.status(200).json(services);

  } catch (error) {
    console.error('Error fetching services by region:', error);
    return res.status(500).json({ error: 'Something went wrong.' });
  }
};

// Get all services by price range
const getServicesByPriceRange = async (req, res) => {
  let db;
  try {
    db = await createConnection();
    const { minPrice, maxPrice } = req.params;

    const [services] = await db.execute(
      'SELECT * FROM services WHERE basePrice BETWEEN ? AND ? AND isActive = TRUE ORDER BY basePrice ASC',
      [parseFloat(minPrice), parseFloat(maxPrice)]
    );

    return res.status(200).json(services);

  } catch (error) {
    console.error('Error fetching services by price range:', error);
    return res.status(500).json({ error: 'Something went wrong.' });
  }
};

// Get all services by name
const getServicesByName = async (req, res) => {
  let db;
  try {
    db = await createConnection();
    const { name } = req.params;

    const [services] = await db.execute(
      'SELECT * FROM services WHERE name LIKE ? AND isActive = TRUE ORDER BY name ASC',
      [`%${name}%`]
    );

    return res.status(200).json(services);

  } catch (error) {
    console.error('Error fetching services by name:', error);
    return res.status(500).json({ error: 'Something went wrong.' });
  }
};

export default {
  createServiceProvider,
  getAllServiceProviders,
  getServiceProvider,
  updateServiceProvider,
  deleteServiceProvider,
  addServiceOffering,
  updateServiceOffering,
  getAllServiceOfferings,
  createService,
  updateService,
  deleteService,
  getAllServices,
  getService,
  getAllServiceCategories,
  getServicesByCategory,
  getProvidersByService,
  getServicesByLocation,
  getServicesByRegion,
  getServicesByPriceRange,
  getServicesByName
};