// import pkg from 'pg';
// const { Pool } = pkg;
// import dotenv from 'dotenv';

// dotenv.config();

// // Determine environment
// const isProduction = process.env.NODE_ENV === 'production';
// const isRender = process.env.RENDER || process.env.NODE_ENV === 'production';

// // Enhanced pool configuration for Render
// const poolConfig = {
//   connectionString: process.env.DATABASE_URL,
  
//   // SSL configuration - critical for Render
//   ssl: isRender ? { 
//     rejectUnauthorized: false 
//   } : false,
  
//   // Connection pool settings optimized for Render
//   max: 15, // Increased for better concurrency
//   idleTimeoutMillis: 30000, // Reduced from 300000 to 30 seconds
//   connectionTimeoutMillis: 10000, // 10 second connection timeout
//   maxUses: 7500, // Close a client after 7500 queries
//   allowExitOnIdle: false, // Keep connections alive
// };

// // Create pool with error handling
// const pool = new Pool(poolConfig);

// // Enhanced event listeners
// pool.on('connect', (client) => {
//   console.log('✅ New database client connected');
// });

// pool.on('acquire', (client) => {
//   console.log('🔗 Database client acquired from pool');
// });

// pool.on('remove', (client) => {
//   console.log('❌ Database client removed from pool');
// });

// pool.on('error', (err, client) => {
//   console.error('💥 Unexpected error on idle database client:', err);
  
//   // Don't crash the app on production, just log the error
//   if (!isProduction) {
//     process.exit(-1);
//   }
// });

// // Test database connection on startup
// async function testConnection() {
//   let client;
//   try {
//     client = await pool.connect();
//     const result = await client.query('SELECT NOW() as current_time, version() as version');
//     console.log('🎯 Database connection test successful:');
//     console.log('   📅 Time:', result.rows[0].current_time);
//     console.log('   🗄️  Database:', process.env.DATABASE_URL?.split('/').pop() || 'Unknown');
    
//     // Test basic query
//     const userTableCheck = await client.query(`
//       SELECT EXISTS (
//         SELECT FROM information_schema.tables 
//         WHERE table_schema = 'public' 
//         AND table_name = 'users'
//       );
//     `);
    
//     console.log('   👥 Users table exists:', userTableCheck.rows[0].exists);
    
//   } catch (error) {
//     console.error('💥 Database connection test failed:', error.message);
    
//     // Provide helpful error messages
//     if (error.code === 'ECONNREFUSED') {
//       console.error('   🔌 Check if PostgreSQL is running and DATABASE_URL is correct');
//     } else if (error.code === '28P01') {
//       console.error('   🔑 Authentication failed - check database credentials');
//     } else if (error.message.includes('SSL')) {
//       console.error('   🔐 SSL connection issue - check SSL configuration');
//     }
    
//     // In production, we don't want to crash immediately
//     if (!isProduction) {
//       process.exit(1);
//     }
//   } finally {
//     if (client) {
//       client.release();
//     }
//   }
// }

// // Execute connection test on startup (non-blocking)
// setTimeout(() => {
//   testConnection();
// }, 1000);

// // Enhanced query function with error handling
// export const query = async (text, params) => {
//   const start = Date.now();
  
//   try {
//     const result = await pool.query(text, params);
//     const duration = Date.now() - start;
    
//     // Log slow queries in development
//     if (!isProduction && duration > 1000) {
//       console.warn(`🐌 Slow query (${duration}ms):`, text);
//     }
    
//     return result;
//   } catch (error) {
//     console.error('💥 Query error:', {
//       query: text,
//       params: params,
//       error: error.message,
//       code: error.code
//     });
    
//     // Re-throw with additional context
//     const enhancedError = new Error(`Database query failed: ${error.message}`);
//     enhancedError.originalError = error;
//     enhancedError.query = text;
//     throw enhancedError;
//   }
// };

// // Enhanced getClient function with timeout and retry
// export const getClient = async () => {
//   const maxRetries = 3;
//   let lastError;
  
//   for (let attempt = 1; attempt <= maxRetries; attempt++) {
//     try {
//       const client = await pool.connect();
      
//       // Test the connection
//       await client.query('SELECT 1');
      
//       console.log(`✅ Database client acquired successfully (attempt ${attempt})`);
//       return client;
      
