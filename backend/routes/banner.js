const express = require('express');
const router = express.Router();
const sql = require('../config/supabase');
const cloudinary = require('../config/cloudinary');
const auth = require('./auth');

function extractCloudinaryPublicId(url) {
  if (!url) return null;
  const matches = url.match(/\/upload\/(?:v[0-9]+\/)?(.+)\.[a-zA-Z]+$/);
  return matches ? matches[1] : null;
}

function requireAdminOrLimitedAdmin(req, res, next) {
  if (!req.user || !['admin', 'limited_admin'].includes(req.user.role)) {
    return res.status(403).json({ error: 'Forbidden: insufficient permissions' });
  }
  next();
}

// Get all banners
router.get('/', async (req, res) => {
  try {
    const banners = await sql`SELECT * FROM banner ORDER BY id DESC`;
    res.json(banners);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get banner by ID
router.get('/:id', async (req, res) => {
  try {
    const [banner] = await sql`SELECT * FROM banner WHERE id = ${req.params.id}`;
    if (!banner) return res.status(404).json({ error: 'Not found' });
    res.json(banner);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create banner
router.post('/', auth, requireAdminOrLimitedAdmin, async (req, res) => {
  const { image_url, type, title, link, product_id } = req.body;
  const status = req.body.status || 'active';
  try {
    const [banner] = await sql`
      INSERT INTO banner (image_url, type, title, link, status, product_id)
      VALUES (${image_url}, ${type}, ${title}, ${link}, ${status}, ${product_id})
      RETURNING *`;
    res.status(201).json(banner);
  } catch (err) {
    console.error('Error creating banner:', err);
    res.status(500).json({ error: err.message });
  }
});

// Update banner
router.put('/:id', auth, requireAdminOrLimitedAdmin, async (req, res) => {
  const { image_url, type, title, link, product_id } = req.body;
  const status = req.body.status || 'active';
  try {
    const [banner] = await sql`
      UPDATE banner SET image_url=${image_url}, type=${type}, title=${title}, link=${link}, status=${status}, product_id=${product_id}, updated_at=NOW()
      WHERE id=${req.params.id} RETURNING *`;
    if (!banner) return res.status(404).json({ error: 'Not found' });
    res.json(banner);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete banner
router.delete('/:id', auth, requireAdminOrLimitedAdmin, async (req, res) => {
  try {
    // Get banner first to access image_url
    const [banner] = await sql`SELECT * FROM banner WHERE id=${req.params.id}`;
    console.log('Fetched banner:', banner);
    if (!banner) return res.status(404).json({ error: 'Not found' });
    // Delete image from Cloudinary if present
    if (banner.image_url) {
      const publicId = extractCloudinaryPublicId(banner.image_url);
      console.log('Deleting banner image:', banner.image_url, 'Extracted publicId:', publicId);
      if (publicId) {
        try {
          await cloudinary.uploader.destroy(publicId);
        } catch (cloudErr) {
          console.error('Cloudinary delete error:', cloudErr);
        }
      }
    }
    // Delete banner from DB
    const [deleted] = await sql`DELETE FROM banner WHERE id=${req.params.id} RETURNING *`;
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// TODO: Add role-based access control middleware. Allow 'admin' and 'limited_admin' to add/edit banners.

module.exports = router; 