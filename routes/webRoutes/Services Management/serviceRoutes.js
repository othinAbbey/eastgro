import express from 'express';
const router = express.Router();

// Import all service controller functions
import serviceController from '../../../controllers/Services Management/serviceController.js';

// Auth middleware
import authMiddleware from '../../../middleware/authMiddleware.js';

// =================== PUBLIC ROUTES =================== //
router.get('/', serviceController.getAllServices); // Get all services
router.get('/:id', serviceController.getService); // Get a single service by ID
router.get('/category/all', serviceController.getAllServiceCategories);
router.get('/category/:category', serviceController.getServicesByCategory); // Get services by category
// router.get('/provider/:serviceID', serviceController.getProvidersByService);
router.get('/providers/service/:serviceId', serviceController.getProvidersByService);

router.get('/location/:location', serviceController.getServicesByLocation);
router.get('/region/:region', serviceController.getServicesByRegion);
router.get('/price-range/:minPrice/:maxPrice', serviceController.getServicesByPriceRange);
router.get('/search/name/:name', serviceController.getServicesByName);

// =================== PROTECTED ROUTES =================== //
router.use(authMiddleware.protect);

// Admins & experts can create/update/delete
// router.post('/', authMiddleware.restrictTo('admin', 'expert'), serviceController.createService);
// router.put('/:id', authMiddleware.restrictTo('admin', 'expert'), serviceController.updateService);
// router.delete('/:id', authMiddleware.restrictTo('admin'), serviceController.deleteService);
router.post('/create', serviceController.createService);
router.put('/:id',  serviceController.updateService);
router.delete('/:id',  serviceController.deleteService);




// --- Public Service Routes ---
router.get('/providers/all', serviceController.getAllServiceProviders);
router.get('/provider/:id', serviceController.getServiceProvider);

// --- Protected Service Routes ---
router.use(authMiddleware.protect);

// Manage Service Providers
router.post('/provider', serviceController.createServiceProvider);
router.put('/provider/:id', serviceController.updateServiceProvider);
router.delete('/provider/:id', serviceController.deleteServiceProvider);

// Manage Service Offerings
router.post('/addofferings', serviceController.addServiceOffering);
router.put('/offerings/:offeringId', serviceController.updateServiceOffering);
router.get('/allofferings/all', serviceController.getAllServiceOfferings);
// Search Services
router.get('/locations', serviceController.getServicesByLocation);
router.get('/regions', serviceController.getServicesByRegion);
router.get('/price-ranges', serviceController.getServicesByPriceRange);
router.get('/search/names', serviceController.getServicesByName);

export default router;
