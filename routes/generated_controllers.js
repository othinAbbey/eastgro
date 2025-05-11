
// // CRUD operations for Farmer
// export const getAllFarmers = async (req, res) => {
//     try {
//         const allFarmers = await prisma.farmer.findMany();
//         res.json(allFarmers);
//     } catch (err) {
//         res.status(500).json({ error: err.message });
//     }
// };

// export const getFarmerById = async (req, res) => {
//     try {
//         const { id } = req.params;
//         const farmer = await prisma.farmer.findUnique({ where: { id: parseInt(id) } });
//         res.json(farmer);
//     } catch (err) {
//         res.status(500).json({ error: err.message });
//     }
// };

// export const createFarmer = async (req, res) => {
//     try {
//         const data = req.body;
//         const newFarmer = await prisma.farmer.create({ data });
//         res.status(201).json(newFarmer);
//     } catch (err) {
//         res.status(500).json({ error: err.message });
//     }
// };

// export const updateFarmer = async (req, res) => {
//     try {
//         const { id } = req.params;
//         const data = req.body;
//         const updatedFarmer = await prisma.farmer.update({
//             where: { id: parseInt(id) },
//             data
//         });
//         res.json(updatedFarmer);
//     } catch (err) {
//         res.status(500).json({ error: err.message });
//     }
// };

// export const deleteFarmer = async (req, res) => {
//     try {
//         const { id } = req.params;
//         await prisma.farmer.delete({ where: { id: parseInt(id) } });
//         res.json({ message: "Farmer deleted successfully" });
//     } catch (err) {
//         res.status(500).json({ error: err.message });
//     }
// };

// // CRUD operations for Produce
// export const getAllProduces = async (req, res) => {
//     try {
//         const allProduces = await prisma.produce.findMany();
//         res.json(allProduces);
//     } catch (err) {
//         res.status(500).json({ error: err.message });
//     }
// };

// export const getProduceById = async (req, res) => {
//     try {
//         const { id } = req.params;
//         const produce = await prisma.produce.findUnique({ where: { id: parseInt(id) } });
//         res.json(produce);
//     } catch (err) {
//         res.status(500).json({ error: err.message });
//     }
// };

// export const createProduce = async (req, res) => {
//     try {
//         const data = req.body;
//         const newProduce = await prisma.produce.create({ data });
//         res.status(201).json(newProduce);
//     } catch (err) {
//         res.status(500).json({ error: err.message });
//     }
// };

// export const updateProduce = async (req, res) => {
//     try {
//         const { id } = req.params;
//         const data = req.body;
//         const updatedProduce = await prisma.produce.update({
//             where: { id: parseInt(id) },
//             data
//         });
//         res.json(updatedProduce);
//     } catch (err) {
//         res.status(500).json({ error: err.message });
//     }
// };

// export const deleteProduce = async (req, res) => {
//     try {
//         const { id } = req.params;
//         await prisma.produce.delete({ where: { id: parseInt(id) } });
//         res.json({ message: "Produce deleted successfully" });
//     } catch (err) {
//         res.status(500).json({ error: err.message });
//     }
// };

// // CRUD operations for Transporter
// export const getAllTransporters = async (req, res) => {
//     try {
//         const allTransporters = await prisma.transporter.findMany();
//         res.json(allTransporters);
//     } catch (err) {
//         res.status(500).json({ error: err.message });
//     }
// };

// export const getTransporterById = async (req, res) => {
//     try {
//         const { id } = req.params;
//         const transporter = await prisma.transporter.findUnique({ where: { id: parseInt(id) } });
//         res.json(transporter);
//     } catch (err) {
//         res.status(500).json({ error: err.message });
//     }
// };

// export const createTransporter = async (req, res) => {
//     try {
//         const data = req.body;
//         const newTransporter = await prisma.transporter.create({ data });
//         res.status(201).json(newTransporter);
//     } catch (err) {
//         res.status(500).json({ error: err.message });
//     }
// };

// export const updateTransporter = async (req, res) => {
//     try {
//         const { id } = req.params;
//         const data = req.body;
//         const updatedTransporter = await prisma.transporter.update({
//             where: { id: parseInt(id) },
//             data
//         });
//         res.json(updatedTransporter);
//     } catch (err) {
//         res.status(500).json({ error: err.message });
//     }
// };

