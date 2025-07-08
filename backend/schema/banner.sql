CREATE TABLE IF NOT EXISTS banner (
    id SERIAL PRIMARY KEY,
    title VARCHAR(150),
    image_url TEXT NOT NULL,
    link TEXT,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
); 