import { PrismaClient }from '@prisma/client';
const prisma = new PrismaClient();
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// ========SERVICE PROVIDER CONTROLLERS======== //
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
  
//       // Hash the password
//       const hashedPassword = await bcrypt.hash(password, 10);
  
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
// };
const createServiceProvider = async (req, res) => {
    try {
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
  
      // Hash the password with bcrypt
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);
  
      // Create service provider
      const serviceProvider = await prisma.serviceProvider.create({
        data: {
          name,
          contact,
          email,
          password: hashedPassword,
          businessName,
          description: description || null,
          location: location || 'Not specified',
          region: region || 'Eastern',
          qualifications: qualifications || [],
          equipment: equipment || [],
          minOrderAmount: minOrderAmount || null,
          availability: availability || 'Monday-Friday, 8AM-5PM',
          travelRadius: travelRadius || null,
          role: 'EXPERT'
        }
      });
  
      // Remove password from response
      const { password: _, ...responseData } = serviceProvider;
      
      res.status(201).json(responseData);
  
    } catch (error) {
      console.error('Error creating service provider:', error);
      
      // Handle unique constraint errors
      if (error.code === 'P2002') {
        const field = error.meta?.target?.[0];
        return res.status(400).json({
          error: `${field} already exists`,
          field
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
  try {
    const { region, service, minRating } = req.query;
    
    const where = {};
    
    if (region) where.region = region;
    if (minRating) where.rating = { gte: parseFloat(minRating) };
    
    if (service) {
      where.servicesOffered = {
        some: {
          service: {
            name: { contains: service, mode: 'insensitive' }
          }
        }
      };
    }

    const serviceProviders = await prisma.serviceProvider.findMany({
      where,
      include: {
        servicesOffered: {
          include: {
            service: true
          }
        }
      }
    });

    res.json(serviceProviders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get single service provider
const getServiceProvider = async (req, res) => {
  try {
    const { id } = req.params;
    
    const serviceProvider = await prisma.serviceProvider.findUnique({
      where: { id },
      include: {
        servicesOffered: {
          include: {
            service: true
          }
        },
        transactions: true
      }
    });

    if (!serviceProvider) {
      return res.status(404).json({ error: 'Service provider not found' });
    }

    res.json(serviceProvider);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update service provider
const updateServiceProvider = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Remove fields that shouldn't be updated
    delete updates.id;
    delete updates.email; // Email shouldn't be changed typically
    delete updates.rating; // Rating should be calculated, not manually set

    const updatedProvider = await prisma.serviceProvider.update({
      where: { id },
      data: updates
    });

    res.json(updatedProvider);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete service provider
const deleteServiceProvider = async (req, res) => {
  try {
    const { id } = req.params;

    // First delete service offerings
    await prisma.serviceOffering.deleteMany({
      where: { serviceProviderId: id }
    });

    // Then delete the provider
    await prisma.serviceProvider.delete({
      where: { id }
    });

    res.json({ message: 'Service provider deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Add a service offering
const addServiceOffering = async (req, res) => {
  try {
    // const { serviceProviderId } = req.params;
    const { serviceId, rate, minQuantity, unit, notes,serviceProviderId } = req.body;

    const offering = await prisma.serviceOfferings.create({
      data: {
        serviceId,
        serviceProviderId,
        rate,
        minQuantity,
        unit,
        notes,
        isActive: true
      },
      include: {
        service: true,
        serviceProvider: true
      }
    });

    res.status(201).json(offering);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Update a service offering
const updateServiceOffering = async (req, res) => {
  try {
    const { offeringId } = req.params;
    const updates = req.body;

    // Remove fields that shouldn't be updated
    delete updates.id;
    delete updates.serviceId;
    delete updates.serviceProviderId;

    const updatedOffering = await prisma.serviceOffering.update({
      where: { id: offeringId },
      data: updates,
      include: {
        service: true
      }
    });

    res.json(updatedOffering);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get all Service Offerings
const getAllServiceOfferings = async (req, res) => {
    try {
      const offerings = await prisma.serviceOfferings.findMany({
        include: {
          service: {
            include: {
              // Include any nested relations inside service if you have them
            }
          },
          serviceProvider: {
            include: {
              // Include any nested relations inside provider if needed
            }
          }
        }
      });
  
      res.status(200).json(offerings);
    } catch (error) {
      console.error('[GetAllServiceOfferings Error]', error);
      res.status(500).json({ error: 'Failed to fetch service offerings.' });
    }
  };
 


///==========SERVICE CONTROLLERS=================///
const createService = async (req, res) => {
    try {
      const { name, description, basePrice, category } = req.body;
  
      // Basic validation
      if (!name || !description || !basePrice || !category) {
        return res.status(400).json({ error: 'All fields are required.' });
      }
  
      // Create service
      const newService = await prisma.service.create({
        data: {
          name,
          description,
          basePrice: parseFloat(basePrice),
          category,
          isActive: true, // default true
        },
      });
  
      return res.status(201).json({
        message: 'Service created successfully!',
        service: newService,
      });
  
    } catch (error) {
      console.error('Error creating service:', error.message);
      return res.status(500).json({ error: 'Something went wrong.' });
    }
  };

// Update service
const updateService = async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
  
      // Remove fields that shouldn't be updated
      delete updates.id;
  
      const updatedService = await prisma.service.update({
        where: { id },
        data: updates,
      });
  
      return res.status(200).json({
        message: 'Service updated successfully!',
        service: updatedService,
      });
  
    } catch (error) {
      console.error('Error updating service:', error.message);
      return res.status(500).json({ error: 'Something went wrong.' });
    }
  };
// Delete service   
const deleteService = async (req, res) => {
    try {
      const { id } = req.params;
  
      await prisma.service.delete({
        where: { id },
      });
  
      return res.status(200).json({
        message: 'Service deleted successfully!',
      });
  
    } catch (error) {
      console.error('Error deleting service:', error.message);
      return res.status(500).json({ error: 'Something went wrong.' });
    }
  };
// Get all services
const getAllServices = async (req, res) => {
    try {
      const services = await prisma.service.findMany({
        where: { isActive: true },
      });
  
      return res.status(200).json(services);
  
    } catch (error) {
      console.error('Error fetching services:', error.message);
      return res.status(500).json({ error: 'Something went wrong.' });
    }
  };
// Get a single service
const getService = async (req, res) => {
    try {
      const { id } = req.params;
  
      const service = await prisma.service.findUnique({
        where: { id },
      });
  
      if (!service) {
        return res.status(404).json({ error: 'Service not found.' });
      }
  
      return res.status(200).json(service);
  
    } catch (error) {
      console.error('Error fetching service:', error.message);
      return res.status(500).json({ error: 'Something went wrong.' });
    }
  };
// Get all services by category

const getAllServiceCategories = async (req, res) => {
    try {
      const categories = await prisma.service.findMany({
        where: {
          isActive: true, // Only active services if needed
        },
        select: {
          category: true,
        },
        distinct: ['category'], // Get unique categories only
      });
  
      res.status(200).json(categories.map(cat => cat.category));
    } catch (error) {
      console.error('[getAllServiceCategories Error]', error);
      res.status(500).json({ error: 'Failed to fetch service categories.' });
    }
  };
// Get all services by service category
const getServicesByCategory = async (req, res) => {
    const { category } = req.params;
  
    try {
      const services = await prisma.service.findMany({
        where: {
          category: category,
          isActive: true, // Optional filter for active services
        },
      });
  
      res.status(200).json(services);
    } catch (error) {
      console.error('[getServicesByCategory Error]', error);
      res.status(500).json({ error: 'Failed to fetch services for this category.' });
    }
  };
  
// Get all services by service provider
const getProvidersByService = async (req, res) => {
    const { serviceId } = req.params;
  
    try {
        const providers = await prisma.serviceProvider.findMany({
            where: {
              servicesOffered: {
                some: {
                  serviceId: serviceId,
                },
              },
            },
            include: {
              servicesOffered: {
                include: {
                  service: true,
                },
              },
            },
          });
          
  
      res.status(200).json(providers);
    } catch (error) {
      console.error('[getProvidersByService Error]', error);
      res.status(500).json({ error: 'Failed to fetch providers for this service.' });
    }
  };
  
// Get all services by location
const getServicesByLocation = async (req, res) => {
    try {
      const { location } = req.params;
  
      const services = await prisma.service.findMany({
        where: { location, isActive: true },
      });
  
      return res.status(200).json(services);
  
    } catch (error) {
      console.error('Error fetching services by location:', error.message);
      return res.status(500).json({ error: 'Something went wrong.' });
    }
  };
// Get all services by region
const getServicesByRegion = async (req, res) => {
    try {
      const { region } = req.params;
  
      const services = await prisma.service.findMany({
        where: { region, isActive: true },
      });
  
      return res.status(200).json(services);
  
    } catch (error) {
      console.error('Error fetching services by region:', error.message);
      return res.status(500).json({ error: 'Something went wrong.' });
    }
  };

// Get all services by price range
const getServicesByPriceRange = async (req, res) => {
    try {
      const { minPrice, maxPrice } = req.params;
  
      const services = await prisma.service.findMany({
        where: { basePrice: { gte: minPrice, lte: maxPrice }, isActive: true },
      });
  
      return res.status(200).json(services);
  
    } catch (error) {
      console.error('Error fetching services by price range:', error.message);
      return res.status(500).json({ error: 'Something went wrong.' });
    }
  };
// Get all services by name
const getServicesByName = async (req, res) => {
    try {
      const { name } = req.params;
  
      const services = await prisma.service.findMany({
        where: { name: { contains: name }, isActive: true },
      });
  
      return res.status(200).json(services);
  
    } catch (error) {
      console.error('Error fetching services by name:', error.message);
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