// export const deleteTransporter = async (req, res) => {
//     try {
//         const { id } = req.params;
//         await prisma.transporter.delete({ where: { id: parseInt(id) } });
//         res.json({ message: "Transporter deleted successfully" });
//     } catch (err) {
//         res.status(500).json({ error: err.message });
//     }
// };

// // CRUD operations for Facility
// export const getAllFacilitys = async (req, res) => {
//     try {
//         const allFacilitys = await prisma.facility.findMany();
//         res.json(allFacilitys);
//     } catch (err) {
//         res.status(500).json({ error: err.message });
//     }
// };

// export const getFacilityById = async (req, res) => {
//     try {
//         const { id } = req.params;
//         const facility = await prisma.facility.findUnique({ where: { id: parseInt(id) } });
//         res.json(facility);
//     } catch (err) {
//         res.status(500).json({ error: err.message });
//     }
// };

// export const createFacility = async (req, res) => {
//     try {
//         const data = req.body;
//         const newFacility = await prisma.facility.create({ data });
//         res.status(201).json(newFacility);
//     } catch (err) {
//         res.status(500).json({ error: err.message });
//     }
// };

// export const updateFacility = async (req, res) => {
//     try {
//         const { id } = req.params;
//         const data = req.body;
//         const updatedFacility = await prisma.facility.update({
//             where: { id: parseInt(id) },
//             data
//         });
//         res.json(updatedFacility);
//     } catch (err) {
//         res.status(500).json({ error: err.message });
//     }
// };

// export const deleteFacility = async (req, res) => {
//     try {
//         const { id } = req.params;
//         await prisma.facility.delete({ where: { id: parseInt(id) } });
//         res.json({ message: "Facility deleted successfully" });
//     } catch (err) {
//         res.status(500).json({ error: err.message });
//     }
// };

// // CRUD operations for Shipment
// export const getAllShipments = async (req, res) => {
//     try {
//         const allShipments = await prisma.shipment.findMany();
//         res.json(allShipments);
//     } catch (err) {
//         res.status(500).json({ error: err.message });
//     }
// };

// export const getShipmentById = async (req, res) => {
//     try {
//         const { id } = req.params;
//         const shipment = await prisma.shipment.findUnique({ where: { id: parseInt(id) } });
//         res.json(shipment);
//     } catch (err) {
//         res.status(500).json({ error: err.message });
//     }
// };

// export const createShipment = async (req, res) => {
//     try {
//         const data = req.body;
//         const newShipment = await prisma.shipment.create({ data });
//         res.status(201).json(newShipment);
//     } catch (err) {
//         res.status(500).json({ error: err.message });
//     }
// };

// export const updateShipment = async (req, res) => {
//     try {
//         const { id } = req.params;
//         const data = req.body;
//         const updatedShipment = await prisma.shipment.update({
//             where: { id: parseInt(id) },
//             data
//         });
//         res.json(updatedShipment);
//     } catch (err) {
//         res.status(500).json({ error: err.message });
//     }
// };

// export const deleteShipment = async (req, res) => {
//     try {
//         const { id } = req.params;
//         await prisma.shipment.delete({ where: { id: parseInt(id) } });
//         res.json({ message: "Shipment deleted successfully" });
//     } catch (err) {
//         res.status(500).json({ error: err.message });
//     }
// };

// // CRUD operations for Customer
// export const getAllCustomers = async (req, res) => {
//     try {
//         const allCustomers = await prisma.customer.findMany();
//         res.json(allCustomers);
//     } catch (err) {
//         res.status(500).json({ error: err.message });
//     }
// };

// export const getCustomerById = async (req, res) => {
//     try {
//         const { id } = req.params;
//         const customer = await prisma.customer.findUnique({ where: { id: parseInt(id) } });
//         res.json(customer);
//     } catch (err) {
//         res.status(500).json({ error: err.message });
//     }
// };

// export const createCustomer = async (req, res) => {
//     try {
//         const data = req.body;
//         const newCustomer = await prisma.customer.create({ data });
//         res.status(201).json(newCustomer);
//     } catch (err) {
//         res.status(500).json({ error: err.message });
//     }
// };

// export const updateCustomer = async (req, res) => {
//     try {
//         const { id } = req.params;
//         const data = req.body;
//         const updatedCustomer = await prisma.customer.update({
//             where: { id: parseInt(id) },
//             data
//         });
//         res.json(updatedCustomer);
//     } catch (err) {
//         res.status(500).json({ error: err.message });
//     }
// };

