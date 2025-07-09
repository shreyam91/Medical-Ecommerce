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

// Get all products, optionally filter by brandId
router.get('/', async (req, res) => {
  try {
    const { brandId } = req.query;
    let products;
    if (brandId) {
      products = await sql`SELECT * FROM product WHERE brand_id = ${brandId} ORDER BY id DESC`;
    } else {
      products = await sql`SELECT * FROM product ORDER BY id DESC`;
    }
    res.json(products);
  } catch (err) {
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
    key_benefits,
    how_to_use,
    safety_precaution,
    description,
    other_info,
    strength,
    gst,
    prescription_required,
    actual_price,
    selling_price,
    discount_percent,
    total_quantity
  } = req.body;
  try {
    const [product] = await sql`
      INSERT INTO product (
        name, category, medicine_type, images, brand_id, reference_books, key, key_ingredients, key_benefits, how_to_use, safety_precaution, description, other_info, strength, gst, prescription_required, actual_price, selling_price, discount_percent, total_quantity
      )
      VALUES (
        ${safe(name)}, ${safe(category)}, ${safe(medicine_type)}, ${safe(images)}, ${safe(brand_id)}, ${safe(reference_books)}, ${safe(key)}, ${safe(key_ingredients)}, ${safe(key_benefits)}, ${safe(how_to_use)}, ${safe(safety_precaution)}, ${safe(description)}, ${safe(other_info)}, ${safe(strength)}, ${safe(gst)}, ${safe(prescription_required)}, ${safe(actual_price)}, ${safe(selling_price)}, ${safe(discount_percent)}, ${safe(total_quantity)}
      )
      RETURNING *`;
    res.status(201).json(product);
  } catch (err) {
    console.error('Error creating product:', err);
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
    key_benefits,
    how_to_use,
    safety_precaution,
    description,
    other_info,
    strength,
    gst,
    prescription_required,
    actual_price,
    selling_price,
    discount_percent,
    total_quantity
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
        key_benefits=${safe(key_benefits)},
        how_to_use=${safe(how_to_use)},
        safety_precaution=${safe(safety_precaution)},
        description=${safe(description)},
        other_info=${safe(other_info)},
        strength=${safe(strength)},
        gst=${safe(gst)},
        prescription_required=${safe(prescription_required)},
        actual_price=${safe(actual_price)},
        selling_price=${safe(selling_price)},
        discount_percent=${safe(discount_percent)},
        total_quantity=${safe(total_quantity)},
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