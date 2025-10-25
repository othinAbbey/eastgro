// import pkg from 'pg';
// const { Pool } = pkg;
// import dotenv from 'dotenv';

// dotenv.config();

// // Environment detection - Railway app connecting to Render DB
// const isProduction = process.env.NODE_ENV === 'production';
// const isRailway = process.env.RAILWAY || process.env.RAILWAY_STATIC_URL || isProduction;

// console.log('🚄 Environment Detection:', {
//   NODE_ENV: process.env.NODE_ENV,
//   RAILWAY: process.env.RAILWAY,
//   isRailway: isRailway,
//   isProduction: isProduction
// });

// // CRITICAL: Enhanced pool configuration for Railway → Render connection
// const poolConfig = {
//   connectionString: process.env.DATABASE_URL,
  
//   // FORCE SSL for Render PostgreSQL from Railway
//   ssl: isRailway ? { 
//     rejectUnauthorized: false,
//     require: true
//   } : false,
  
//   // Connection pool settings optimized for cross-cloud
//   max: 5, // Reduced for better stability
//   idleTimeoutMillis: 30000,
//   connectionTimeoutMillis: 15000, // Increased for cross-cloud
//   maxUses: 1000,
//   allowExitOnIdle: false,
// };

// console.log('🔧 Database Configuration:', {
//   ssl: poolConfig.ssl,
//   max: poolConfig.max,
//   connectionTimeout: poolConfig.connectionTimeoutMillis
// });

// const pool = new Pool(poolConfig);

// // Track active connections for debugging
// const activeClients = new Set();

// // Enhanced connection test specifically for Railway → Render
// async function testRailwayRenderConnection() {
//   let client;
//   try {
//     console.log('🚄 Testing Railway→Render Database Connection...');
//     console.log('📡 Database Host:', process.env.DATABASE_URL?.split('@')[1]?.split('/')[0]);
//     console.log('🔐 SSL Configuration:', pool.options?.ssl);
    
//     client = await pool.connect();
    
//     // Test basic connection
//     const versionResult = await client.query('SELECT version()');
//     console.log('✅ Database Version:', versionResult.rows[0].version.split(',')[0]);
    
//     // Test SSL specifically
//     const sslResult = await client.query(`
//       SELECT 
//         ssl,
//         version,
//         cipher,
//         bits 
//       FROM pg_stat_ssl 
//       WHERE pid = pg_backend_pid()
//     `);
    
//     if (sslResult.rows.length > 0) {
//       console.log('🔐 SSL Status: ACTIVE', {
//         ssl: sslResult.rows[0].ssl ? 'ENABLED' : 'DISABLED',
//         cipher: sslResult.rows[0].cipher,
//         bits: sslResult.rows[0].bits
//       });
//     } else {
//       console.log('⚠️ SSL Status: No SSL information available');
//     }
    
//     console.log('🎉 SUCCESS: Railway→Render connection established with SSL!');
    
//   } catch (error) {
//     console.error('❌ CRITICAL: Railway→Render connection failed:', {
//       code: error.code,
//       message: error.message,
//       hint: 'Make sure SSL is forced for Render PostgreSQL'
//     });
    
//     // Provide specific guidance based on error
//     if (error.code === '28000' || error.message.includes('SSL')) {
//       console.error('🚨 SSL REQUIRED: Render PostgreSQL mandates SSL connections');
//       console.error('💡 Solution: Force SSL in connection configuration');
//     }
//   } finally {
//     if (client) {
//       client.release();
//       console.log('🔓 Test client released');
//     }
//   }
// }

// // Call this on startup with delay to ensure pool is ready
// setTimeout(() => {
//   testRailwayRenderConnection();
// }, 3000);

// // Enhanced event listeners
// pool.on('connect', (client) => {
//   console.log('✅ New database client connected - Total:', pool.totalCount, 'Idle:', pool.idleCount);
// });

// pool.on('acquire', (client) => {
//   activeClients.add(client);
//   console.log('🔗 Database client acquired - Active:', activeClients.size, 'Total:', pool.totalCount, 'Idle:', pool.idleCount);
// });

// pool.on('remove', (client) => {
//   activeClients.delete(client);
//   console.log('❌ Database client removed - Active:', activeClients.size, 'Total:', pool.totalCount, 'Idle:', pool.idleCount);
// });