// export const deleteCustomer = async (req, res) => {
//     try {
//         const { id } = req.params;
//         await prisma.customer.delete({ where: { id: parseInt(id) } });
//         res.json({ message: "Customer deleted successfully" });
//     } catch (err) {
//         res.status(500).json({ error: err.message });
//     }
// };

// // CRUD operations for VeterinaryAssistanceRequest
// export const getAllVeterinaryAssistanceRequests = async (req, res) => {
//     try {
//         const allVeterinaryAssistanceRequests = await prisma.veterinaryassistancerequest.findMany();
//         res.json(allVeterinaryAssistanceRequests);
//     } catch (err) {
//         res.status(500).json({ error: err.message });
//     }
// };

// export const getVeterinaryAssistanceRequestById = async (req, res) => {
//     try {
//         const { id } = req.params;
//         const veterinaryassistancerequest = await prisma.veterinaryassistancerequest.findUnique({ where: { id: parseInt(id) } });
//         res.json(veterinaryassistancerequest);
//     } catch (err) {
//         res.status(500).json({ error: err.message });
//     }
// };

// export const createVeterinaryAssistanceRequest = async (req, res) => {
//     try {
//         const data = req.body;
//         const newVeterinaryAssistanceRequest = await prisma.veterinaryassistancerequest.create({ data });
//         res.status(201).json(newVeterinaryAssistanceRequest);
//     } catch (err) {
//         res.status(500).json({ error: err.message });
//     }
// };

// export const updateVeterinaryAssistanceRequest = async (req, res) => {
//     try {
//         const { id } = req.params;
//         const data = req.body;
//         const updatedVeterinaryAssistanceRequest = await prisma.veterinaryassistancerequest.update({
//             where: { id: parseInt(id) },
//             data
//         });
//         res.json(updatedVeterinaryAssistanceRequest);
//     } catch (err) {
//         res.status(500).json({ error: err.message });
//     }
// };

// export const deleteVeterinaryAssistanceRequest = async (req, res) => {
//     try {
//         const { id } = req.params;
//         await prisma.veterinaryassistancerequest.delete({ where: { id: parseInt(id) } });
//         res.json({ message: "VeterinaryAssistanceRequest deleted successfully" });
//     } catch (err) {
//         res.status(500).json({ error: err.message });
//     }
// };

// // CRUD operations for StockRequest
// export const getAllStockRequests = async (req, res) => {
//     try {
//         const allStockRequests = await prisma.stockrequest.findMany();
//         res.json(allStockRequests);
//     } catch (err) {
//         res.status(500).json({ error: err.message });
//     }
// };

// export const getStockRequestById = async (req, res) => {
//     try {
//         const { id } = req.params;
//         const stockrequest = await prisma.stockrequest.findUnique({ where: { id: parseInt(id) } });
//         res.json(stockrequest);
//     } catch (err) {
//         res.status(500).json({ error: err.message });
//     }
// };

// export const createStockRequest = async (req, res) => {
//     try {
//         const data = req.body;
//         const newStockRequest = await prisma.stockrequest.create({ data });
//         res.status(201).json(newStockRequest);
//     } catch (err) {
//         res.status(500).json({ error: err.message });
//     }
// };

// export const updateStockRequest = async (req, res) => {
//     try {
//         const { id } = req.params;
//         const data = req.body;
//         const updatedStockRequest = await prisma.stockrequest.update({
//             where: { id: parseInt(id) },
//             data
//         });
//         res.json(updatedStockRequest);
//     } catch (err) {
//         res.status(500).json({ error: err.message });
//     }
// };

// export const deleteStockRequest = async (req, res) => {
//     try {
//         const { id } = req.params;
//         await prisma.stockrequest.delete({ where: { id: parseInt(id) } });
//         res.json({ message: "StockRequest deleted successfully" });
//     } catch (err) {
//         res.status(500).json({ error: err.message });
//     }
// };

// // CRUD operations for GroupingRequest
// export const getAllGroupingRequests = async (req, res) => {
//     try {
//         const allGroupingRequests = await prisma.groupingrequest.findMany();
//         res.json(allGroupingRequests);
//     } catch (err) {
//         res.status(500).json({ error: err.message });
//     }
// };

// export const getGroupingRequestById = async (req, res) => {
//     try {
//         const { id } = req.params;
//         const groupingrequest = await prisma.groupingrequest.findUnique({ where: { id: parseInt(id) } });
//         res.json(groupingrequest);
//     } catch (err) {
//         res.status(500).json({ error: err.message });
//     }
// };

