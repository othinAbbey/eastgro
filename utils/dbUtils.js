// // utils/dbUtils.js
// import { PrismaClient } from '@prisma/client';
// const prisma = new PrismaClient();

// /**
//  * Check if a record exists in the database
//  * @param {string} model - Prisma model name (e.g., 'farmer', 'product')
//  * @param {string} id - Record ID
//  * @returns {Promise<boolean>} - True if the record exists, false otherwise
//  */
// const recordExists = async (model, id) => {
//   const record = await prisma[model].findUnique({ where: { id } });
//   return !!record;
// };

// /**
//  * Update product quantities
//  * @param {string} productId - Product ID
//  * @param {number} quantityChange - Change in quantity (positive or negative)
//  */
// const updateProductQuantity = async (productId, quantityChange) => {
//   await prisma.product.update({
//     where: { id: productId },
//     data: { quantity: { increment: quantityChange } },
//   });
// };

// export { recordExists, updateProductQuantity };

import pool from '../config/database.js';

/**
 * Check if a record exists in the database
 * @param {string} table - Table name (e.g., 'farmers', 'products')
 * @param {string} id - Record ID
 * @returns {Promise<boolean>} - True if the record exists, false otherwise
 */
const recordExists = async (table, id) => {
  try {
    // Validate table name to prevent SQL injection
    const validTables = [
      'users', 'farmers', 'customers', 'products', 'produce', 'crops', 
      'crop_varieties', 'farm_plans', 'investments', 'transactions', 
      'orders', 'shipments', 'facilities', 'transporters', 'service_providers',
      'services', 'problems', 'reports', 'weather_history', 'qr_codes'
    ];
    
    if (!validTables.includes(table)) {
      throw new Error(`Invalid table name: ${table}`);
    }

    const result = await pool.query(
      `SELECT EXISTS(SELECT 1 FROM ${table} WHERE id = $1)`,
      [id]
    );
    
    return result.rows[0].exists;
  } catch (error) {
    console.error(`Error checking record existence in ${table}:`, error);
    throw error;
  }
};

/**
 * Update product quantities
 * @param {string} productId - Product ID
 * @param {number} quantityChange - Change in quantity (positive or negative)
 */
const updateProductQuantity = async (productId, quantityChange) => {
  try {
    await pool.query(
      `UPDATE products 
       SET quantity = quantity + $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2`,
      [quantityChange, productId]
    );
  } catch (error) {
    console.error('Error updating product quantity:', error);
    throw error;
  }
};

/**
 * Update produce quantities
 * @param {string} produceId - Produce ID
 * @param {number} quantityChange - Change in quantity (positive or negative)
 */
const updateProduceQuantity = async (produceId, quantityChange) => {
  try {
    await pool.query(
      `UPDATE produce 
       SET quantity = quantity + $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2`,
      [quantityChange, produceId]
    );
  } catch (error) {
    console.error('Error updating produce quantity:', error);
    throw error;
  }
};

/**
 * Get record by ID
 * @param {string} table - Table name
 * @param {string} id - Record ID
 * @returns {Promise<Object|null>} - Record object or null if not found
 */
const getRecordById = async (table, id) => {
  try {
    const validTables = [
      'users', 'farmers', 'customers', 'products', 'produce', 'crops', 
      'crop_varieties', 'farm_plans', 'investments', 'transactions', 
      'orders', 'shipments', 'facilities', 'transporters', 'service_providers',
      'services', 'problems', 'reports', 'weather_history', 'qr_codes'
    ];
    
    if (!validTables.includes(table)) {
      throw new Error(`Invalid table name: ${table}`);
    }

    const result = await pool.query(
      `SELECT * FROM ${table} WHERE id = $1`,
      [id]
    );
    
    return result.rows[0] || null;
  } catch (error) {
    console.error(`Error getting record from ${table}:`, error);
    throw error;
  }
};

/**
 * Check if a record exists with specific conditions
 * @param {string} table - Table name
 * @param {Object} conditions - Key-value pairs for WHERE clause
 * @returns {Promise<boolean>} - True if the record exists, false otherwise
 */
const recordExistsWithConditions = async (table, conditions) => {
  try {
    const validTables = [
      'users', 'farmers', 'customers', 'products', 'produce', 'crops', 
      'crop_varieties', 'farm_plans', 'investments', 'transactions', 
      'orders', 'shipments', 'facilities', 'transporters', 'service_providers',
      'services', 'problems', 'reports', 'weather_history', 'qr_codes'
    ];
    
    if (!validTables.includes(table)) {
      throw new Error(`Invalid table name: ${table}`);
    }

    const keys = Object.keys(conditions);
    const values = Object.values(conditions);
    
    const whereClause = keys.map((key, index) => `${key} = $${index + 1}`).join(' AND ');
    
    const result = await pool.query(
      `SELECT EXISTS(SELECT 1 FROM ${table} WHERE ${whereClause})`,
      values
    );
    
    return result.rows[0].exists;
  } catch (error) {
    console.error(`Error checking record existence in ${table} with conditions:`, error);
    throw error;
  }
};

