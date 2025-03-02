import express from 'express';
import facilityController from '../controllers/facilityController.js';
const router = express.Router();


// 1. Create Facility
router.post('/', facilityController.createFacility);

// 2. Get All Facilities
router.get('/', facilityController.getAllFacilities);

// 3. Get Facility by ID
router.get('/facilities/:id', facilityController.getFacilityById);

// 4. Update Facility
router.put('/facilities/:id', facilityController.updateFacility);

// 5. Delete Facility
router.delete('/facilities/:id', facilityController.deleteFacility);

// 6. Get Produce Handled by Facility
router.get('/facilities/:id/produce', facilityController.getProduceHandledByFacility);

// 7. Get Shipments at a Facility
router.get('/facilities/:id/shipments', facilityController.getShipmentsAtFacility);

// 8. Add Produce to Facility
router.post('/facilities/produce', facilityController.addProduceToFacility);

// 9. Get Facility Workload by ID
router.get("/:id/workload", facilityController.getFacilityWorkloadById);

// 10 Route to get all facilities' name and workload in a given location
router.get("/location/:location/workloads", facilityController.getFacilitiesWorkloadByLocation);

export default router;