// pool.on('error', (err, client) => {
//   console.error('💥 Unexpected error on idle database client:', {
//     message: err.message,
//     code: err.code,
//     sslRelated: err.message.includes('SSL') ? 'YES' : 'NO'
//   });
// });

// // Periodic pool status monitoring
// setInterval(() => {
//   console.log('📊 Pool Status:', {
//     total: pool.totalCount,
//     idle: pool.idleCount,
//     waiting: pool.waitingCount,
//     active: activeClients.size,
//     timestamp: new Date().toISOString()
//   });
// }, 30000);

// // Enhanced query function with error handling
// export const query = async (text, params) => {
//   const start = Date.now();
  
//   try {
//     const result = await pool.query(text, params);
//     const duration = Date.now() - start;
    
//     // Log slow queries
//     if (duration > 1000) {
//       console.warn(`🐌 Slow query (${duration}ms):`, text.substring(0, 100) + '...');
//     }
    
//     return result;
//   } catch (error) {
//     console.error('💥 Query error:', {
//       query: text.substring(0, 200),
//       params: params ? '[...]' : 'none',
//       error: error.message,
//       code: error.code
//     });
    
//     throw error;
//   }
// };

// // Enhanced getClient function with timeout and retry - CRITICAL FIX
// export const getClient = async () => {
//   const maxRetries = 3;
//   let lastError;
  
//   for (let attempt = 1; attempt <= maxRetries; attempt++) {
//     try {
//       console.log(`🔗 Database connection attempt ${attempt}/${maxRetries}...`);
//       const client = await pool.connect();
      
//       // Test connection with simple query
//       await client.query('SELECT NOW() as connection_test');
      
//       console.log(`✅ Database client acquired successfully (attempt ${attempt})`);
//       return client;
      
//     } catch (error) {
//       lastError = error;
//       console.error(`⚠️ Database connection failed (attempt ${attempt}/${maxRetries}):`, {
//         code: error.code,
//         message: error.message,
//         sslIssue: error.message.includes('SSL') ? 'YES' : 'NO'
//       });
      
//       if (attempt < maxRetries) {
//         const delay = 2000 * attempt;
//         console.log(`⏳ Retrying in ${delay/1000} seconds...`);
//         await new Promise(resolve => setTimeout(resolve, delay));
//       }
//     }
//   }
  
//   console.error('💥 All database connection attempts failed');
//   const finalError = new Error(`Database connection failed: ${lastError?.message}`);
//   finalError.originalError = lastError;
//   throw finalError;
// };

// // Enhanced health check with connection details
// export const healthCheck = async () => {
//   let client;
//   try {
//     client = await getClient();
//     await client.query('SELECT 1');
    
//     // Get database connection count
//     const dbConnections = await client.query(`
//       SELECT count(*) as active_connections 
//       FROM pg_stat_activity 
//       WHERE datname = current_database()
//     `);
    
//     // Get SSL info
//     const sslInfo = await client.query(`
//       SELECT ssl, cipher, bits 
//       FROM pg_stat_ssl 
//       WHERE pid = pg_backend_pid()
//     `);
    
//     client.release();
    
//     return {
//       status: 'healthy',
//       timestamp: new Date().toISOString(),
//       database: 'connected',
//       ssl: sslInfo.rows[0] || { ssl: false },
//       poolStats: {
//         total: pool.totalCount,
//         idle: pool.idleCount,
//         waiting: pool.waitingCount,
//         active: activeClients.size
//       },
//       databaseConnections: parseInt(dbConnections.rows[0].active_connections)
//     };
//   } catch (error) {
//     return {
//       status: 'unhealthy',
//       timestamp: new Date().toISOString(),
//       database: 'disconnected',
//       error: error.message,
//       poolStats: {
//         total: pool.totalCount,
//         idle: pool.idleCount,
//         waiting: pool.waitingCount,
//         active: activeClients.size
//       }
//     };
//   }
// };

// // Connection monitoring endpoint
// export const getConnectionStats = async () => {
//   let client;
//   try {
//     client = await pool.connect();
    
//     // Get detailed connection info from database
//     const connectionDetails = await client.query(`
//       SELECT 
//         datname as database,
//         usename as username,
//         application_name,
//         client_addr as client_address,
//         state,
//         query_start,
//         now() - query_start as query_duration,
//         LEFT(query, 100) as current_query
//       FROM pg_stat_activity 
//       WHERE datname = current_database()
//       ORDER BY query_start DESC
//     `);
    
//     client.release();
    