/**
 * Soft delete a record (set deleted_at timestamp)
 * @param {string} table - Table name
 * @param {string} id - Record ID
 * @returns {Promise<boolean>} - True if successful
 */
const softDeleteRecord = async (table, id) => {
  try {
    const validTables = [
      'users', 'farmers', 'customers', 'products', 'produce', 'crops', 
      'crop_varieties', 'farm_plans', 'investments', 'transactions', 
      'orders', 'shipments', 'facilities', 'transporters', 'service_providers',
      'services', 'problems', 'reports'
    ];
    
    if (!validTables.includes(table)) {
      throw new Error(`Invalid table name: ${table}`);
    }

    // Check if table has deleted_at column
    const columnCheck = await pool.query(
      `SELECT column_name 
       FROM information_schema.columns 
       WHERE table_name = $1 AND column_name = 'deleted_at'`,
      [table]
    );

    if (columnCheck.rows.length === 0) {
      throw new Error(`Table ${table} does not have deleted_at column`);
    }

    await pool.query(
      `UPDATE ${table} 
       SET deleted_at = CURRENT_TIMESTAMP 
       WHERE id = $1`,
      [id]
    );
    
    return true;
  } catch (error) {
    console.error(`Error soft deleting record from ${table}:`, error);
    throw error;
  }
};

/**
 * Get paginated records from a table
 * @param {string} table - Table name
 * @param {number} page - Page number (starting from 1)
 * @param {number} limit - Number of records per page
 * @param {string} orderBy - Column to order by
 * @param {string} order - Order direction (ASC/DESC)
 * @returns {Promise<Object>} - Paginated results
 */
const getPaginatedRecords = async (table, page = 1, limit = 10, orderBy = 'created_at', order = 'DESC') => {
  try {
    const validTables = [
      'users', 'farmers', 'customers', 'products', 'produce', 'crops', 
      'crop_varieties', 'farm_plans', 'investments', 'transactions', 
      'orders', 'shipments', 'facilities', 'transporters', 'service_providers',
      'services', 'problems', 'reports', 'weather_history'
    ];
    
    if (!validTables.includes(table)) {
      throw new Error(`Invalid table name: ${table}`);
    }

    const offset = (page - 1) * limit;
    
    const [recordsResult, totalResult] = await Promise.all([
      pool.query(
        `SELECT * FROM ${table} 
         ORDER BY ${orderBy} ${order} 
         LIMIT $1 OFFSET $2`,
        [limit, offset]
      ),
      pool.query(`SELECT COUNT(*) FROM ${table}`)
    ]);

    const total = parseInt(totalResult.rows[0].count);
    
    return {
      records: recordsResult.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    };
  } catch (error) {
    console.error(`Error getting paginated records from ${table}:`, error);
    throw error;
  }
};

/**
 * Execute a transaction with multiple queries
 * @param {Array} queries - Array of query objects { text: string, values: array }
 * @returns {Promise<Array>} - Results of all queries
 */
const executeTransaction = async (queries) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const results = [];
    for (const query of queries) {
      const result = await client.query(query.text, query.values || []);
      results.push(result);
    }
    
    await client.query('COMMIT');
    return results;
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Transaction failed:', error);
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Check database connection health
 * @returns {Promise<Object>} - Database health status
 */
const checkDatabaseHealth = async () => {
  try {
    // Test connection and get basic stats
    const [connectionResult, tablesResult, activeConnectionsResult] = await Promise.all([
      pool.query('SELECT NOW() as current_time, version() as version'),
      pool.query(`
        SELECT table_name, table_rows 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
      `),
      pool.query(`
        SELECT count(*) as active_connections 
        FROM pg_stat_activity 
        WHERE datname = current_database()
      `)
    ]);

    return {
      status: 'healthy',
      timestamp: connectionResult.rows[0].current_time,
      version: connectionResult.rows[0].version,
      tables: tablesResult.rows,
      activeConnections: parseInt(activeConnectionsResult.rows[0].active_connections)
    };
  } catch (error) {
    console.error('Database health check failed:', error);
    return {
      status: 'unhealthy',
      error: error.message
    };
  }
};

export {
  recordExists,
  updateProductQuantity,
  updateProduceQuantity,
  getRecordById,
  recordExistsWithConditions,
  softDeleteRecord,
  getPaginatedRecords,
  executeTransaction,
  checkDatabaseHealth
};