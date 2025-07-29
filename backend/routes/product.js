const express = require('express');
const router = express.Router();
const sql = require('../config/supabase');
const cloudinary = require('../config/cloudinary');
const auth = require('./auth');

function requireAdminOrLimitedAdmin(req, res, next) {
  if (!req.user || !['admin', 'limited_admin'].includes(req.user.role)) {
    return res.status(403).json({ error: 'Forbidden: insufficient permissions' });
  }
  next();
}

function extractCloudinaryPublicId(url) {
  if (!url) return null;
  const matches = url.match(/\/upload\/(?:v[0-9]+\/)?(.+)\.[a-zA-Z]+$/);
  return matches ? matches[1] : null;
}

function safe(val) {
  return typeof val === 'undefined' ? null : val;
}

// Get all products, optionally filter by brandId, category, and special flags
router.get('/', async (req, res) => {
  try {
    const { brandId, category, seasonal_medicine, frequently_bought, top_products, people_preferred } = req.query;
    
    // Build the query using sql template literals for proper SQL injection protection
    let query = sql`SELECT * FROM product WHERE 1=1`;
    
    if (brandId) {
      query = sql`${query} AND brand_id = ${brandId}`;
    }
    if (category) {
      query = sql`${query} AND category = ${category}`;
    }
    if (seasonal_medicine !== undefined) {
      query = sql`${query} AND seasonal_medicine = ${seasonal_medicine === 'true'}`;
    }
    if (frequently_bought !== undefined) {
      query = sql`${query} AND frequently_bought = ${frequently_bought === 'true'}`;
    }
    if (top_products !== undefined) {
      query = sql`${query} AND top_products = ${top_products === 'true'}`;
    }
    if (people_preferred !== undefined) {
      query = sql`${query} AND people_preferred = ${people_preferred === 'true'}`;
    }
    
    query = sql`${query} ORDER BY id DESC`;
    
    const products = await query;
    res.json(products);
  } catch (err) {
    console.error('Product query error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get product by ID
router.get('/:id', async (req, res) => {
  try {
    const [product] = await sql`SELECT * FROM product WHERE id = ${req.params.id}`;
    if (!product) return res.status(404).json({ error: 'Not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create product
router.post('/', auth, requireAdminOrLimitedAdmin, async (req, res) => {
  console.log('POST /api/product payload:', req.body);
  const {
    name,
    category,
    medicine_type,
    images,
    brand_id,
    reference_books,
    key,
    key_ingredients,
    description,
    strength,
    prescription_required,
    actual_price,
    selling_price,
    discount_percent,
    total_quantity,
    seasonal_medicine,
    frequently_bought,
    top_products,
    people_preferred,
    dosage,
    dietary
  } = req.body;
  
  try {
    // Start with basic columns that definitely exist
    const [product] = await sql`
      INSERT INTO product (
        name, category, medicine_type, images, brand_id, reference_books, key, key_ingredients, description, strength, prescription_required, actual_price, selling_price, discount_percent, total_quantity, seasonal_medicine, frequently_bought, top_products, people_preferred, dosage, dietary
      )
      VALUES (
        ${safe(name)}, ${safe(category)}, ${safe(medicine_type)}, ${safe(images)}, ${safe(brand_id)}, ${safe(reference_books)}, ${safe(key)}, ${safe(key_ingredients)}, ${safe(description)}, ${safe(strength)}, ${safe(prescription_required)}, ${safe(actual_price)}, ${safe(selling_price)}, ${safe(discount_percent)}, ${safe(total_quantity)}, ${safe(seasonal_medicine)}, ${safe(frequently_bought)}, ${safe(top_products)}, ${safe(people_preferred)}, ${safe(dosage)}, ${safe(dietary)}
      )
      RETURNING *`;
    res.status(201).json(product);
  } catch (err) {
    console.error('Error creating product:', err);
    console.error('SQL Error details:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Update product
router.put('/:id', auth, requireAdminOrLimitedAdmin, async (req, res) => {
  console.log('PUT /api/product payload:', req.body);
  const {
    name,
    category,
    medicine_type,
    images,
    brand_id,
    reference_books,
    key,
    key_ingredients,
    description,
    strength,
    prescription_required,
    actual_price,
    selling_price,
    discount_percent,
    total_quantity,
    seasonal_medicine,
    frequently_bought,
    top_products,
    people_preferred,
    dosage,
    dietary
  } = req.body;
  try {
    const [product] = await sql`
      UPDATE product SET
        name=${safe(name)},
        category=${safe(category)},
        medicine_type=${safe(medicine_type)},
        images=${safe(images)},
        brand_id=${safe(brand_id)},
        reference_books=${safe(reference_books)},
        key=${safe(key)},
        key_ingredients=${safe(key_ingredients)},
        description=${safe(description)},
        strength=${safe(strength)},

        prescription_required=${safe(prescription_required)},
        actual_price=${safe(actual_price)},
        selling_price=${safe(selling_price)},
        discount_percent=${safe(discount_percent)},
        total_quantity=${safe(total_quantity)},
        seasonal_medicine=${safe(seasonal_medicine)},
        frequently_bought=${safe(frequently_bought)},
        top_products=${safe(top_products)},
        people_preferred=${safe(people_preferred)},
        dosage=${safe(dosage)},
        dietary=${safe(dietary)},
        updated_at=NOW()
      WHERE id=${req.params.id} RETURNING *`;
    if (!product) return res.status(404).json({ error: 'Not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete product
router.delete('/:id', auth, requireAdminOrLimitedAdmin, async (req, res) => {
  try {
    // Get product first to access images
    const [product] = await sql`SELECT * FROM product WHERE id=${req.params.id}`;
    console.log('Fetched product:', product);
    if (!product) return res.status(404).json({ error: 'Not found' });
    // Delete images from Cloudinary if present
    if (product.images) {
      let imageUrls = product.images;
      if (typeof imageUrls === 'string') {
        // Try to parse as JSON array, fallback to comma-separated
        try {
          imageUrls = JSON.parse(imageUrls);
        } catch {
          imageUrls = imageUrls.split(',').map(s => s.trim());
        }
      }
      if (!Array.isArray(imageUrls)) imageUrls = [imageUrls];
      for (const url of imageUrls) {
        const publicId = extractCloudinaryPublicId(url);
        console.log('Deleting product image:', url, 'Extracted publicId:', publicId);
        if (publicId) {
          try {
            await cloudinary.uploader.destroy(publicId);
          } catch (cloudErr) {
            console.error('Cloudinary delete error:', cloudErr);
          }
        }
      }
    }
    // Delete product from DB
    const [deleted] = await sql`DELETE FROM product WHERE id=${req.params.id} RETURNING *`;
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// TODO: Add role-based access control middleware. Allow 'admin' and 'limited_admin' to add/edit products.

module.exports = router;