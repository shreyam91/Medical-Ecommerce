const sql = require('../config/supabase');
const { generateSlug } = require('../utils/slugUtils');

exports.runMigration = async (req, res) => {
  try {
    console.log('Starting migration...');
    
    // Step 1: Add relationship columns if they don't exist
    try {
      await sql`
        ALTER TABLE product 
        ADD COLUMN IF NOT EXISTS main_category_id INTEGER REFERENCES main_category(id),
        ADD COLUMN IF NOT EXISTS sub_category_id INTEGER REFERENCES sub_category(id)`;
      console.log('✅ Added relationship columns');
    } catch (e) {
      console.log('Relationship columns already exist or error:', e.message);
    }
    
    // Step 2: Create indexes
    try {
      await sql`CREATE INDEX IF NOT EXISTS idx_product_main_category ON product(main_category_id)`;
      await sql`CREATE INDEX IF NOT EXISTS idx_product_sub_category ON product(sub_category_id)`;
      await sql`CREATE INDEX IF NOT EXISTS idx_product_brand ON product(brand_id)`;
      
      await sql`CREATE INDEX IF NOT EXISTS idx_product_top_products ON product(top_products) WHERE top_products = true`;
      await sql`CREATE INDEX IF NOT EXISTS idx_product_people_preferred ON product(people_preferred) WHERE people_preferred = true`;
      await sql`CREATE INDEX IF NOT EXISTS idx_product_maximum_discount ON product(maximum_discount) WHERE maximum_discount = true`;
      await sql`CREATE INDEX IF NOT EXISTS idx_product_seasonal_medicine ON product(seasonal_medicine) WHERE seasonal_medicine = true`;
      await sql`CREATE INDEX IF NOT EXISTS idx_product_frequently_bought ON product(frequently_bought) WHERE frequently_bought = true`;
      
      console.log('✅ Created indexes');
    } catch (e) {
      console.log('Index creation error:', e.message);
    }
    
    // Step 3: Create product_disease junction table
    try {
      await sql`
        CREATE TABLE IF NOT EXISTS product_disease (
            id SERIAL PRIMARY KEY,
            product_id INTEGER NOT NULL REFERENCES product(id) ON DELETE CASCADE,
            disease_id INTEGER NOT NULL REFERENCES disease(id) ON DELETE CASCADE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            UNIQUE(product_id, disease_id)
        )`;
      
      await sql`CREATE INDEX IF NOT EXISTS idx_product_disease_product ON product_disease(product_id)`;
      await sql`CREATE INDEX IF NOT EXISTS idx_product_disease_disease ON product_disease(disease_id)`;
      
      console.log('✅ Created product_disease junction table');
    } catch (e) {
      console.log('Junction table creation error:', e.message);
    }
    
    // Step 4: Generate slugs for products that don't have them
    const productsWithoutSlugs = await sql`SELECT id, name FROM product WHERE slug IS NULL`;
    console.log(`Found ${productsWithoutSlugs.length} products without slugs`);
    
    for (const product of productsWithoutSlugs) {
      const slug = generateSlug(product.name);
      try {
        await sql`UPDATE product SET slug = ${slug} WHERE id = ${product.id}`;
        console.log(`✅ Generated slug for "${product.name}": ${slug}`);
      } catch (e) {
        // If slug already exists, add a number suffix
        const uniqueSlug = `${slug}-${product.id}`;
        await sql`UPDATE product SET slug = ${uniqueSlug} WHERE id = ${product.id}`;
        console.log(`✅ Generated unique slug for "${product.name}": ${uniqueSlug}`);
      }
    }
    
    // Step 5: Verify the migration
    const verification = await sql`
      SELECT 
        COUNT(*) as total_products,
        COUNT(slug) as products_with_slugs,
        COUNT(main_category_id) as products_with_main_category,
        COUNT(sub_category_id) as products_with_sub_category
      FROM product`;
    
    const tableExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'product_disease'
      )`;
    
    res.json({
      success: true,
      message: 'Migration completed successfully!',
      verification: verification[0],
      product_disease_table_exists: tableExists[0].exists
    });
    
  } catch (error) {
    console.error('Migration failed:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

exports.fixSlugs = async (req, res) => {
  try {
    const productsWithoutSlugs = await sql`SELECT id, name FROM product WHERE slug IS NULL OR slug = ''`;
    
    for (const product of productsWithoutSlugs) {
      const slug = generateSlug(product.name);
      try {
        await sql`UPDATE product SET slug = ${slug} WHERE id = ${product.id}`;
      } catch (e) {
        // If slug already exists, add a number suffix
        const uniqueSlug = `${slug}-${product.id}`;
        await sql`UPDATE product SET slug = ${uniqueSlug} WHERE id = ${product.id}`;
      }
    }
    
    res.json({
      success: true,
      message: `Fixed slugs for ${productsWithoutSlugs.length} products`
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

exports.testMaximumDiscount = async (req, res) => {
  try {
    // Set one product to have maximum_discount = true for testing
    await sql`UPDATE product SET maximum_discount = true WHERE id = 7`;
    
    // Test the filtering
    const maxDiscountProducts = await sql`SELECT id, name, maximum_discount FROM product WHERE maximum_discount = true`;
    const allProducts = await sql`SELECT id, name, maximum_discount FROM product`;
    
    res.json({
      success: true,
      message: 'Updated product 7 to have maximum_discount = true',
      max_discount_products: maxDiscountProducts,
      all_products_flags: allProducts.map(p => ({
        id: p.id,
        name: p.name,
        maximum_discount: p.maximum_discount
      }))
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

exports.setPeoplePreferred = async (req, res) => {
  try {
    // Set one product to have people_preferred = true for testing
    await sql`UPDATE product SET people_preferred = true WHERE id = 4`;
    
    res.json({
      success: true,
      message: 'Updated product 4 to have people_preferred = true'
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

exports.testGoogleSheets = async (req, res) => {
  try {
    const getSheetsClient = require('../config/googleSheets');
    const { appendCustomer, appendOrder, appendInventoryItem } = require('../utils/googleSheets');
    
    console.log('🧪 Testing Google Sheets integration...');
    
    // Test 1: Check if we can connect to Google Sheets
    const sheets = await getSheetsClient();
    console.log('✅ Google Sheets client connected');
    
    // Test 2: Check if we can access the spreadsheet
    const SPREADSHEET_ID = '131HPWm3xMiKbbBRAFBDhHQ35NPDhsik2VDeCd0vUC5A';
    const meta = await sheets.spreadsheets.get({ spreadsheetId: SPREADSHEET_ID });
    console.log('✅ Spreadsheet accessible:', meta.data.properties.title);
    console.log('📋 Available sheets:', meta.data.sheets.map(s => s.properties.title));
    
    // Test 3: Try to read existing data from Customers sheet
    try {
      const existingData = await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: 'Customers!A1:F10',
      });
      console.log('✅ Can read from Customers sheet');
      console.log('📊 Existing rows:', existingData.data.values?.length || 0);
    } catch (readError) {
      console.log('⚠️ Cannot read from Customers sheet:', readError.message);
    }
    
    // Test 4: Try to append a test customer with the new format
    const testCustomer = {
      id: 999,
      customer_id: 'TEST-20250806-TST99',
      name: 'Test Customer Updated Format',
      email: 'test.updated@example.com',
      mobile: '9999999999',
      address: '123 Main Street, Mumbai, Maharashtra - 400001, India',
      active: true,
      created_at: new Date()
    };
    
    console.log('🧪 Testing new format: customer_id, name, email, mobile, address1, address2, status, createdAt');
    await appendCustomer(testCustomer);
    
    // Test 3: Test Orders sheet
    const testOrder = {
      id: 'TEST_ORDER_' + Date.now(),
      customer_name: 'Test Customer',
      date: new Date().toISOString().split('T')[0],
      price: 100,
      status: 'Test',
      items: 'Test Product x1',
      address: 'Test Address',
      payment_method: 'Test Payment',
      notes: 'Test order from API',
      created_at: new Date().toISOString()
    };
    
    await appendOrder(testOrder);
    console.log('✅ Test order added to Google Sheets');

    // Test 4: Test Inventory sheet
    const testInventory = {
      name: 'Test Product ' + Date.now(),
      total_quantity: 100,
      status: 'In Stock',
      category: 'Test Category',
      brand: 'Test Brand',
      price: 50,
      created_at: new Date().toISOString()
    };
    
    await appendInventoryItem(testInventory);
    console.log('✅ Test inventory item added to Google Sheets');
    
    res.json({
      success: true,
      message: 'Google Sheets test successful! Check your spreadsheet for test data.',
      spreadsheetTitle: meta.data.properties.title,
      availableSheets: meta.data.sheets.map(s => s.properties.title),
      testData: {
        customer: testCustomer,
        order: testOrder,
        inventory: testInventory
      }
    });
  } catch (error) {
    console.error('Google Sheets test failed:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      details: error.stack
    });
  }
};