
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


import pool from '../config/database.js';

// =============================================
// FARMER CRUD OPERATIONS
// =============================================

export const getAllFarmers = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM farmers ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (err) {
        console.error('Get all farmers error:', err);
        res.status(500).json({ error: err.message });
    }
};

export const getFarmerById = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('SELECT * FROM farmers WHERE id = $1', [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Farmer not found' });
        }
        
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Get farmer by ID error:', err);
        res.status(500).json({ error: err.message });
    }
};

export const createFarmer = async (req, res) => {
    try {
        const { name, contact, password, farm_details, location, region, district, group_id } = req.body;
        
        const result = await pool.query(
            `INSERT INTO farmers (name, contact, password, farm_details, location, region, district, group_id) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
             RETURNING *`,
            [name, contact, password, farm_details, location, region, district, group_id]
        );
        
    res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Create farmer error:', err);
        res.status(500).json({ error: err.message });
    }
};

export const updateFarmer = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, contact, farm_details, location, region, district, group_id } = req.body;
        
        const result = await pool.query(
            `UPDATE farmers 
             SET name = $1, contact = $2, farm_details = $3, location = $4, 
                 region = $5, district = $6, group_id = $7, updated_at = CURRENT_TIMESTAMP
             WHERE id = $8 
             RETURNING *`,
            [name, contact, farm_details, location, region, district, group_id, id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Farmer not found' });
        }
        
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Update farmer error:', err);
        res.status(500).json({ error: err.message });
    }
};