//     return {
//       pool: {
//         total: pool.totalCount,
//         idle: pool.idleCount,
//         waiting: pool.waitingCount,
//         active: activeClients.size
//       },
//       database: {
//         totalConnections: connectionDetails.rows.length,
//         connections: connectionDetails.rows
//       },
//       timestamp: new Date().toISOString()
//     };
//   } catch (error) {
//     console.error('Connection stats error:', error);
//     throw error;
//   }
// };

// // Safe client release with tracking
// export const releaseClient = (client) => {
//   if (client) {
//     activeClients.delete(client);
//     client.release();
//     console.log('🔓 Client released - Active:', activeClients.size);
//   }
// };

// // Graceful shutdown handler
// process.on('SIGINT', async () => {
//   console.log('🛑 Received SIGINT, shutting down database pool gracefully...');
//   console.log('Active clients before shutdown:', activeClients.size);
//   await pool.end();
//   console.log('✅ Database pool closed');
//   process.exit(0);
// });

// process.on('SIGTERM', async () => {
//   console.log('🛑 Received SIGTERM, shutting down database pool gracefully...');
//   console.log('Active clients before shutdown:', activeClients.size);
//   await pool.end();
//   console.log('✅ Database pool closed');
//   process.exit(0);
// });

// export default pool;

import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

dotenv.config();

// Environment detection
const isProduction = process.env.NODE_ENV === 'production';
const isRailway = process.env.RAILWAY || process.env.RAILWAY_STATIC_URL || isProduction;

// Database pool configuration
const poolConfig = {
  connectionString: process.env.DATABASE_URL,
  
  // SSL configuration
  ssl: isRailway ? { 
    rejectUnauthorized: false,
    require: true
  } : false,
  
  // Connection pool settings
  max: 5,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 15000,
  maxUses: 1000,
  allowExitOnIdle: false,
};

const pool = new Pool(poolConfig);

// Track active connections
const activeClients = new Set();

// Event listeners
pool.on('connect', (client) => {
  console.log('✅ New database client connected');
});

pool.on('acquire', (client) => {
  activeClients.add(client);
});

pool.on('remove', (client) => {
  activeClients.delete(client);
});

pool.on('error', (err, client) => {
  console.error('💥 Database pool error:', err.message);
});

// Enhanced query function
export const query = async (text, params) => {
  const start = Date.now();
  
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    
    // Log slow queries
    if (duration > 1000) {
      console.warn(`🐌 Slow query (${duration}ms):`, text.substring(0, 100) + '...');
    }
    
    return result;
  } catch (error) {
    console.error('💥 Query error:', {
      query: text.substring(0, 200),
      params: params ? JSON.stringify(params) : 'none',
      error: error.message,
      code: error.code
    });
    
    // Enhanced error handling for common issues
    if (error.code === '23505') { // Unique violation
      error.userMessage = 'Duplicate entry - this record already exists';
    } else if (error.code === '23503') { // Foreign key violation
      error.userMessage = 'Referenced record does not exist';
    } else if (error.code === '23502') { // Not null violation
      error.userMessage = 'Required field is missing';
    }
    
    throw error;
  }
};

// Enhanced getClient function with retry logic
export const getClient = async () => {
  const maxRetries = 3;
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const client = await pool.connect();
      return client;
    } catch (error) {
      lastError = error;
      console.error(`⚠️ Database connection failed (attempt ${attempt}/${maxRetries}):`, error.message);
      
      if (attempt < maxRetries) {
        const delay = 2000 * attempt;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  console.error('💥 All database connection attempts failed');
  const finalError = new Error(`Database connection failed: ${lastError?.message}`);
  finalError.originalError = lastError;
  throw finalError;
};

// Health check function
export const healthCheck = async () => {
  let client;
  try {
    client = await getClient();
    await client.query('SELECT 1');
    client.release();
    
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: 'connected'
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      database: 'disconnected',
      error: error.message
    };
  }
};

// Safe client release
export const releaseClient = (client) => {
  if (client) {
    activeClients.delete(client);
    client.release();
  }
};

// Simple query function for direct pool usage
export const simpleQuery = (text, params) => {
  return pool.query(text, params);
};

// Transaction helper function
export const withTransaction = async (callback) => {
  const client = await getClient();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

// Graceful shutdown handlers
process.on('SIGINT', async () => {
  console.log('🛑 Shutting down database pool...');
  await pool.end();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('🛑 Shutting down database pool...');
  await pool.end();
  process.exit(0);
});

export default pool;