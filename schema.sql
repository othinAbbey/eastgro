-- schema.sql
CREATE TABLE farmers (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  farm_location VARCHAR(255) NOT NULL,
  contact VARCHAR(255)
);

CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(255),
  price DECIMAL(10, 2)
);