export const deleteFarmer = async (req, res) => {
    try {
        const { id } = req.params;
        
        const result = await pool.query('DELETE FROM farmers WHERE id = $1 RETURNING id', [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Farmer not found' });
        }
        
        res.json({ message: "Farmer deleted successfully" });
    } catch (err) {
        console.error('Delete farmer error:', err);
        res.status(500).json({ error: err.message });
    }
};

// =============================================
// PRODUCE CRUD OPERATIONS
// =============================================

export const getAllProduces = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT p.*, f.name as farmer_name 
            FROM produce p 
            LEFT JOIN farmers f ON p.farmer_id = f.id 
            ORDER BY p.created_at DESC
        `);
        res.json(result.rows);
    } catch (err) {
        console.error('Get all produces error:', err);
        res.status(500).json({ error: err.message });
    }
};

export const getProduceById = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(`
            SELECT p.*, f.name as farmer_name 
            FROM produce p 
            LEFT JOIN farmers f ON p.farmer_id = f.id 
            WHERE p.id = $1
        `, [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Produce not found' });
        }
        
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Get produce by ID error:', err);
        res.status(500).json({ error: err.message });
    }
};

export const createProduce = async (req, res) => {
    try {
        const { farmer_id, type, quantity, harvest_date, quality_report, is_biofortified, status, price, unit, region } = req.body;
        
        const result = await pool.query(
            `INSERT INTO produce 
             (farmer_id, type, quantity, harvest_date, quality_report, is_biofortified, status, price, unit, region) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
             RETURNING *`,
            [farmer_id, type, quantity, harvest_date, quality_report, is_biofortified, status, price, unit, region]
        );
        
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Create produce error:', err);
        res.status(500).json({ error: err.message });
    }
};

export const updateProduce = async (req, res) => {
    try {
        const { id } = req.params;
        const { type, quantity, harvest_date, quality_report, is_biofortified, status, price, unit, region } = req.body;
        
        const result = await pool.query(
            `UPDATE produce 
             SET type = $1, quantity = $2, harvest_date = $3, quality_report = $4, 
                 is_biofortified = $5, status = $6, price = $7, unit = $8, region = $9,
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = $10 
             RETURNING *`,
            [type, quantity, harvest_date, quality_report, is_biofortified, status, price, unit, region, id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Produce not found' });
        }
        
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Update produce error:', err);
        res.status(500).json({ error: err.message });
    }
};

export const deleteProduce = async (req, res) => {
    try {
        const { id } = req.params;
        
        const result = await pool.query('DELETE FROM produce WHERE id = $1 RETURNING id', [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Produce not found' });
        }
        
        res.json({ message: "Produce deleted successfully" });
    } catch (err) {
        console.error('Delete produce error:', err);
        res.status(500).json({ error: err.message });
    }
};

// =============================================
// TRANSPORTER CRUD OPERATIONS
// =============================================

export const getAllTransporters = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM transporters ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (err) {
        console.error('Get all transporters error:', err);
        res.status(500).json({ error: err.message });
    }
};

export const getTransporterById = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('SELECT * FROM transporters WHERE id = $1', [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Transporter not found' });
        }
        
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Get transporter by ID error:', err);
        res.status(500).json({ error: err.message });
    }
};

export const createTransporter = async (req, res) => {
    try {
        const { name, contact, vehicle_details, status, region, capacity, current_load, rating } = req.body;
        
        const result = await pool.query(
            `INSERT INTO transporters 
             (name, contact, vehicle_details, status, region, capacity, current_load, rating) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
             RETURNING *`,
            [name, contact, vehicle_details, status, region, capacity, current_load, rating]
        );
        
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Create transporter error:', err);
        res.status(500).json({ error: err.message });
    }
};

export const updateTransporter = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, contact, vehicle_details, status, region, capacity, current_load, rating } = req.body;
        
        const result = await pool.query(
            `UPDATE transporters 
             SET name = $1, contact = $2, vehicle_details = $3, status = $4, 
                 region = $5, capacity = $6, current_load = $7, rating = $8,
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = $9 
             RETURNING *`,
            [name, contact, vehicle_details, status, region, capacity, current_load, rating, id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Transporter not found' });
        }
        
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Update transporter error:', err);
        res.status(500).json({ error: err.message });
    }
};

export const deleteTransporter = async (req, res) => {
    try {
        const { id } = req.params;
        
        const result = await pool.query('DELETE FROM transporters WHERE id = $1 RETURNING id', [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Transporter not found' });
        }
        
        res.json({ message: "Transporter deleted successfully" });
    } catch (err) {
        console.error('Delete transporter error:', err);
        res.status(500).json({ error: err.message });
    }
};

// =============================================
// FACILITY CRUD OPERATIONS
// =============================================

export const getAllFacilities = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM facilities ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (err) {
        console.error('Get all facilities error:', err);
        res.status(500).json({ error: err.message });
    }
};

export const getFacilityById = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('SELECT * FROM facilities WHERE id = $1', [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Facility not found' });
        }
        
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Get facility by ID error:', err);
        res.status(500).json({ error: err.message });
    }
};

export const createFacility = async (req, res) => {
    try {
        const { name, location, processing_details, workload } = req.body;
        
        const result = await pool.query(
            `INSERT INTO facilities (name, location, processing_details, workload) 
             VALUES ($1, $2, $3, $4) 
             RETURNING *`,
            [name, location, processing_details, workload]
        );
        
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Create facility error:', err);
        res.status(500).json({ error: err.message });
    }
};

export const updateFacility = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, location, processing_details, workload } = req.body;
        
        const result = await pool.query(
            `UPDATE facilities 
             SET name = $1, location = $2, processing_details = $3, workload = $4,
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = $5 
             RETURNING *`,
            [name, location, processing_details, workload, id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Facility not found' });
        }
        
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Update facility error:', err);
        res.status(500).json({ error: err.message });
    }
};

export const deleteFacility = async (req, res) => {
    try {
        const { id } = req.params;
        
        const result = await pool.query('DELETE FROM facilities WHERE id = $1 RETURNING id', [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Facility not found' });
        }
        
        res.json({ message: "Facility deleted successfully" });
    } catch (err) {
        console.error('Delete facility error:', err);
        res.status(500).json({ error: err.message });
    }
};

// =============================================
// SHIPMENT CRUD OPERATIONS
// =============================================

export const getAllShipments = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT s.*, p.type as produce_type, t.name as transporter_name, f.name as facility_name
            FROM shipments s
            LEFT JOIN produce p ON s.produce_id = p.id
            LEFT JOIN transporters t ON s.transporter_id = t.id
            LEFT JOIN facilities f ON s.facility_id = f.id
            ORDER BY s.created_at DESC
        `);
        res.json(result.rows);
    } catch (err) {
        console.error('Get all shipments error:', err);
        res.status(500).json({ error: err.message });
    }
};

export const getShipmentById = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(`
            SELECT s.*, p.type as produce_type, t.name as transporter_name, f.name as facility_name
            FROM shipments s
            LEFT JOIN produce p ON s.produce_id = p.id
            LEFT JOIN transporters t ON s.transporter_id = t.id
            LEFT JOIN facilities f ON s.facility_id = f.id
            WHERE s.id = $1
        `, [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Shipment not found' });
        }
        
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Get shipment by ID error:', err);
        res.status(500).json({ error: err.message });
    }
};

export const createShipment = async (req, res) => {
    try {
        const { produce_id, transporter_id, facility_id, storage_id, destination, status, delivery_date } = req.body;
        
        const result = await pool.query(
            `INSERT INTO shipments 
             (produce_id, transporter_id, facility_id, storage_id, destination, status, delivery_date) 
             VALUES ($1, $2, $3, $4, $5, $6, $7) 
             RETURNING *`,
            [produce_id, transporter_id, facility_id, storage_id, destination, status, delivery_date]
        );
        
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Create shipment error:', err);
        res.status(500).json({ error: err.message });
    }
};

