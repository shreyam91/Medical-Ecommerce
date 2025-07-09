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
router.post('/', auth, requireAdminOrLimitedAdmin, async (req, res) => {
  const { name, logo_url } = req.body;
  try {
    const [brand] = await sql`
      INSERT INTO brand (name, logo_url)
      VALUES (${name}, ${logo_url})
      RETURNING *`;
    res.status(201).json(brand);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Update brand
router.put('/:id', auth, requireAdminOrLimitedAdmin, async (req, res) => {
  const { name, logo_url } = req.body;
  try {
    const [brand] = await sql`
      UPDATE brand SET name=${name}, logo_url=${logo_url}
      WHERE id=${req.params.id} RETURNING *`;
    if (!brand) return res.status(404).json({ error: 'Not found' });
    res.json(brand);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// TODO: Add role-based access control middleware. Allow 'admin' and 'limited_admin' to add/edit brands.

// Helper to extract public_id from Cloudinary URL
function extractCloudinaryPublicId(url) {
  if (!url) return null;
  const matches = url.match(/\/upload\/(?:v[0-9]+\/)?(.+)\.[a-zA-Z]+$/);
  return matches ? matches[1] : null;
}

// Delete brand
router.delete('/:id', auth, requireAdminOrLimitedAdmin, async (req, res) => {
  console.log('DELETE /api/brand/:id called with id:', req.params.id);
  try {
    // Get brand first to access logo_url
    const [brand] = await sql`SELECT * FROM brand WHERE id=${req.params.id}`;
    console.log('Fetched brand:', brand);
    if (!brand) return res.status(404).json({ error: 'Not found' });
    // Delete image from Cloudinary if present
    if (brand.logo_url) {
      const publicId = extractCloudinaryPublicId(brand.logo_url);
      console.log('Deleting brand image:', brand.logo_url, 'Extracted publicId:', publicId);
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