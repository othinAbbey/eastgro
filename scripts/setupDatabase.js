
import { getClient } from '../config/database.js';


  

const setupDatabase = async () => {
  const client = await getClient();
  
  try {
    console.log('🚀 Starting Agriculture Management System database setup...');
    await client.query('BEGIN');

    // Enable UUID extension
    await client.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
    console.log('✅ UUID extension enabled');

    // =============================================
    // CORE USER MANAGEMENT TABLES
    // =============================================

    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        contact VARCHAR(255) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        user_role VARCHAR(50) NOT NULL DEFAULT 'FARMER',
        location VARCHAR(255),
        district VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Users table created');

    await client.query(`
      CREATE TABLE IF NOT EXISTS customers (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        password VARCHAR(255) NOT NULL,
        contact VARCHAR(255) UNIQUE NOT NULL,
        purchase_history TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Customers table created');

    // =============================================
    // FARMER & GROUP MANAGEMENT
    // =============================================

    await client.query(`
      CREATE TABLE IF NOT EXISTS groups (
        id SERIAL PRIMARY KEY,
        crop_type VARCHAR(255) NOT NULL,
        region VARCHAR(255) NOT NULL,
        total_quantity INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Groups table created');

    await client.query(`
      CREATE TABLE IF NOT EXISTS farmers (
        id SERIAL PRIMARY KEY,
        user_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        contact VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        farm_details TEXT,
        location VARCHAR(255),
        region VARCHAR(100),
        district VARCHAR(100),
        group_id INTEGER REFERENCES groups(id) ON DELETE SET NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Farmers table created');

    // =============================================
    // CROP MANAGEMENT SYSTEM
    // =============================================

    await client.query(`
      CREATE TABLE IF NOT EXISTS crops (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) UNIQUE NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Crops table created');

    await client.query(`
      CREATE TABLE IF NOT EXISTS crop_varieties (
        id SERIAL PRIMARY KEY,
        crop_id INTEGER NOT NULL REFERENCES crops(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        days_to_maturity INTEGER,
        yield_potential VARCHAR(100),
        kg_per_acre INTEGER,
        yield_per_acre VARCHAR(100),
        market_price_per_kg DECIMAL(10,2),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Crop varieties table created');

    await client.query(`
      CREATE TABLE IF NOT EXISTS agronomy (
        id SERIAL PRIMARY KEY,
        crop_id INTEGER NOT NULL REFERENCES crops(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Agronomy table created');

    await client.query(`
      CREATE TABLE IF NOT EXISTS crop_inputs (
        id SERIAL PRIMARY KEY,
        crop_id INTEGER NOT NULL REFERENCES crops(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        type VARCHAR(100) NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Crop inputs table created');

    await client.query(`
      CREATE TABLE IF NOT EXISTS pests (
        id SERIAL PRIMARY KEY,
        crop_id INTEGER NOT NULL REFERENCES crops(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        control TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Pests table created');

    await client.query(`
      CREATE TABLE IF NOT EXISTS diseases (
        id SERIAL PRIMARY KEY,
        crop_id INTEGER NOT NULL REFERENCES crops(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        treatment TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Diseases table created');

    // =============================================
    // FARM PLANNING & MANAGEMENT
    // =============================================

    await client.query(`
      CREATE TABLE IF NOT EXISTS farm_plans (
        id SERIAL PRIMARY KEY,
        farmer_id INTEGER NOT NULL REFERENCES farmers(id) ON DELETE CASCADE,
        variety_id INTEGER NOT NULL REFERENCES crop_varieties(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        planting_date DATE NOT NULL,
        garden_size DECIMAL(10,2) NOT NULL,
        soil_type VARCHAR(100),
        rainfall VARCHAR(100),
        fertilizer_type VARCHAR(100),
        estimated_yield DECIMAL(10,2),
        estimated_revenue DECIMAL(10,2),
        estimated_profit DECIMAL(10,2),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Farm plans table created');

    await client.query(`
      CREATE TABLE IF NOT EXISTS farm_plan_costs (
        id SERIAL PRIMARY KEY,
        farm_plan_id INTEGER NOT NULL REFERENCES farm_plans(id) ON DELETE CASCADE,
        type VARCHAR(50) NOT NULL,
        stage VARCHAR(100) NOT NULL,
        description TEXT,
        amount DECIMAL(10,2) NOT NULL,
        is_custom BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Farm plan costs table created');

    await client.query(`
      CREATE TABLE IF NOT EXISTS cost_templates (
        id SERIAL PRIMARY KEY,
        crop_id INTEGER NOT NULL REFERENCES crops(id) ON DELETE CASCADE,
        type VARCHAR(50) NOT NULL,
        stage VARCHAR(100) NOT NULL,
        description TEXT,
        amount DECIMAL(10,2) NOT NULL,
        is_required BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Cost templates table created');

    // =============================================
    // PRODUCE & INVENTORY MANAGEMENT
    // =============================================

    await client.query(`
      CREATE TABLE IF NOT EXISTS produce (
        id SERIAL PRIMARY KEY,
        farmer_id INTEGER REFERENCES farmers(id) ON DELETE SET NULL,
        type VARCHAR(255) NOT NULL,
        quantity INTEGER NOT NULL,
        harvest_date DATE NOT NULL,
        quality_report VARCHAR(50),
        is_biofortified BOOLEAN DEFAULT FALSE,
        status VARCHAR(50) DEFAULT 'HARVESTED',
        price INTEGER DEFAULT 0,
        unit VARCHAR(50) DEFAULT 'kgs',
        region VARCHAR(100) DEFAULT 'Eastern',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Produce table created');

    await client.query(`
      CREATE TABLE IF NOT EXISTS farm_inputs (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        type VARCHAR(100) NOT NULL,
        quantity INTEGER NOT NULL,
        unit VARCHAR(50) NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Farm inputs table created');

    // =============================================
    // STORAGE & FACILITY MANAGEMENT
    // =============================================

    await client.query(`
      CREATE TABLE IF NOT EXISTS facilities (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        location VARCHAR(255),
        processing_details TEXT,
        workload DECIMAL(10,2) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Facilities table created');

    // =============================================
    // PRODUCTS & MARKETPLACE
    // =============================================

    await client.query(`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        units VARCHAR(50) NOT NULL,
        quantity INTEGER NOT NULL,
        farmer_id INTEGER REFERENCES farmers(id) ON DELETE SET NULL,
        facility_id INTEGER REFERENCES facilities(id) ON DELETE SET NULL,
        transporter_id INTEGER REFERENCES transporters(id) ON DELETE SET NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Products table created');

    // =============================================
    // TRANSACTIONS & ORDERS
    // =============================================

    await client.query(`
      CREATE TABLE IF NOT EXISTS transactions (
        id SERIAL PRIMARY KEY,
        buyer_id INTEGER NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
        total_amount DECIMAL(10,2) NOT NULL,
        status VARCHAR(50) DEFAULT 'PENDING',
        payment_method VARCHAR(50) DEFAULT 'CASH',
        service_provider_id INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Transactions table created');

    // =============================================
    // INVESTMENT MANAGEMENT
    // =============================================

    await client.query(`
      CREATE TABLE IF NOT EXISTS investments (
        id SERIAL PRIMARY KEY,
        investor_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        initial_amount DECIMAL(12,2) NOT NULL,
        current_balance DECIMAL(12,2) NOT NULL,
        monthly_return_rate DECIMAL(5,2) NOT NULL DEFAULT 7.1,
        total_earned DECIMAL(12,2) DEFAULT 0,
        status VARCHAR(50) DEFAULT 'ACTIVE',
        start_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        end_date TIMESTAMP,
        next_payout_date DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Investments table created');

    await client.query(`
      CREATE TABLE IF NOT EXISTS investment_inventory (
        id SERIAL PRIMARY KEY,
        investment_id INTEGER NOT NULL REFERENCES investments(id) ON DELETE CASCADE,
        product_type VARCHAR(100) DEFAULT 'Rice',
        total_purchased INTEGER NOT NULL,
        sold INTEGER DEFAULT 0,
        remaining INTEGER NOT NULL,
        average_buy_price DECIMAL(10,2) NOT NULL,
        current_market_price DECIMAL(10,2) NOT NULL,
        current_value DECIMAL(12,2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Investment inventory table created');

    // =============================================
    // ADD CONSTRAINTS AND INDEXES
    // =============================================

    // Add constraints
    await client.query(`
      ALTER TABLE users ADD CONSTRAINT valid_user_role 
      CHECK (user_role IN ('ADMIN', 'FARMER', 'CUSTOMER', 'SOLETRADER', 'PASSIVETRADER', 'GUEST', 'EXPERT'));
    `);

    await client.query(`
      ALTER TABLE produce ADD CONSTRAINT valid_produce_status 
      CHECK (status IN ('HARVESTED', 'IN_TRANSIT', 'PROCESSED', 'DELIVERED'));
    `);

    await client.query(`
      ALTER TABLE investments ADD CONSTRAINT valid_investment_status 
      CHECK (status IN ('ACTIVE', 'COMPLETED', 'CANCELLED', 'PENDING'));
    `);

    console.log('✅ Table constraints added');

    // Create essential indexes
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)',
      'CREATE INDEX IF NOT EXISTS idx_users_contact ON users(contact)',
      'CREATE INDEX IF NOT EXISTS idx_users_user_role ON users(user_role)',
      'CREATE INDEX IF NOT EXISTS idx_farmers_contact ON farmers(contact)',
      'CREATE INDEX IF NOT EXISTS idx_farmers_location ON farmers(location)',
      'CREATE INDEX IF NOT EXISTS idx_produce_farmer_id ON produce(farmer_id)',
      'CREATE INDEX IF NOT EXISTS idx_produce_status ON produce(status)',
      'CREATE INDEX IF NOT EXISTS idx_investments_investor_id ON investments(investor_id)',
      'CREATE INDEX IF NOT EXISTS idx_investments_status ON investments(status)',
      'CREATE INDEX IF NOT EXISTS idx_transactions_buyer_id ON transactions(buyer_id)'
    ];

    for (const indexQuery of indexes) {
      await client.query(indexQuery);
    }
    console.log('✅ Database indexes created');

    // =============================================
    // INSERT SAMPLE DATA
    // =============================================

    await insertSampleData(client);

    await client.query('COMMIT');
    console.log('🎉 Agriculture Management System database setup completed successfully!');
    console.log('📊 Total tables created: 20+ essential tables for your agro-business');

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Database setup failed:', error);
    throw error;
  } finally {
    client.release();
  }
};

const insertSampleData = async (client) => {
  try {
    // Insert sample crops
    await client.query(`
      INSERT INTO crops (name, description) VALUES 
      ('Maize', 'A staple cereal grain grown in many regions'),
      ('Rice', 'Primary staple food for a large part of the world'),
      ('Beans', 'Protein-rich legumes commonly grown with maize'),
      ('Cassava', 'Drought-resistant root crop'),
      ('Coffee', 'Cash crop for export markets')
      ON CONFLICT (name) DO NOTHING;
    `);
    console.log('🌱 Sample crops inserted');

    // Insert admin user (password: admin123)
    const bcrypt = await import('bcrypt');
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    await client.query(`
      INSERT INTO users (name, contact, email, password, user_role, location, district) VALUES 
      ('System Administrator', '+254700000001', 'admin@eastagro.com', $1, 'ADMIN', 'Nairobi', 'Central')
      ON CONFLICT (email) DO NOTHING;
    `, [hashedPassword]);
    console.log('👤 Admin user created');

    // Insert sample farmer
    const farmerPassword = await bcrypt.hash('farmer123', 10);
    await client.query(`
      INSERT INTO users (name, contact, email, password, user_role, location, district) VALUES 
      ('John Farmer', '+254711000001', 'farmer@eastagro.com', $1, 'FARMER', 'Eastern Province', 'Meru')
      ON CONFLICT (email) DO NOTHING;
    `, [farmerPassword]);

    // Get the farmer user ID and create farmer record
    const farmerUser = await client.query('SELECT id FROM users WHERE email = $1', ['farmer@eastagro.com']);
    if (farmerUser.rows.length > 0) {
      await client.query(`
        INSERT INTO farmers (user_id, name, contact, password, farm_details, location, region, district) VALUES 
        ($1, 'John Farmer', '+254711000001', $2, '5-acre mixed farm with maize and beans', 'Meru', 'Eastern', 'Meru')
        ON CONFLICT (contact) DO NOTHING;
      `, [farmerUser.rows[0].id, farmerPassword]);
      console.log('👨‍🌾 Sample farmer created');
    }

    // Insert sample investment
    const adminUser = await client.query('SELECT id FROM users WHERE email = $1', ['admin@eastagro.com']);
    if (adminUser.rows.length > 0) {
      await client.query(`
        INSERT INTO investments (investor_id, initial_amount, current_balance, monthly_return_rate, total_earned) VALUES 
        ($1, 50000.00, 53550.00, 7.1, 3550.00)
        ON CONFLICT DO NOTHING;
      `, [adminUser.rows[0].id]);
      console.log('💰 Sample investment created');
    }

  } catch (error) {
    console.log('Note: Sample data may already exist or was partially inserted');
  }
};

// Run setup if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  setupDatabase().catch(console.error);
}

export { setupDatabase, getClient };