const express = require('express');
const router = express.Router();
const sql = require('../config/supabase');
const cloudinary = require('../config/cloudinary');

function extractCloudinaryPublicId(url) {
  if (!url) return null;
  const matches = url.match(/\/upload\/(?:v[0-9]+\/)?(.+)\.[a-zA-Z]+$/);
  return matches ? matches[1] : null;
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
router.post('/', async (req, res) => {
  console.log('POST /api/product payload:', req.body);
  const { name, category, medicine_type, images, brand_id, reference_books, dosage_information, cause, description, key_ingredients, uses_indications, actual_price, selling_price, discount_percent, gst, total_quantity, prescription_required } = req.body;
  try {
    const [product] = await sql`
      INSERT INTO product (name, category, medicine_type, images, brand_id, reference_books, dosage_information, cause, description, key_ingredients, uses_indications, actual_price, selling_price, discount_percent, gst, total_quantity, prescription_required)
      VALUES (${name}, ${category}, ${medicine_type}, ${images}, ${brand_id}, ${reference_books}, ${dosage_information}, ${cause}, ${description}, ${key_ingredients}, ${uses_indications}, ${actual_price}, ${selling_price}, ${discount_percent}, ${gst}, ${total_quantity}, ${prescription_required})
      RETURNING *`;
    res.status(201).json(product);
  } catch (err) {
    console.error('Error creating product:', err);
    res.status(500).json({ error: err.message });
  }
});

// Update product
router.put('/:id', async (req, res) => {
  console.log('PUT /api/product payload:', req.body);
  const { name, category, medicine_type, images, brand_id, reference_books, dosage_information, cause, description, key_ingredients, uses_indications, actual_price, selling_price, discount_percent, gst, total_quantity, prescription_required } = req.body;
  try {
    const [product] = await sql`
      UPDATE product SET name=${name}, category=${category}, medicine_type=${medicine_type}, images=${images}, brand_id=${brand_id}, reference_books=${reference_books}, dosage_information=${dosage_information}, cause=${cause}, description=${description}, key_ingredients=${key_ingredients}, uses_indications=${uses_indications}, actual_price=${actual_price}, selling_price=${selling_price}, discount_percent=${discount_percent}, gst=${gst}, total_quantity=${total_quantity}, prescription_required=${prescription_required}
      WHERE id=${req.params.id} RETURNING *`;
    if (!product) return res.status(404).json({ error: 'Not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete product
router.delete('/:id', async (req, res) => {
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

module.exports = router; 