//     } catch (error) {
//       lastError = error;
//       console.warn(`⚠️ Failed to get database client (attempt ${attempt}/${maxRetries}):`, error.message);
      
//       if (attempt < maxRetries) {
//         // Wait before retrying (exponential backoff)
//         await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
//       }
//     }
//   }
  
//   console.error('💥 All attempts to get database client failed');
//   throw lastError;
// };

// // Health check function
// export const healthCheck = async () => {
//   try {
//     const client = await getClient();
//     await client.query('SELECT 1');
//     client.release();
    
//     return {
//       status: 'healthy',
//       timestamp: new Date().toISOString(),
//       database: 'connected'
//     };
//   } catch (error) {
//     return {
//       status: 'unhealthy',
//       timestamp: new Date().toISOString(),
//       database: 'disconnected',
//       error: error.message
//     };
//   }
// };

// // Graceful shutdown handler
// process.on('SIGINT', async () => {
//   console.log('🛑 Received SIGINT, shutting down database pool gracefully...');
//   await pool.end();
//   console.log('✅ Database pool closed');
//   process.exit(0);
// });

// process.on('SIGTERM', async () => {
//   console.log('🛑 Received SIGTERM, shutting down database pool gracefully...');
//   await pool.end();
//   console.log('✅ Database pool closed');
//   process.exit(0);
// });

// export default pool;

import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

dotenv.config();

// Determine environment
const isProduction = process.env.NODE_ENV === 'production';
const isRender = process.env.RENDER || process.env.NODE_ENV === 'production';

// Enhanced pool configuration for Render
const poolConfig = {
  connectionString: process.env.DATABASE_URL,
  
  // SSL configuration - critical for Render
  ssl: isRender ? { 
    rejectUnauthorized: false 
  } : false,
  
  // Connection pool settings optimized for Render
  max: 15, // Increased for better concurrency
  idleTimeoutMillis: 30000, // Reduced from 300000 to 30 seconds
  connectionTimeoutMillis: 10000, // 10 second connection timeout
  maxUses: 7500, // Close a client after 7500 queries
  allowExitOnIdle: false, // Keep connections alive
};

// Create pool with error handling
const pool = new Pool(poolConfig);

// Enhanced event listeners
pool.on('connect', (client) => {
  console.log('✅ New database client connected');
});

pool.on('acquire', (client) => {
  console.log('🔗 Database client acquired from pool');
});

pool.on('remove', (client) => {
  console.log('❌ Database client removed from pool');
});

pool.on('error', (err, client) => {
  console.error('💥 Unexpected error on idle database client:', err);
  
  // Don't crash the app on production, just log the error
  if (!isProduction) {
    process.exit(-1);
  }
});

// Enhanced query function with error handling
export const query = async (text, params) => {
  const start = Date.now();
  
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    
    // Log slow queries in development
    if (!isProduction && duration > 1000) {
      console.warn(`🐌 Slow query (${duration}ms):`, text);
    }
    
    return result;
  } catch (error) {
    console.error('💥 Query error:', {
      query: text,
      params: params,
      error: error.message,
      code: error.code
    });
    
    // Re-throw with additional context
    const enhancedError = new Error(`Database query failed: ${error.message}`);
    enhancedError.originalError = error;
    enhancedError.query = text;
    throw enhancedError;
  }
};

// Enhanced getClient function with timeout and retry
export const getClient = async () => {
  const maxRetries = 3;
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const client = await pool.connect();
      
      // Test the connection
      await client.query('SELECT 1');
      
      console.log(`✅ Database client acquired successfully (attempt ${attempt})`);
      return client;
      
    } catch (error) {
      lastError = error;
      console.warn(`⚠️ Failed to get database client (attempt ${attempt}/${maxRetries}):`, error.message);
      
      if (attempt < maxRetries) {
        // Wait before retrying (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }
    }
  }
  
  console.error('💥 All attempts to get database client failed');
  throw lastError;
};

// Health check function
export const healthCheck = async () => {
  try {
    const client = await getClient();
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

// Graceful shutdown handler
process.on('SIGINT', async () => {
  console.log('🛑 Received SIGINT, shutting down database pool gracefully...');
  await pool.end();
  console.log('✅ Database pool closed');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('🛑 Received SIGTERM, shutting down database pool gracefully...');
  await pool.end();
  console.log('✅ Database pool closed');
  process.exit(0);
});

export default pool;