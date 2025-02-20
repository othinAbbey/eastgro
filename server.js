const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const farmerRoutes = require('./routes/farmerRoutes');
const productRoutes = require('./routes/productRoutes');
const reportRoutes = require('./routes/reportRoutes');

const app = express();
app.use(bodyParser.json());
app.use(cors());

// Use Routes
app.use('/api/farmers', farmerRoutes);
app.use('/api/products', productRoutes);
app.use('/api/reports', reportRoutes);

// Start the server
const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));