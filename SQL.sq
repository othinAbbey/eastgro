-- Agriculture Management System Database Schema
-- Run this entire file in pgAdmin to create all tables

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- CORE USER MANAGEMENT TABLES
-- =============================================

-- Users table
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

-- Customers table
CREATE TABLE IF NOT EXISTS customers (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL,
  contact VARCHAR(255) UNIQUE NOT NULL,
  purchase_history TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- FARMER & GROUP MANAGEMENT
-- =============================================

-- Farmers table (extends users)
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
  group_id INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Groups table
CREATE TABLE IF NOT EXISTS groups (
  id SERIAL PRIMARY KEY,
  crop_type VARCHAR(255) NOT NULL,
  region VARCHAR(255) NOT NULL,
  total_quantity INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- CROP MANAGEMENT SYSTEM
-- =============================================

-- Main crops table
CREATE TABLE IF NOT EXISTS crops (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crop varieties table
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

-- Agronomy table
CREATE TABLE IF NOT EXISTS agronomy (
  id SERIAL PRIMARY KEY,
  crop_id INTEGER NOT NULL REFERENCES crops(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crop inputs table
CREATE TABLE IF NOT EXISTS crop_inputs (
  id SERIAL PRIMARY KEY,
  crop_id INTEGER NOT NULL REFERENCES crops(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(100) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Pests table
CREATE TABLE IF NOT EXISTS pests (
  id SERIAL PRIMARY KEY,
  crop_id INTEGER NOT NULL REFERENCES crops(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  control TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Diseases table
CREATE TABLE IF NOT EXISTS diseases (
  id SERIAL PRIMARY KEY,
  crop_id INTEGER NOT NULL REFERENCES crops(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  treatment TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- FARM PLANNING & MANAGEMENT
-- =============================================

-- Farm plans table
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

-- Farm plan costs table
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

-- Cost templates table
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

-- Farm activities table
CREATE TABLE IF NOT EXISTS farm_activities (
  id SERIAL PRIMARY KEY,
  farm_plan_id INTEGER NOT NULL REFERENCES farm_plans(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  scheduled_date DATE,
  photo_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Farm records table
CREATE TABLE IF NOT EXISTS farm_records (
  id SERIAL PRIMARY KEY,
  farm_plan_id INTEGER NOT NULL REFERENCES farm_plans(id) ON DELETE CASCADE,
  type VARCHAR(100) NOT NULL,
  note TEXT,
  image VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- PRODUCE & INVENTORY MANAGEMENT
-- =============================================

-- Produce table
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

-- Farm inputs table
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

-- =============================================
-- STORAGE & FACILITY MANAGEMENT
-- =============================================

-- Facilities table
CREATE TABLE IF NOT EXISTS facilities (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  location VARCHAR(255),
  processing_details TEXT,
  workload DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Storage table
CREATE TABLE IF NOT EXISTS storage (
  id SERIAL PRIMARY KEY,
  facility_id INTEGER NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
  produce_id INTEGER NOT NULL UNIQUE REFERENCES produce(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL,
  stored_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Loads at facility table
CREATE TABLE IF NOT EXISTS load_at_facility (
  id SERIAL PRIMARY KEY,
  facility_id INTEGER NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
  produce_id INTEGER NOT NULL REFERENCES produce(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL,
  loaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- TRANSPORT & SHIPMENT MANAGEMENT
-- =============================================

-- Transporters table
CREATE TABLE IF NOT EXISTS transporters (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  contact VARCHAR(255),
  vehicle_details TEXT,
  status VARCHAR(50) DEFAULT 'AVAILABLE',
  region VARCHAR(100) DEFAULT 'Eastern',
  capacity DECIMAL(10,2) DEFAULT 0,
  current_load DECIMAL(10,2) DEFAULT 0,
  rating DECIMAL(3,2) DEFAULT 0.0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Shipments table
CREATE TABLE IF NOT EXISTS shipments (
  id SERIAL PRIMARY KEY,
  produce_id INTEGER NOT NULL REFERENCES produce(id) ON DELETE CASCADE,
  transporter_id INTEGER REFERENCES transporters(id) ON DELETE SET NULL,
  facility_id INTEGER REFERENCES facilities(id) ON DELETE SET NULL,
  storage_id INTEGER REFERENCES storage(id) ON DELETE SET NULL,
  destination VARCHAR(255),
  status VARCHAR(50) DEFAULT 'PENDING',
  delivery_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Shipment items table
CREATE TABLE IF NOT EXISTS shipment_items (
  id SERIAL PRIMARY KEY,
  shipment_id INTEGER NOT NULL REFERENCES shipments(id) ON DELETE CASCADE,
  produce_id INTEGER NOT NULL REFERENCES produce(id) ON DELETE CASCADE,
  quantity DECIMAL(10,2) NOT NULL,
  unit VARCHAR(50) DEFAULT 'kg',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- PRODUCTS & MARKETPLACE
-- =============================================

-- Products table
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

-- Market listings table
CREATE TABLE IF NOT EXISTS market_listings (
  id SERIAL PRIMARY KEY,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  seller_id VARCHAR(255) NOT NULL,
  seller_type VARCHAR(50) NOT NULL,
  price INTEGER NOT NULL,
  quantity INTEGER NOT NULL,
  location VARCHAR(255) NOT NULL,
  is_available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- TRANSACTIONS & ORDERS
-- =============================================

-- Transactions table
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

-- Transaction products junction table
CREATE TABLE IF NOT EXISTS transaction_products (
  id SERIAL PRIMARY KEY,
  transaction_id INTEGER NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Transaction produce junction table
CREATE TABLE IF NOT EXISTS transaction_produce (
  id SERIAL PRIMARY KEY,
  transaction_id INTEGER NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
  produce_id INTEGER NOT NULL REFERENCES produce(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Transaction inputs junction table
CREATE TABLE IF NOT EXISTS transaction_inputs (
  id SERIAL PRIMARY KEY,
  transaction_id INTEGER NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
  input_id INTEGER NOT NULL REFERENCES farm_inputs(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  farmer_id INTEGER REFERENCES farmers(id) ON DELETE CASCADE,
  store_id INTEGER,
  store_name VARCHAR(255) NOT NULL,
  produce VARCHAR(255) NOT NULL,
  quantity DECIMAL(10,2) NOT NULL,
  notes TEXT,
  status VARCHAR(50) DEFAULT 'PENDING',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Stores table
CREATE TABLE IF NOT EXISTS stores (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  location VARCHAR(255),
  produce VARCHAR(255) NOT NULL,
  max_quantity DECIMAL(10,2) NOT NULL,
  status VARCHAR(50) DEFAULT 'ACTIVE',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Offers table
CREATE TABLE IF NOT EXISTS offers (
  id SERIAL PRIMARY KEY,
  store_name VARCHAR(255) NOT NULL,
  offer TEXT NOT NULL,
  icon VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- SERVICES & PROVIDERS
-- =============================================

-- Service providers table
CREATE TABLE IF NOT EXISTS service_providers (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  contact VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  business_name VARCHAR(255) NOT NULL,
  description TEXT,
  location VARCHAR(255) DEFAULT 'Not specified',
  region VARCHAR(100) DEFAULT 'EASTERN',
  qualifications JSONB,
  equipment JSONB,
  min_order_amount DECIMAL(10,2),
  availability VARCHAR(255) DEFAULT 'Monday-Friday, 8AM-5PM',
  travel_radius INTEGER,
  rating DECIMAL(3,2) DEFAULT 0.0,
  role VARCHAR(50) DEFAULT 'SERVICE_PROVIDER',
  is_verified BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Services table
CREATE TABLE IF NOT EXISTS services (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  base_price DECIMAL(10,2) NOT NULL,
  category VARCHAR(255) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Service offerings table
CREATE TABLE IF NOT EXISTS service_offerings (
  id SERIAL PRIMARY KEY,
  service_id INTEGER NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  service_provider_id INTEGER NOT NULL REFERENCES service_providers(id) ON DELETE CASCADE,
  rate DECIMAL(10,2) NOT NULL,
  min_quantity DECIMAL(10,2),
  unit VARCHAR(50),
  notes TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(service_id, service_provider_id)
);

-- Transaction services junction table
CREATE TABLE IF NOT EXISTS transaction_services (
  id SERIAL PRIMARY KEY,
  transaction_id INTEGER NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
  service_id INTEGER NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  service_offering_id INTEGER NOT NULL REFERENCES service_offerings(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL,
  rate DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Service transactions table
CREATE TABLE IF NOT EXISTS service_transactions (
  id SERIAL PRIMARY KEY,
  service_provider_id INTEGER NOT NULL REFERENCES service_providers(id) ON DELETE CASCADE,
  customer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  service_id INTEGER NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  quantity DECIMAL(10,2) NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  status VARCHAR(50) DEFAULT 'PENDING',
  scheduled_date TIMESTAMP,
  completed_date TIMESTAMP,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- PROBLEM REPORTING & SUPPORT
-- =============================================

-- Reports table
CREATE TABLE IF NOT EXISTS reports (
  id SERIAL PRIMARY KEY,
  problem_type VARCHAR(255) NOT NULL,
  description TEXT,
  urgency VARCHAR(50) DEFAULT 'MEDIUM',
  farmer_id INTEGER NOT NULL REFERENCES farmers(id) ON DELETE CASCADE,
  status VARCHAR(50) DEFAULT 'PENDING',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Problems table
CREATE TABLE IF NOT EXISTS problems (
  id SERIAL PRIMARY KEY,
  farm_type VARCHAR(255),
  crop VARCHAR(255) NOT NULL,
  disease VARCHAR(255),
  pest VARCHAR(255) NOT NULL,
  farmer_id INTEGER NOT NULL REFERENCES farmers(id) ON DELETE CASCADE,
  report_id INTEGER REFERENCES reports(id) ON DELETE SET NULL,
  status VARCHAR(50) DEFAULT 'PENDING',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Problem progress table
CREATE TABLE IF NOT EXISTS problem_progress (
  id SERIAL PRIMARY KEY,
  problem_id INTEGER NOT NULL REFERENCES problems(id) ON DELETE CASCADE,
  update_text TEXT NOT NULL,
  updated_by VARCHAR(255) NOT NULL,
  status VARCHAR(50) DEFAULT 'REPORTED',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- WEATHER & SUBSCRIPTIONS
-- =============================================

-- Weather subscriptions table
CREATE TABLE IF NOT EXISTS weather_subscriptions (
  id SERIAL PRIMARY KEY,
  farmer_id INTEGER NOT NULL REFERENCES farmers(id) ON DELETE CASCADE,
  phone VARCHAR(20) NOT NULL,
  location VARCHAR(255) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Weather history table
CREATE TABLE IF NOT EXISTS weather_history (
  id SERIAL PRIMARY KEY,
  farmer_id INTEGER REFERENCES farmers(id) ON DELETE SET NULL,
  location VARCHAR(255) NOT NULL,
  temperature DECIMAL(5,2),
  humidity INTEGER,
  wind_speed DECIMAL(5,2),
  conditions VARCHAR(100),
  description TEXT,
  icon VARCHAR(255),
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- TRACEABILITY & QR CODES
-- =============================================

-- Traceability log table
CREATE TABLE IF NOT EXISTS traceability_log (
  id SERIAL PRIMARY KEY,
  action_type VARCHAR(50) NOT NULL,
  product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
  produce_id INTEGER REFERENCES produce(id) ON DELETE CASCADE,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- QR codes table
CREATE TABLE IF NOT EXISTS qr_codes (
  id SERIAL PRIMARY KEY,
  produce_id INTEGER NOT NULL UNIQUE REFERENCES produce(id) ON DELETE CASCADE,
  qr_code_data TEXT NOT NULL,
  qr_code_image TEXT,
  trace_url VARCHAR(500) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  scanned_count INTEGER DEFAULT 0,
  last_scanned_at TIMESTAMP
);

-- QR code scan history table
CREATE TABLE IF NOT EXISTS qr_code_scans (
  id SERIAL PRIMARY KEY,
  qr_code_id INTEGER NOT NULL REFERENCES qr_codes(id) ON DELETE CASCADE,
  scanned_by VARCHAR(255),
  scan_location VARCHAR(255),
  user_agent TEXT,
  ip_address VARCHAR(45),
  scanned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Produce trace history table
CREATE TABLE IF NOT EXISTS produce_trace_history (
  id SERIAL PRIMARY KEY,
  produce_id INTEGER NOT NULL REFERENCES produce(id) ON DELETE CASCADE,
  action VARCHAR(50) NOT NULL,
  location VARCHAR(255),
  performed_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  notes TEXT,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- INVESTMENT MANAGEMENT
-- =============================================

-- Investments table
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

-- Investment inventory table
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

-- Investment transactions table
CREATE TABLE IF NOT EXISTS investment_transactions (
  id SERIAL PRIMARY KEY,
  investment_id INTEGER NOT NULL REFERENCES investments(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  description TEXT,
  status VARCHAR(50) DEFAULT 'completed',
  date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Payouts table
CREATE TABLE IF NOT EXISTS payouts (
  id SERIAL PRIMARY KEY,
  investment_id INTEGER NOT NULL REFERENCES investments(id) ON DELETE CASCADE,
  amount DECIMAL(12,2) NOT NULL,
  scheduled_date DATE NOT NULL,
  paid_date DATE,
  status VARCHAR(50) DEFAULT 'PENDING',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Investment sales table
CREATE TABLE IF NOT EXISTS investment_sales (
  id SERIAL PRIMARY KEY,
  inventory_id INTEGER NOT NULL REFERENCES investment_inventory(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL,
  price_per_unit DECIMAL(10,2) NOT NULL,
  total_amount DECIMAL(12,2) NOT NULL,
  buyer VARCHAR(255) NOT NULL,
  date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- SMS & COMMUNICATION
-- =============================================

-- SMS broadcasts table
CREATE TABLE IF NOT EXISTS sms_broadcasts (
  id SERIAL PRIMARY KEY,
  region VARCHAR(100),
  district VARCHAR(100),
  message TEXT NOT NULL,
  phone_numbers JSONB,
  status VARCHAR(50) DEFAULT 'SENT',
  sent_count INTEGER DEFAULT 0,
  failed_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- SMS logs table
CREATE TABLE IF NOT EXISTS sms_logs (
  id SERIAL PRIMARY KEY,
  broadcast_id INTEGER REFERENCES sms_broadcasts(id) ON DELETE SET NULL,
  phone_number VARCHAR(20) NOT NULL,
  message TEXT NOT NULL,
  status VARCHAR(50),
  provider_response JSONB,
  sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

-- Users indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_contact ON users(contact);
CREATE INDEX IF NOT EXISTS idx_users_user_role ON users(user_role);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);

-- Farmers indexes
CREATE INDEX IF NOT EXISTS idx_farmers_contact ON farmers(contact);
CREATE INDEX IF NOT EXISTS idx_farmers_location ON farmers(location);
CREATE INDEX IF NOT EXISTS idx_farmers_region ON farmers(region);
CREATE INDEX IF NOT EXISTS idx_farmers_group_id ON farmers(group_id);

-- Groups indexes
CREATE INDEX IF NOT EXISTS idx_groups_crop_type ON groups(crop_type);
CREATE INDEX IF NOT EXISTS idx_groups_region ON groups(region);

-- Crop indexes
CREATE INDEX IF NOT EXISTS idx_crop_varieties_crop_id ON crop_varieties(crop_id);
CREATE INDEX IF NOT EXISTS idx_agronomy_crop_id ON agronomy(crop_id);
CREATE INDEX IF NOT EXISTS idx_crop_inputs_crop_id ON crop_inputs(crop_id);
CREATE INDEX IF NOT EXISTS idx_pests_crop_id ON pests(crop_id);
CREATE INDEX IF NOT EXISTS idx_diseases_crop_id ON diseases(crop_id);

-- Farm plan indexes
CREATE INDEX IF NOT EXISTS idx_farm_plans_farmer_id ON farm_plans(farmer_id);
CREATE INDEX IF NOT EXISTS idx_farm_plans_variety_id ON farm_plans(variety_id);
CREATE INDEX IF NOT EXISTS idx_farm_plan_costs_farm_plan_id ON farm_plan_costs(farm_plan_id);
CREATE INDEX IF NOT EXISTS idx_cost_templates_crop_id ON cost_templates(crop_id);
CREATE INDEX IF NOT EXISTS idx_farm_activities_farm_plan_id ON farm_activities(farm_plan_id);
CREATE INDEX IF NOT EXISTS idx_farm_activities_scheduled_date ON farm_activities(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_farm_records_farm_plan_id ON farm_records(farm_plan_id);
CREATE INDEX IF NOT EXISTS idx_farm_records_type ON farm_records(type);

-- Produce indexes
CREATE INDEX IF NOT EXISTS idx_produce_farmer_id ON produce(farmer_id);
CREATE INDEX IF NOT EXISTS idx_produce_type ON produce(type);
CREATE INDEX IF NOT EXISTS idx_produce_status ON produce(status);
CREATE INDEX IF NOT EXISTS idx_produce_harvest_date ON produce(harvest_date);

-- Shipment indexes
CREATE INDEX IF NOT EXISTS idx_shipments_produce_id ON shipments(produce_id);
CREATE INDEX IF NOT EXISTS idx_shipments_status ON shipments(status);
CREATE INDEX IF NOT EXISTS idx_shipment_items_shipment_id ON shipment_items(shipment_id);

-- Transaction indexes
CREATE INDEX IF NOT EXISTS idx_transactions_buyer_id ON transactions(buyer_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_orders_farmer_id ON orders(farmer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);

-- Investment indexes
CREATE INDEX IF NOT EXISTS idx_investments_investor_id ON investments(investor_id);
CREATE INDEX IF NOT EXISTS idx_investments_status ON investments(status);
CREATE INDEX IF NOT EXISTS idx_investment_inventory_investment_id ON investment_inventory(investment_id);
CREATE INDEX IF NOT EXISTS idx_investment_transactions_investment_id ON investment_transactions(investment_id);
CREATE INDEX IF NOT EXISTS idx_payouts_investment_id ON payouts(investment_id);
CREATE INDEX IF NOT EXISTS idx_payouts_status ON payouts(status);
CREATE INDEX IF NOT EXISTS idx_investment_sales_inventory_id ON investment_sales(inventory_id);

-- Service indexes
CREATE INDEX IF NOT EXISTS idx_service_providers_email ON service_providers(email);
CREATE INDEX IF NOT EXISTS idx_service_providers_contact ON service_providers(contact);
CREATE INDEX IF NOT EXISTS idx_service_offerings_service_id ON service_offerings(service_id);
CREATE INDEX IF NOT EXISTS idx_service_offerings_provider_id ON service_offerings(service_provider_id);

-- Problem indexes
CREATE INDEX IF NOT EXISTS idx_problems_farmer_id ON problems(farmer_id);
CREATE INDEX IF NOT EXISTS idx_problems_status ON problems(status);
CREATE INDEX IF NOT EXISTS idx_problem_progress_problem_id ON problem_progress(problem_id);

-- Weather indexes
CREATE INDEX IF NOT EXISTS idx_weather_subscriptions_farmer_id ON weather_subscriptions(farmer_id);
CREATE INDEX IF NOT EXISTS idx_weather_history_location ON weather_history(location);
CREATE INDEX IF NOT EXISTS idx_weather_history_timestamp ON weather_history(timestamp);

-- SMS indexes
CREATE INDEX IF NOT EXISTS idx_sms_broadcasts_region ON sms_broadcasts(region);
CREATE INDEX IF NOT EXISTS idx_sms_broadcasts_created_at ON sms_broadcasts(created_at);
CREATE INDEX IF NOT EXISTS idx_sms_logs_broadcast_id ON sms_logs(broadcast_id);
CREATE INDEX IF NOT EXISTS idx_sms_logs_phone_number ON sms_logs(phone_number);

-- =============================================
-- FOREIGN KEY CONSTRAINTS
-- =============================================

-- Add foreign key constraint for farmers group_id
ALTER TABLE farmers ADD CONSTRAINT fk_farmers_group 
FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE SET NULL;

-- Add foreign key constraint for transactions service_provider_id
ALTER TABLE transactions ADD CONSTRAINT fk_transactions_service_provider 
FOREIGN KEY (service_provider_id) REFERENCES service_providers(id) ON DELETE SET NULL;

-- Add constraint for valid user roles
ALTER TABLE users ADD CONSTRAINT valid_user_role 
CHECK (user_role IN ('ADMIN', 'FARMER', 'CUSTOMER', 'SOLETRADER', 'PASSIVETRADER', 'GUEST', 'EXPERT'));

-- Add constraint for valid produce status
ALTER TABLE produce ADD CONSTRAINT valid_produce_status 
CHECK (status IN ('HARVESTED', 'IN_TRANSIT', 'PROCESSED', 'DELIVERED'));

-- Add constraint for valid shipment status
ALTER TABLE shipments ADD CONSTRAINT valid_shipment_status 
CHECK (status IN ('PENDING', 'IN_TRANSIT', 'DELIVERED', 'RETURNED'));

-- Add constraint for valid investment status
ALTER TABLE investments ADD CONSTRAINT valid_investment_status 
CHECK (status IN ('ACTIVE', 'COMPLETED', 'CANCELLED', 'PENDING'));

-- Add constraint for valid payout status
ALTER TABLE payouts ADD CONSTRAINT valid_payout_status 
CHECK (status IN ('PENDING', 'PAID', 'FAILED', 'PROCESSING'));

-- =============================================
-- INITIAL DATA (Optional)
-- =============================================

-- Insert sample crop data
INSERT INTO crops (name, description) VALUES 
('Maize', 'A staple cereal grain grown in many regions'),
('Rice', 'Primary staple food for a large part of the world'),
('Beans', 'Protein-rich legumes commonly grown with maize'),
('Cassava', 'Drought-resistant root crop'),
('Coffee', 'Cash crop for export markets')
ON CONFLICT (name) DO NOTHING;

-- Insert sample services
INSERT INTO services (name, description, base_price, category) VALUES 
('Land Preparation', 'Plowing, harrowing and soil preparation services', 5000.00, 'Farming'),
('Planting Services', 'Professional planting and seeding services', 3000.00, 'Farming'),
('Harvesting', 'Mechanized harvesting services', 8000.00, 'Farming'),
('Pest Control', 'Integrated pest management services', 4500.00, 'Protection'),
('Soil Testing', 'Comprehensive soil analysis and recommendations', 2500.00, 'Analysis')
ON CONFLICT DO NOTHING;

-- Insert admin user (password: admin123)
INSERT INTO users (name, contact, email, password, user_role, location, district) VALUES 
('System Administrator', '1234567890', 'admin@agriculture.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'ADMIN', 'Headquarters', 'Central')
ON CONFLICT (email) DO NOTHING;

COMMIT;

-- Print completion message
DO $$ BEGIN
    RAISE NOTICE 'Agriculture Management System database schema created successfully!';
    RAISE NOTICE 'Total tables created: 45+ tables with proper indexes and constraints';
    RAISE NOTICE 'Sample data inserted for crops, services, and admin user';
END $$;