// export const createGroupingRequest = async (req, res) => {
//     try {
//         const data = req.body;
//         const newGroupingRequest = await prisma.groupingrequest.create({ data });
//         res.status(201).json(newGroupingRequest);
//     } catch (err) {
//         res.status(500).json({ error: err.message });
//     }
// };

// export const updateGroupingRequest = async (req, res) => {
//     try {
//         const { id } = req.params;
//         const data = req.body;
//         const updatedGroupingRequest = await prisma.groupingrequest.update({
//             where: { id: parseInt(id) },
//             data
//         });
//         res.json(updatedGroupingRequest);
//     } catch (err) {
//         res.status(500).json({ error: err.message });
//     }
// };

// export const deleteGroupingRequest = async (req, res) => {
//     try {
//         const { id } = req.params;
//         await prisma.groupingrequest.delete({ where: { id: parseInt(id) } });
//         res.json({ message: "GroupingRequest deleted successfully" });
//     } catch (err) {
//         res.status(500).json({ error: err.message });
//     }
// };

// // CRUD operations for ClimateZone
// export const getAllClimateZones = async (req, res) => {
//     try {
//         const allClimateZones = await prisma.climatezone.findMany();
//         res.json(allClimateZones);
//     } catch (err) {
//         res.status(500).json({ error: err.message });
//     }
// };

// export const getClimateZoneById = async (req, res) => {
//     try {
//         const { id } = req.params;
//         const climatezone = await prisma.climatezone.findUnique({ where: { id: parseInt(id) } });
//         res.json(climatezone);
//     } catch (err) {
//         res.status(500).json({ error: err.message });
//     }
// };

// export const createClimateZone = async (req, res) => {
//     try {
//         const data = req.body;
//         const newClimateZone = await prisma.climatezone.create({ data });
//         res.status(201).json(newClimateZone);
//     } catch (err) {
//         res.status(500).json({ error: err.message });
//     }
// };

// export const updateClimateZone = async (req, res) => {
//     try {
//         const { id } = req.params;
//         const data = req.body;
//         const updatedClimateZone = await prisma.climatezone.update({
//             where: { id: parseInt(id) },
//             data
//         });
//         res.json(updatedClimateZone);
//     } catch (err) {
//         res.status(500).json({ error: err.message });
//     }
// };

// export const deleteClimateZone = async (req, res) => {
//     try {
//         const { id } = req.params;
//         await prisma.climatezone.delete({ where: { id: parseInt(id) } });
//         res.json({ message: "ClimateZone deleted successfully" });
//     } catch (err) {
//         res.status(500).json({ error: err.message });
//     }
// };

// // CRUD operations for WeatherForecast
// export const getAllWeatherForecasts = async (req, res) => {
//     try {
//         const allWeatherForecasts = await prisma.weatherforecast.findMany();
//         res.json(allWeatherForecasts);
//     } catch (err) {
//         res.status(500).json({ error: err.message });
//     }
// };

// export const getWeatherForecastById = async (req, res) => {
//     try {
//         const { id } = req.params;
//         const weatherforecast = await prisma.weatherforecast.findUnique({ where: { id: parseInt(id) } });
//         res.json(weatherforecast);
//     } catch (err) {
//         res.status(500).json({ error: err.message });
//     }
// };

// export const createWeatherForecast = async (req, res) => {
//     try {
//         const data = req.body;
//         const newWeatherForecast = await prisma.weatherforecast.create({ data });
//         res.status(201).json(newWeatherForecast);
//     } catch (err) {
//         res.status(500).json({ error: err.message });
//     }
// };

// export const updateWeatherForecast = async (req, res) => {
//     try {
//         const { id } = req.params;
//         const data = req.body;
//         const updatedWeatherForecast = await prisma.weatherforecast.update({
//             where: { id: parseInt(id) },
//             data
//         });
//         res.json(updatedWeatherForecast);
//     } catch (err) {
//         res.status(500).json({ error: err.message });
//     }
// };

// export const deleteWeatherForecast = async (req, res) => {
//     try {
//         const { id } = req.params;
//         await prisma.weatherforecast.delete({ where: { id: parseInt(id) } });
//         res.json({ message: "WeatherForecast deleted successfully" });
//     } catch (err) {
//         res.status(500).json({ error: err.message });
//     }
// };
