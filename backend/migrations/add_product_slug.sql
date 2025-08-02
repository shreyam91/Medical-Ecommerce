-- Add slug column to product table
ALTER TABLE product ADD COLUMN IF NOT EXISTS slug VARCHAR(200) UNIQUE;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_product_slug ON product(slug);

-- Function to generate slug from product name
CREATE OR REPLACE FUNCTION generate_product_slug(input_text TEXT) 
RETURNS TEXT AS $$
BEGIN
    RETURN LOWER(
        REGEXP_REPLACE(
            REGEXP_REPLACE(
                REGEXP_REPLACE(TRIM(input_text), '\s+', '-', 'g'),
                '[^a-zA-Z0-9\-]', '', 'g'
            ),
            '\-+', '-', 'g'
        )
    );
END;
$$ LANGUAGE plpgsql;

-- Update existing products with slugs (only if slug is null)
UPDATE product 
SET slug = generate_product_slug(name) 
WHERE slug IS NULL;

-- Create trigger to auto-generate slug on insert/update
CREATE OR REPLACE FUNCTION auto_generate_product_slug()
RETURNS TRIGGER AS $$
BEGIN
    -- Only generate slug if it's not provided or if name changed
    IF NEW.slug IS NULL OR (TG_OP = 'UPDATE' AND OLD.name != NEW.name AND NEW.slug = OLD.slug) THEN
        NEW.slug := generate_product_slug(NEW.name);
        
        -- Handle duplicates by appending a number
        DECLARE
            base_slug TEXT := NEW.slug;
            counter INTEGER := 1;
        BEGIN
            WHILE EXISTS (SELECT 1 FROM product WHERE slug = NEW.slug AND id != COALESCE(NEW.id, 0)) LOOP
                NEW.slug := base_slug || '-' || counter;
                counter := counter + 1;
            END LOOP;
        END;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS trigger_auto_generate_product_slug ON product;
CREATE TRIGGER trigger_auto_generate_product_slug
    BEFORE INSERT OR UPDATE ON product
    FOR EACH ROW
    EXECUTE FUNCTION auto_generate_product_slug();

-- Show the results
SELECT id, name, slug FROM product ORDER BY id LIMIT 10;