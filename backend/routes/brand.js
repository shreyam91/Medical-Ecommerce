const express = require('express');
const router = express.Router();
const sql = require('../config/supabase');
const cloudinary = require('../config/cloudinary');

// Get all brands
router.get('/', async (req, res) => {
  try {
    const brands = await sql`SELECT * FROM brand ORDER BY id DESC`;
    res.json(brands);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get brand by ID
router.get('/:id', async (req, res) => {
  try {
    const [brand] = await sql`SELECT * FROM brand WHERE id = ${req.params.id}`;
    if (!brand) return res.status(404).json({ error: 'Not found' });
    res.json(brand);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create brand
router.post('/', async (req, res) => {
  const { name, image_url } = req.body;
  try {
    const [brand] = await sql`
      INSERT INTO brand (name, image_url)
      VALUES (${name}, ${image_url})
      RETURNING *`;
    res.status(201).json(brand);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Update brand
router.put('/:id', async (req, res) => {
  const { name, image_url } = req.body;
  try {
    const [brand] = await sql`
      UPDATE brand SET name=${name}, image_url=${image_url}
      WHERE id=${req.params.id} RETURNING *`;
    if (!brand) return res.status(404).json({ error: 'Not found' });
    res.json(brand);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Helper to extract public_id from Cloudinary URL
function extractCloudinaryPublicId(url) {
  // Example: https://res.cloudinary.com/demo/image/upload/v1234567890/folder/filename.jpg
  // public_id is everything after '/upload/v1234567890/' and before the file extension
  if (!url) return null;
  // Remove version segment if present
  const matches = url.match(/\/upload\/(?:v[0-9]+\/)?(.+)\.[a-zA-Z]+$/);
  return matches ? matches[1] : null;
}

// Delete brand
router.delete('/:id', async (req, res) => {
  console.log('DELETE /api/brand/:id called with id:', req.params.id);
  try {
    // Get brand first to access image_url
    const [brand] = await sql`SELECT * FROM brand WHERE id=${req.params.id}`;
    console.log('Fetched brand:', brand);
    if (!brand) return res.status(404).json({ error: 'Not found' });
    // Delete image from Cloudinary if present
    if (brand.image_url) {
      const publicId = extractCloudinaryPublicId(brand.image_url);
      console.log('Deleting brand image:', brand.image_url, 'Extracted publicId:', publicId);
      if (publicId) {
        try {
          await cloudinary.uploader.destroy(publicId);
        } catch (cloudErr) {
          console.error('Cloudinary delete error:', cloudErr);
        }
      }
    }
    // Delete brand from DB
    const [deleted] = await sql`DELETE FROM brand WHERE id=${req.params.id} RETURNING *`;
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router; 