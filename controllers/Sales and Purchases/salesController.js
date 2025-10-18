// Import dependencies
import { query, getClient } from '../../config/database.js';
import { updateProductQuantity } from '../../utils/dbUtils.js';
// import { recordTransactionOnBlockchain } from '../utils/blockchain.js';

/**
 * Fetch available biofortified crop listings
 * @route GET /market/listings
 */
const getMarketListings = async (req, res) => {
  try {
    const listingsResult = await query(
      `SELECT p.id, p.type, p.quantity, p.harvest_date as "harvestDate", 
              p.quality_report as "qualityReport", p.status, p.created_at,
              f.name as "farmerName", f.contact as "farmerContact", f.location as "farmerLocation"
       FROM produce p
       LEFT JOIN farmers f ON p.farmer_id = f.id
       WHERE p.status = 'HARVESTED'
       ORDER BY p.created_at DESC`
    );

    res.json({
      success: true,
      listings: listingsResult.rows,
      count: listingsResult.rows.length
    });
  } catch (error) {
    console.error('Error fetching market listings:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch market listings',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Group farmers growing the same biofortified crops for aggregation
 * @route POST /market/group
 * @param {string} cropType - Type of crop to group farmers by
 */
const groupFarmersByCrop = async (req, res) => {
  try {
    const { cropType } = req.body;

    if (!cropType) {
      return res.status(400).json({ 
        success: false,
        error: 'cropType is required' 
      });
    }

    const groupedFarmersResult = await query(
      `SELECT p.id, p.type, p.quantity, p.harvest_date as "harvestDate", p.status,
              f.id as "farmerId", f.name as "farmerName", f.contact as "farmerContact", 
              f.location as "farmerLocation"
       FROM produce p
       LEFT JOIN farmers f ON p.farmer_id = f.id
       WHERE p.type = $1
       ORDER BY p.quantity DESC`,
      [cropType]
    );

    res.json({
      success: true,
      cropType,
      groupedFarmers: groupedFarmersResult.rows,
      count: groupedFarmersResult.rows.length
    });
  } catch (error) {
    console.error('Error grouping farmers by crop:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to group farmers by crop',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Allow buyers to place offers on crops, recording transaction on blockchain
 * @route POST /market/offer
 * @param {string} produceId - ID of the produce
 * @param {string} buyerId - ID of the buyer
 * @param {number} offerPrice - Offer price for the produce
 */
const placeOffer = async (req, res) => {
  const client = await getClient();
  
  try {
    await client.query('BEGIN');

    const { produceId, buyerId, offerPrice } = req.body;

    // Validate required fields
    if (!produceId || !buyerId || !offerPrice) {
      await client.query('ROLLBACK');
      return res.status(400).json({ 
        success: false,
        error: 'Missing required fields: produceId, buyerId, offerPrice' 
      });
    }

    // Check if produce exists
    const produceCheck = await client.query(
      'SELECT id FROM produce WHERE id = $1',
      [produceId]
    );

    if (produceCheck.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ 
        success: false,
        error: 'Produce not found' 
      });
    }

    // Check if buyer exists
    const buyerCheck = await client.query(
      'SELECT id FROM customers WHERE id = $1',
      [buyerId]
    );

    if (buyerCheck.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ 
        success: false,
        error: 'Buyer not found' 
      });
    }

    // Create transaction
    const transactionResult = await client.query(
      `INSERT INTO transactions (produce_id, buyer_id, offer_price, status, created_at) 
       VALUES ($1, $2, $3, $4, NOW()) 
       RETURNING id, produce_id as "produceId", buyer_id as "buyerId", offer_price as "offerPrice", status, created_at`,
      [produceId, buyerId, offerPrice, 'PENDING']
    );

    const transaction = transactionResult.rows[0];

    // Record the offer on the blockchain for traceability
    // await recordTransactionOnBlockchain(transaction);

    await client.query('COMMIT');

    res.status(201).json({
      success: true,
      message: 'Offer placed successfully',
      transaction
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error placing offer:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to place offer',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  } finally {
    client.release();
  }
};

/**
 * Retrieve a buyer's transaction history
 * @route GET /market/transactions/:userId
 * @param {string} userId - ID of the buyer
 */
const getTransactionHistory = async (req, res) => {
  try {
    const { userId } = req.params;

    const transactionsResult = await query(
      `SELECT t.id, t.offer_price as "offerPrice", t.status, t.created_at,
              p.type as "produceType", p.quantity, p.harvest_date as "harvestDate",
              f.name as "farmerName", f.contact as "farmerContact"
       FROM transactions t
       LEFT JOIN produce p ON t.produce_id = p.id
       LEFT JOIN farmers f ON p.farmer_id = f.id
       WHERE t.buyer_id = $1
       ORDER BY t.created_at DESC`,
      [userId]
    );

    res.json({
      success: true,
      transactions: transactionsResult.rows,
      count: transactionsResult.rows.length
    });
  } catch (error) {
    console.error('Error fetching transaction history:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch transaction history',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Product CRUD operations

const createProduct = async (req, res) => {
  const client = await getClient();
  
  try {
    await client.query('BEGIN');

    const { name, price, units, quantity, farmerId, facilityId, transporterId } = req.body;

    // Validate required fields
    if (!name || !price || !units || !quantity) {
      await client.query('ROLLBACK');
      return res.status(400).json({ 
        success: false,
        error: 'Missing required fields: name, price, units, quantity' 
      });
    }

    // Check if farmer exists if farmerId is provided
    if (farmerId) {
      const farmerExists = await client.query(
        'SELECT id FROM farmers WHERE id = $1',
        [farmerId]
      );
      if (farmerExists.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ 
          success: false,
          error: "Farmer not found" 
        });
      }
    }

    // Check if facility exists if facilityId is provided
    if (facilityId) {
      const facilityExists = await client.query(
        'SELECT id FROM facilities WHERE id = $1',
        [facilityId]
      );
      if (facilityExists.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ 
          success: false,
          error: "Facility not found" 
        });
      }
    }

    // Check if transporter exists if transporterId is provided
    if (transporterId) {
      const transporterExists = await client.query(
        'SELECT id FROM transporters WHERE id = $1',
        [transporterId]
      );
      if (transporterExists.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ 
          success: false,
          error: "Transporter not found" 
        });
      }
    }

    // Create the product
    const productResult = await client.query(
      `INSERT INTO products (name, price, units, quantity, farmer_id, facility_id, transporter_id, created_at) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW()) 
       RETURNING id, name, price, units, quantity, farmer_id as "farmerId", 
                facility_id as "facilityId", transporter_id as "transporterId", created_at`,
      [name, price, units, quantity, farmerId, facilityId, transporterId]
    );

    const product = productResult.rows[0];

    await client.query('COMMIT');

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      product
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating product:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to create product',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  } finally {
    client.release();
  }
};

const getAllProducts = async (req, res) => {
  try {
    const productsResult = await query(
      `SELECT p.id, p.name, p.price, p.units, p.quantity, p.created_at,
              f.name as "farmerName", f.contact as "farmerContact",
              fac.name as "facilityName", fac.location as "facilityLocation",
              t.name as "transporterName", t.contact as "transporterContact"
       FROM products p
       LEFT JOIN farmers f ON p.farmer_id = f.id
       LEFT JOIN facilities fac ON p.facility_id = fac.id
       LEFT JOIN transporters t ON p.transporter_id = t.id
       ORDER BY p.created_at DESC`
    );

    res.json({
      success: true,
      products: productsResult.rows,
      count: productsResult.rows.length
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch products',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const productResult = await query(
      `SELECT p.id, p.name, p.price, p.units, p.quantity, p.created_at,
              f.name as "farmerName", f.contact as "farmerContact",
              fac.name as "facilityName", fac.location as "facilityLocation",
              t.name as "transporterName", t.contact as "transporterContact"
       FROM products p
       LEFT JOIN farmers f ON p.farmer_id = f.id
       LEFT JOIN facilities fac ON p.facility_id = fac.id
       LEFT JOIN transporters t ON p.transporter_id = t.id
       WHERE p.id = $1`,
      [id]
    );

    if (productResult.rows.length === 0) {
      return res.status(404).json({ 
        success: false,
        error: 'Product not found' 
      });
    }

    const product = productResult.rows[0];

    res.json({
      success: true,
      product
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch product',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const updateProduct = async (req, res) => {
  const client = await getClient();
  
  try {
    await client.query('BEGIN');

    const { id } = req.params;
    const { name, price, units, quantity, farmerId, facilityId, transporterId } = req.body;

    // Check if product exists
    const productCheck = await client.query(
      'SELECT id FROM products WHERE id = $1',
      [id]
    );

    if (productCheck.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ 
        success: false,
        error: 'Product not found' 
      });
    }

    // Update product
    const updateResult = await client.query(
      `UPDATE products 
       SET name = COALESCE($1, name), 
           price = COALESCE($2, price), 
           units = COALESCE($3, units), 
           quantity = COALESCE($4, quantity),
           farmer_id = COALESCE($5, farmer_id),
           facility_id = COALESCE($6, facility_id),
           transporter_id = COALESCE($7, transporter_id),
           updated_at = NOW() 
       WHERE id = $8 
       RETURNING id, name, price, units, quantity, farmer_id as "farmerId", 
                facility_id as "facilityId", transporter_id as "transporterId", updated_at`,
      [name, price, units, quantity, farmerId, facilityId, transporterId, id]
    );

    const updatedProduct = updateResult.rows[0];

    await client.query('COMMIT');

    res.json({
      success: true,
      message: 'Product updated successfully',
      product: updatedProduct
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error updating product:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to update product',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  } finally {
    client.release();
  }
};

const deleteProduct = async (req, res) => {
  const client = await getClient();
  
  try {
    await client.query('BEGIN');

    const { id } = req.params;

    // Check if product exists
    const productCheck = await client.query(
      'SELECT id FROM products WHERE id = $1',
      [id]
    );

    if (productCheck.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ 
        success: false,
        error: 'Product not found' 
      });
    }

    // Delete the product
    await client.query(
      'DELETE FROM products WHERE id = $1',
      [id]
    );

    await client.query('COMMIT');

    res.status(200).json({ 
      success: true,
      message: "Product deleted successfully" 
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error deleting product:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to delete product',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  } finally {
    client.release();
  }
};

const createTransaction = async (req, res) => {
  const client = await getClient();
  
  try {
    await client.query('BEGIN');

    const { buyerId, products = [], produce = [], inputs = [], serviceOffering = [] } = req.body;

    // Validate buyer exists
    const buyerResult = await client.query(
      'SELECT id FROM customers WHERE id = $1',
      [buyerId]
    );

    if (buyerResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ 
        success: false,
        error: "Customer not found" 
      });
    }

    let totalAmount = 0;
    const processedItems = {
      products: [],
      produce: [],
      inputs: [],
      serviceOffering: []
    };

    // Process Products
    for (const item of products) {
      const productResult = await client.query(
        'SELECT id, name, price, quantity FROM products WHERE id = $1',
        [item.productId]
      );

      if (productResult.rows.length === 0) {
        await client.query('ROLLBACK');
        throw new Error(`Product not found: ${item.productId}`);
      }

      const product = productResult.rows[0];
      if (product.quantity < item.quantity) {
        await client.query('ROLLBACK');
        throw new Error(`Insufficient stock for ${product.name}`);
      }

      const itemTotal = product.price * item.quantity;
      totalAmount += itemTotal;

      processedItems.products.push({
        productId: product.id,
        quantity: item.quantity,
        price: product.price
      });
    }

    // Process Produce
    for (const item of produce) {
      const produceResult = await client.query(
        'SELECT id, type, price, quantity, status FROM produce WHERE id = $1',
        [item.produceId]
      );

      if (produceResult.rows.length === 0) {
        await client.query('ROLLBACK');
        throw new Error(`Produce not found: ${item.produceId}`);
      }

      const produceItem = produceResult.rows[0];
      if (!['HARVESTED', 'PROCESSED', 'DELIVERED'].includes(produceItem.status) || produceItem.quantity < item.quantity) {
        await client.query('ROLLBACK');
        throw new Error(`Produce not available or quantity too low`);
      }

      const itemTotal = produceItem.price * item.quantity;
      totalAmount += itemTotal;

      processedItems.produce.push({
        produceId: produceItem.id,
        quantity: item.quantity,
        price: produceItem.price
      });
    }

    // Process Inputs
    for (const item of inputs) {
      const inputResult = await client.query(
        'SELECT id, name, price, quantity FROM farm_inputs WHERE id = $1',
        [item.inputId]
      );

      if (inputResult.rows.length === 0) {
        await client.query('ROLLBACK');
        throw new Error(`Input not found: ${item.inputId}`);
      }

      const input = inputResult.rows[0];
      if (input.quantity < item.quantity) {
        await client.query('ROLLBACK');
        throw new Error(`Insufficient stock for ${input.name}`);
      }

      const itemTotal = input.price * item.quantity;
      totalAmount += itemTotal;

      processedItems.inputs.push({
        inputId: input.id,
        quantity: item.quantity,
        price: input.price
      });
    }

    // Create transaction
    const transactionResult = await client.query(
      `INSERT INTO transactions (buyer_id, total_amount, status, payment_method, created_at) 
       VALUES ($1, $2, $3, $4, NOW()) 
       RETURNING id, buyer_id as "buyerId", total_amount as "totalAmount", status, payment_method as "paymentMethod", created_at`,
      [buyerId, totalAmount, 'PENDING', 'CASH']
    );

    const transaction = transactionResult.rows[0];
    const transactionId = transaction.id;

    // Create transaction items
    for (const item of processedItems.products) {
      await client.query(
        `INSERT INTO transaction_products (transaction_id, product_id, quantity, price) 
         VALUES ($1, $2, $3, $4)`,
        [transactionId, item.productId, item.quantity, item.price]
      );

      // Update product quantity
      await client.query(
        'UPDATE products SET quantity = quantity - $1 WHERE id = $2',
        [item.quantity, item.productId]
      );
    }

    for (const item of processedItems.produce) {
      await client.query(
        `INSERT INTO transaction_produce (transaction_id, produce_id, quantity, price) 
         VALUES ($1, $2, $3, $4)`,
        [transactionId, item.produceId, item.quantity, item.price]
      );

      // Update produce quantity and status
      const newQuantity = await client.query(
        'SELECT quantity FROM produce WHERE id = $1',
        [item.produceId]
      );

      const remainingQuantity = newQuantity.rows[0].quantity - item.quantity;
      const newStatus = remainingQuantity <= 0 ? 'DELIVERED' : 'HARVESTED';

      await client.query(
        'UPDATE produce SET quantity = $1, status = $2 WHERE id = $3',
        [remainingQuantity, newStatus, item.produceId]
      );
    }

    for (const item of processedItems.inputs) {
      await client.query(
        `INSERT INTO transaction_inputs (transaction_id, input_id, quantity, price) 
         VALUES ($1, $2, $3, $4)`,
        [transactionId, item.inputId, item.quantity, item.price]
      );

      // Update input quantity
      await client.query(
        'UPDATE farm_inputs SET quantity = quantity - $1 WHERE id = $2',
        [item.quantity, item.inputId]
      );
    }

    await client.query('COMMIT');

    res.status(201).json({
      success: true,
      message: "Transaction created successfully",
      transaction,
      summary: {
        totalAmount,
        items: {
          products: processedItems.products.length,
          produce: processedItems.produce.length,
          inputs: processedItems.inputs.length,
          serviceOffering: processedItems.serviceOffering.length
        }
      }
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error("Transaction Error:", error);
    res.status(500).json({
      success: false,
      error: "Transaction failed",
      message: error.message,
      ...(process.env.NODE_ENV === 'development' && { details: error.message })
    });
  } finally {
    client.release();
  }
};

const getAllTransactions = async (req, res) => {
  try {
    const transactionsResult = await query(
      `SELECT t.id, t.total_amount as "totalAmount", t.status, t.payment_method as "paymentMethod", t.created_at,
              c.name as "buyerName", c.contact as "buyerContact"
       FROM transactions t
       LEFT JOIN customers c ON t.buyer_id = c.id
       ORDER BY t.created_at DESC`
    );

    res.json({
      success: true,
      transactions: transactionsResult.rows,
      count: transactionsResult.rows.length
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch transactions',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const getTransactionById = async (req, res) => {
  try {
    const { id } = req.params;

    // Fetch the transaction
    const transactionResult = await query(
      `SELECT t.id, t.total_amount as "totalAmount", t.status, t.payment_method as "paymentMethod", t.created_at,
              c.name as "buyerName", c.contact as "buyerContact"
       FROM transactions t
       LEFT JOIN customers c ON t.buyer_id = c.id
       WHERE t.id = $1`,
      [id]
    );

    if (transactionResult.rows.length === 0) {
      return res.status(404).json({ 
        success: false,
        error: "Transaction not found" 
      });
    }

    const transaction = transactionResult.rows[0];

    // Fetch transaction items
    const [products, produce, inputs] = await Promise.all([
      query(
        `SELECT p.id, p.name, tp.quantity, tp.price
         FROM transaction_products tp
         LEFT JOIN products p ON tp.product_id = p.id
         WHERE tp.transaction_id = $1`,
        [id]
      ),
      query(
        `SELECT pr.id, pr.type, tpr.quantity, tpr.price
         FROM transaction_produce tpr
         LEFT JOIN produce pr ON tpr.produce_id = pr.id
         WHERE tpr.transaction_id = $1`,
        [id]
      ),
      query(
        `SELECT fi.id, fi.name, ti.quantity, ti.price
         FROM transaction_inputs ti
         LEFT JOIN farm_inputs fi ON ti.input_id = fi.id
         WHERE ti.transaction_id = $1`,
        [id]
      )
    ]);

    transaction.products = products.rows;
    transaction.produce = produce.rows;
    transaction.inputs = inputs.rows;

    res.json({
      success: true,
      transaction
    });
  } catch (error) {
    console.error("Error fetching transaction:", error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch transaction',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const getFarmerTransactions = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if farmer exists
    const farmerResult = await query(
      'SELECT id, name FROM farmers WHERE id = $1',
      [id]
    );

    if (farmerResult.rows.length === 0) {
      return res.status(404).json({ 
        success: false,
        message: 'Farmer not found' 
      });
    }

    // Get transactions from farmer's products
    const productTransactions = await query(
      `SELECT DISTINCT t.*
       FROM transactions t
       JOIN transaction_products tp ON t.id = tp.transaction_id
       JOIN products p ON tp.product_id = p.id
       WHERE p.farmer_id = $1`,
      [id]
    );

    // Get transactions from farmer's produce
    const produceTransactions = await query(
      `SELECT DISTINCT t.*
       FROM transactions t
       JOIN transaction_produce tpr ON t.id = tpr.transaction_id
       JOIN produce pr ON tpr.produce_id = pr.id
       WHERE pr.farmer_id = $1`,
      [id]
    );

    const transactions = [...productTransactions.rows, ...produceTransactions.rows];

    if (transactions.length === 0) {
      return res.status(200).json({ 
        success: true,
        message: 'No transactions found', 
        transactions: [] 
      });
    }

    res.status(200).json({
      success: true,
      transactions,
      count: transactions.length
    });
  } catch (error) {
    console.error('Error fetching farmer transactions:', error);
    res.status(500).json({ 
      success: false,
      message: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const getTransactionsByCustomerId = async (req, res) => {
  const { id } = req.params;
  
  try {
    const transactionsResult = await query(
      `SELECT t.id, t.total_amount as "totalAmount", t.status, t.payment_method as "paymentMethod", t.created_at
       FROM transactions t
       WHERE t.buyer_id = $1
       ORDER BY t.created_at DESC`,
      [id]
    );

    if (transactionsResult.rows.length === 0) {
      return res.status(404).json({ 
        success: false,
        message: 'No transactions found for this customer' 
      });
    }

    res.status(200).json({
      success: true,
      transactions: transactionsResult.rows,
      count: transactionsResult.rows.length
    });
  } catch (error) {
    console.error('Error fetching customer transactions:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching transactions',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const updateTransaction = async (req, res) => {
  const client = await getClient();
  
  try {
    await client.query('BEGIN');

    const { id } = req.params;
    const { status } = req.body;

    // Validate status
    const validStatuses = ["PENDING", "COMPLETED", "CANCELLED"];
    if (!validStatuses.includes(status)) {
      await client.query('ROLLBACK');
      return res.status(400).json({ 
        success: false,
        error: "Invalid status" 
      });
    }

    // Check if transaction exists
    const transactionCheck = await client.query(
      'SELECT id FROM transactions WHERE id = $1',
      [id]
    );

    if (transactionCheck.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ 
        success: false,
        error: 'Transaction not found' 
      });
    }

    // Update the transaction
    const updateResult = await client.query(
      `UPDATE transactions 
       SET status = $1, updated_at = NOW() 
       WHERE id = $2 
       RETURNING id, status, updated_at`,
      [status, id]
    );

    const transaction = updateResult.rows[0];

    await client.query('COMMIT');

    res.json({
      success: true,
      message: 'Transaction updated successfully',
      transaction
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error updating transaction:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to update transaction',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  } finally {
    client.release();
  }
};

const deleteTransaction = async (req, res) => {
  const client = await getClient();
  
  try {
    await client.query('BEGIN');

    const { id } = req.params;

    // Fetch the transaction to get product details
    const transactionResult = await query(
      `SELECT tp.product_id, tp.quantity
       FROM transaction_products tp
       WHERE tp.transaction_id = $1`,
      [id]
    );

    if (transactionResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ 
        success: false,
        error: "Transaction not found" 
      });
    }

    // Restore product quantities
    for (const item of transactionResult.rows) {
      await updateProductQuantity(item.product_id, item.quantity);
    }

    // Delete the transaction
    await client.query('DELETE FROM transactions WHERE id = $1', [id]);

    await client.query('COMMIT');

    res.status(200).json({ 
      success: true,
      message: "Transaction deleted successfully" 
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error deleting transaction:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to delete transaction',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  } finally {
    client.release();
  }
};

export default {
  getMarketListings,
  groupFarmersByCrop,
  placeOffer,
  getTransactionHistory,
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  createTransaction,
  getAllTransactions,
  getTransactionById,
  updateTransaction,
  deleteTransaction,
  getFarmerTransactions,
  getTransactionsByCustomerId
};