export const updateShipment = async (req, res) => {
    try {
        const { id } = req.params;
        const { produce_id, transporter_id, facility_id, storage_id, destination, status, delivery_date } = req.body;
        
        const result = await pool.query(
            `UPDATE shipments 
             SET produce_id = $1, transporter_id = $2, facility_id = $3, storage_id = $4,
                 destination = $5, status = $6, delivery_date = $7, updated_at = CURRENT_TIMESTAMP
             WHERE id = $8 
             RETURNING *`,
            [produce_id, transporter_id, facility_id, storage_id, destination, status, delivery_date, id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Shipment not found' });
        }
        
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Update shipment error:', err);
        res.status(500).json({ error: err.message });
    }
};

export const deleteShipment = async (req, res) => {
    try {
        const { id } = req.params;
        
        const result = await pool.query('DELETE FROM shipments WHERE id = $1 RETURNING id', [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Shipment not found' });
        }
        
        res.json({ message: "Shipment deleted successfully" });
    } catch (err) {
        console.error('Delete shipment error:', err);
        res.status(500).json({ error: err.message });
    }
};

// =============================================
// CUSTOMER CRUD OPERATIONS
// =============================================

export const getAllCustomers = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM customers ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (err) {
        console.error('Get all customers error:', err);
        res.status(500).json({ error: err.message });
    }
};

export const getCustomerById = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('SELECT * FROM customers WHERE id = $1', [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Customer not found' });
        }
        
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Get customer by ID error:', err);
        res.status(500).json({ error: err.message });
    }
};

export const createCustomer = async (req, res) => {
    try {
        const { name, password, contact, purchase_history } = req.body;
        
        const result = await pool.query(
            `INSERT INTO customers (name, password, contact, purchase_history) 
             VALUES ($1, $2, $3, $4) 
             RETURNING *`,
            [name, password, contact, purchase_history]
        );
        
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Create customer error:', err);
        res.status(500).json({ error: err.message });
    }
};

export const updateCustomer = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, password, contact, purchase_history } = req.body;
        
        const result = await pool.query(
            `UPDATE customers 
             SET name = $1, password = $2, contact = $3, purchase_history = $4,
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = $5 
             RETURNING *`,
            [name, password, contact, purchase_history, id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Customer not found' });
        }
        
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Update customer error:', err);
        res.status(500).json({ error: err.message });
    }
};

export const deleteCustomer = async (req, res) => {
    try {
        const { id } = req.params;
        
        const result = await pool.query('DELETE FROM customers WHERE id = $1 RETURNING id', [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Customer not found' });
        }
        
        res.json({ message: "Customer deleted successfully" });
    } catch (err) {
        console.error('Delete customer error:', err);
        res.status(500).json({ error: err.message });
    }
};

// =============================================
// WEATHER HISTORY CRUD OPERATIONS
// =============================================

export const getAllWeatherHistories = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT wh.*, f.name as farmer_name 
            FROM weather_history wh 
            LEFT JOIN farmers f ON wh.farmer_id = f.id 
            ORDER BY wh.timestamp DESC
        `);
        res.json(result.rows);
    } catch (err) {
        console.error('Get all weather histories error:', err);
        res.status(500).json({ error: err.message });
    }
};

export const getWeatherHistoryById = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(`
            SELECT wh.*, f.name as farmer_name 
            FROM weather_history wh 
            LEFT JOIN farmers f ON wh.farmer_id = f.id 
            WHERE wh.id = $1
        `, [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Weather history not found' });
        }
        
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Get weather history by ID error:', err);
        res.status(500).json({ error: err.message });
    }
};

export const createWeatherHistory = async (req, res) => {
    try {
        const { farmer_id, location, temperature, humidity, wind_speed, conditions, description, icon, timestamp } = req.body;
        
        const result = await pool.query(
            `INSERT INTO weather_history 
             (farmer_id, location, temperature, humidity, wind_speed, conditions, description, icon, timestamp) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
             RETURNING *`,
            [farmer_id, location, temperature, humidity, wind_speed, conditions, description, icon, timestamp]
        );
        
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Create weather history error:', err);
        res.status(500).json({ error: err.message });
    }
};

export const updateWeatherHistory = async (req, res) => {
    try {
        const { id } = req.params;
        const { location, temperature, humidity, wind_speed, conditions, description, icon, timestamp } = req.body;
        
        const result = await pool.query(
            `UPDATE weather_history 
             SET location = $1, temperature = $2, humidity = $3, wind_speed = $4,
                 conditions = $5, description = $6, icon = $7, timestamp = $8,
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = $9 
             RETURNING *`,
            [location, temperature, humidity, wind_speed, conditions, description, icon, timestamp, id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Weather history not found' });
        }
        
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Update weather history error:', err);
        res.status(500).json({ error: err.message });
    }
};

export const deleteWeatherHistory = async (req, res) => {
    try {
        const { id } = req.params;
        
        const result = await pool.query('DELETE FROM weather_history WHERE id = $1 RETURNING id', [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Weather history not found' });
        }
        
        res.json({ message: "Weather history deleted successfully" });
    } catch (err) {
        console.error('Delete weather history error:', err);
        res.status(500).json({ error: err.message });
    }
};

// =============================================
// PROBLEM CRUD OPERATIONS
// =============================================

export const getAllProblems = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT p.*, f.name as farmer_name 
            FROM problems p 
            LEFT JOIN farmers f ON p.farmer_id = f.id 
            ORDER BY p.created_at DESC
        `);
        res.json(result.rows);
    } catch (err) {
        console.error('Get all problems error:', err);
        res.status(500).json({ error: err.message });
    }
};

