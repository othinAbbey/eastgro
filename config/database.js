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
const isRailway = process.env.RAILWAY || isProduction;

// Enhanced pool configuration for Render
// config/database.js - Replace your current poolConfig

const poolConfig = {
  connectionString: process.env.DATABASE_URL,
  
  // Enhanced SSL configuration for Railway
  ssl: isRailway ? { 
    rejectUnauthorized: false,
    require: true
  } : false,
  
  // Connection pool settings optimized for Railway
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
  maxUses: 5000,
  allowExitOnIdle: false,
};

const pool = new Pool(poolConfig);

//test connection on startup
// Test connection on startup
async function testConnection() {
  let client;
  try {
    client = await pool.connect();
    const result = await client.query('SELECT version()');
    console.log('✅ Database connected successfully:', result.rows[0].version);
    
    // Test SSL
    const sslResult = await client.query('SELECT ssl FROM pg_stat_ssl WHERE pid = pg_backend_pid()');
    console.log('🔐 SSL Connection:', sslResult.rows[0] ? 'Enabled' : 'Disabled');
    
  } catch (error) {
    console.error('❌ Database connection failed:', {
      code: error.code,
      message: error.message,
      stack: error.stack
    });
    
    // Specific SSL error handling
    if (error.code === '28000' || error.message.includes('SSL')) {
      console.error('🔐 SSL Issue Detected - Trying alternative configuration...');
    }
  } finally {
    if (client) client.release();
  }
}

// Call this on startup
testConnection();

// Track active connections for debugging
const activeClients = new Set();

// Enhanced event listeners
pool.on('connect', (client) => {
  console.log('✅ New database client connected - Total:', pool.totalCount, 'Idle:', pool.idleCount);
});

pool.on('acquire', (client) => {
  activeClients.add(client);
  console.log('🔗 Database client acquired - Active:', activeClients.size, 'Total:', pool.totalCount, 'Idle:', pool.idleCount);
});

pool.on('remove', (client) => {
  activeClients.delete(client);
  console.log('❌ Database client removed - Active:', activeClients.size, 'Total:', pool.totalCount, 'Idle:', pool.idleCount);
});

pool.on('error', (err, client) => {
  console.error('💥 Unexpected error on idle database client:', err);
  
  // Don't crash the app on production, just log the error
  if (!isProduction) {
    process.exit(-1);
  }
});

// Periodic pool status monitoring
setInterval(() => {
  console.log('📊 Pool Status:', {
    total: pool.totalCount,
    idle: pool.idleCount,
    waiting: pool.waitingCount,
    active: activeClients.size,
    timestamp: new Date().toISOString()
  });
}, 30000); // Log every 30 seconds

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
      
      console.log(`✅ Database client acquired successfully (attempt ${attempt}) - Active: ${activeClients.size}`);
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

// Enhanced health check with connection details
export const healthCheck = async () => {
  let client;
  try {
    client = await getClient();
    await client.query('SELECT 1');
    
    // Get database connection count
    const dbConnections = await client.query(`
      SELECT count(*) as active_connections 
      FROM pg_stat_activity 
      WHERE datname = current_database()
    `);
    
    client.release();
    
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: 'connected',
      poolStats: {
        total: pool.totalCount,
        idle: pool.idleCount,
        waiting: pool.waitingCount,
        active: activeClients.size
      },
      databaseConnections: parseInt(dbConnections.rows[0].active_connections)
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      database: 'disconnected',
      error: error.message,
      poolStats: {
        total: pool.totalCount,
        idle: pool.idleCount,
        waiting: pool.waitingCount,
        active: activeClients.size
      }
    };
  }
};

// Connection monitoring endpoint
export const getConnectionStats = async () => {
  let client;
  try {
    client = await pool.connect();
    
    // Get detailed connection info from database
    const connectionDetails = await client.query(`
      SELECT 
        datname as database,
        usename as username,
        application_name,
        client_addr as client_address,
        state,
        query_start,
        now() - query_start as query_duration,
        LEFT(query, 100) as current_query
      FROM pg_stat_activity 
      WHERE datname = current_database()
      ORDER BY query_start DESC
    `);
    
    client.release();
    
    return {
      pool: {
        total: pool.totalCount,
        idle: pool.idleCount,
        waiting: pool.waitingCount,
        active: activeClients.size
      },
      database: {
        totalConnections: connectionDetails.rows.length,
        connections: connectionDetails.rows
      },
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Connection stats error:', error);
    throw error;
  }
};

// Safe client release with tracking
export const releaseClient = (client) => {
  if (client) {
    activeClients.delete(client);
    client.release();
    console.log('🔓 Client released - Active:', activeClients.size);
  }
};

// Graceful shutdown handler
process.on('SIGINT', async () => {
  console.log('🛑 Received SIGINT, shutting down database pool gracefully...');
  console.log('Active clients before shutdown:', activeClients.size);
  await pool.end();
  console.log('✅ Database pool closed');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('🛑 Received SIGTERM, shutting down database pool gracefully...');
  console.log('Active clients before shutdown:', activeClients.size);
  await pool.end();
  console.log('✅ Database pool closed');
  process.exit(0);
});

export default pool;