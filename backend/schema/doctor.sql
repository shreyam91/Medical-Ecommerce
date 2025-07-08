CREATE TABLE IF NOT EXISTS doctor (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    specialization VARCHAR(100),
    phone_number VARCHAR(20),
    degree TEXT,
    image_url TEXT,
    city TEXT,
    state TEXT,
    pincode INTEGER,
    address TEXT,
    start_time TIME,
    end_time TIME,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
); 