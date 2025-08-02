-- Fresh installation script with UUID order IDs
-- Use this for new databases

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if they exist (for fresh install)
DROP TABLE IF EXISTS order_item CASCADE;
DROP TABLE IF EXISTS payment CASCADE;
DROP TABLE IF EXISTS "order" CASCADE;

-- Create order table with UUID primary key
CREATE TABLE "order" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id INTEGER REFERENCES customer(id) ON DELETE SET NULL,
    order_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status VARCHAR(50) DEFAULT 'Ordered',
    total_amount NUMERIC(10,2),
    payment_id INTEGER REFERENCES payment(id) ON DELETE SET NULL,
    address TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create order_item table with UUID foreign key
CREATE TABLE order_item (
    id SERIAL PRIMARY KEY,
    order_id UUID NOT NULL REFERENCES "order"(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES product(id) ON DELETE SET NULL,
    quantity INTEGER NOT NULL,
    price NUMERIC(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create payment table with UUID foreign key
CREATE TABLE payment (
    id SERIAL PRIMARY KEY,
    order_id UUID REFERENCES "order"(id) ON DELETE CASCADE,
    amount NUMERIC(10,2) NOT NULL,
    status VARCHAR(50) DEFAULT 'Paid',
    method VARCHAR(50),
    payment_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_order_customer_id ON "order"(customer_id);
CREATE INDEX idx_order_date ON "order"(order_date);
CREATE INDEX idx_order_status ON "order"(status);
CREATE INDEX idx_order_item_order_id ON order_item(order_id);
CREATE INDEX idx_order_item_product_id ON order_item(product_id);
CREATE INDEX idx_payment_order_id ON payment(order_id);

-- Verify tables are created correctly
SELECT 
    table_name, 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name IN ('order', 'order_item', 'payment') 
    AND column_name LIKE '%id%'
ORDER BY table_name, ordinal_position;