export const getProblemById = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(`
            SELECT p.*, f.name as farmer_name 
            FROM problems p 
            LEFT JOIN farmers f ON p.farmer_id = f.id 
            WHERE p.id = $1
        `, [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Problem not found' });
        }
        
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Get problem by ID error:', err);
        res.status(500).json({ error: err.message });
    }
};

export const createProblem = async (req, res) => {
    try {
        const { farm_type, crop, disease, pest, farmer_id, report_id, status } = req.body;
        
        const result = await pool.query(
            `INSERT INTO problems 
             (farm_type, crop, disease, pest, farmer_id, report_id, status) 
             VALUES ($1, $2, $3, $4, $5, $6, $7) 
             RETURNING *`,
            [farm_type, crop, disease, pest, farmer_id, report_id, status]
        );
        
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Create problem error:', err);
        res.status(500).json({ error: err.message });
    }
};

export const updateProblem = async (req, res) => {
    try {
        const { id } = req.params;
        const { farm_type, crop, disease, pest, status } = req.body;
        
        const result = await pool.query(
            `UPDATE problems 
             SET farm_type = $1, crop = $2, disease = $3, pest = $4, status = $5,
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = $6 
             RETURNING *`,
            [farm_type, crop, disease, pest, status, id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Problem not found' });
        }
        
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Update problem error:', err);
        res.status(500).json({ error: err.message });
    }
};

export const deleteProblem = async (req, res) => {
    try {
        const { id } = req.params;
        
        const result = await pool.query('DELETE FROM problems WHERE id = $1 RETURNING id', [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Problem not found' });
        }
        
        res.json({ message: "Problem deleted successfully" });
    } catch (err) {
        console.error('Delete problem error:', err);
        res.status(500).json({ error: err.message });
    }
};

// =============================================
// REPORT CRUD OPERATIONS
// =============================================

export const getAllReports = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT r.*, f.name as farmer_name 
            FROM reports r 
            LEFT JOIN farmers f ON r.farmer_id = f.id 
            ORDER BY r.created_at DESC
        `);
        res.json(result.rows);
    } catch (err) {
        console.error('Get all reports error:', err);
        res.status(500).json({ error: err.message });
    }
};

export const getReportById = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(`
            SELECT r.*, f.name as farmer_name 
            FROM reports r 
            LEFT JOIN farmers f ON r.farmer_id = f.id 
            WHERE r.id = $1
        `, [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Report not found' });
        }
        
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Get report by ID error:', err);
        res.status(500).json({ error: err.message });
    }
};

export const createReport = async (req, res) => {
    try {
        const { problem_type, description, urgency, farmer_id, status } = req.body;
        
        const result = await pool.query(
            `INSERT INTO reports 
             (problem_type, description, urgency, farmer_id, status) 
             VALUES ($1, $2, $3, $4, $5) 
             RETURNING *`,
            [problem_type, description, urgency, farmer_id, status]
        );
        
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Create report error:', err);
        res.status(500).json({ error: err.message });
    }
};

export const updateReport = async (req, res) => {
    try {
        const { id } = req.params;
        const { problem_type, description, urgency, status } = req.body;
        
        const result = await pool.query(
            `UPDATE reports 
             SET problem_type = $1, description = $2, urgency = $3, status = $4,
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = $5 
             RETURNING *`,
            [problem_type, description, urgency, status, id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Report not found' });
        }
        
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Update report error:', err);
        res.status(500).json({ error: err.message });
    }
};

export const deleteReport = async (req, res) => {
    try {
        const { id } = req.params;
        
        const result = await pool.query('DELETE FROM reports WHERE id = $1 RETURNING id', [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Report not found' });
        }
        
        res.json({ message: "Report deleted successfully" });
    } catch (err) {
        console.error('Delete report error:', err);
        res.status(500).json({ error: err.message });
    }
};