CREATE TABLE IF NOT EXISTS product (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    category_id INTEGER REFERENCES category(id) ON DELETE SET NULL,
    brand_id INTEGER REFERENCES brand(id) ON DELETE SET NULL,
    description TEXT,
    key_ingredients TEXT,
    how_to_use TEXT,
    safety_precaution TEXT,
    other_info TEXT,
    gst INTEGER,
    prescription_required BOOLEAN DEFAULT FALSE,
    strength VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
); 