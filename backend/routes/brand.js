const express = require('express');
const router = express.Router();
const sql = require('../config/supabase');
const cloudinary = require('../config/cloudinary');
const auth = require('./auth');
const { generateSlug, isNumericId } = require('../utils/slugUtils');

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

// Get top brands only
router.get('/top', async (req, res) => {
  try {
    const topBrands = await sql`SELECT * FROM brand WHERE is_top_brand = true ORDER BY id DESC`;
    res.json(topBrands);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get brand by ID or slug
router.get('/:identifier', async (req, res) => {
  try {
    const identifier = req.params.identifier;
    let brand;
    
    if (isNumericId(identifier)) {
      // It's an ID
      [brand] = await sql`SELECT * FROM brand WHERE id = ${identifier}`;
    } else {
      // It's a slug
      [brand] = await sql`SELECT * FROM brand WHERE slug = ${identifier}`;
    }
    
    if (!brand) return res.status(404).json({ error: 'Brand not found' });
    res.json(brand);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create brand
router.post('/', auth, requireAdminOrLimitedAdmin, async (req, res) => {
  const { name, slug, logo_url, banner_url, is_top_brand = false } = req.body;
  try {
    const finalSlug = slug || generateSlug(name);
    const [brand] = await sql`
      INSERT INTO brand (name, slug, logo_url, banner_url, is_top_brand)
      VALUES (${name}, ${finalSlug}, ${logo_url}, ${banner_url}, ${is_top_brand})
      RETURNING *`;
    res.status(201).json(brand);
  } catch (err) {
    console.error(err);
    if (err.message.includes('duplicate key value violates unique constraint') && err.message.includes('slug')) {
      res.status(400).json({ error: 'A brand with this slug already exists. Please choose a different name or provide a custom slug.' });
    } else {
      res.status(500).json({ error: err.message });
    }
  }
});

// Update brand by ID or slug
router.put('/:identifier', auth, requireAdminOrLimitedAdmin, async (req, res) => {
  const { name, slug, logo_url, banner_url, is_top_brand = false } = req.body;
  try {
    const identifier = req.params.identifier;
    const finalSlug = slug || generateSlug(name);
    let whereClause;
    
    if (isNumericId(identifier)) {
      whereClause = sql`id = ${identifier}`;
    } else {
      whereClause = sql`slug = ${identifier}`;
    }
    
    const [brand] = await sql`
      UPDATE brand SET name=${name}, slug=${finalSlug}, logo_url=${logo_url}, banner_url=${banner_url}, is_top_brand=${is_top_brand}, updated_at=NOW()
      WHERE ${whereClause} RETURNING *`;
    if (!brand) return res.status(404).json({ error: 'Brand not found' });
    res.json(brand);
  } catch (err) {
    if (err.message.includes('duplicate key value violates unique constraint') && err.message.includes('slug')) {
      res.status(400).json({ error: 'A brand with this slug already exists. Please choose a different slug.' });
    } else {
      res.status(500).json({ error: err.message });
    }
  }
});

// TODO: Add role-based access control middleware. Allow 'admin' and 'limited_admin' to add/edit brands.

// Helper to extract public_id from Cloudinary URL
function extractCloudinaryPublicId(url) {
  if (!url) return null;
  const matches = url.match(/\/upload\/(?:v[0-9]+\/)?(.+)\.[a-zA-Z]+$/);
  return matches ? matches[1] : null;
}

// Delete brand by ID or slug
router.delete('/:identifier', auth, requireAdminOrLimitedAdmin, async (req, res) => {
  console.log('DELETE /api/brand/:identifier called with identifier:', req.params.identifier);
  try {
    const identifier = req.params.identifier;
    let brand;
    
    // Get brand first to access logo_url and banner_url
    if (isNumericId(identifier)) {
      [brand] = await sql`SELECT * FROM brand WHERE id=${identifier}`;
    } else {
      [brand] = await sql`SELECT * FROM brand WHERE slug=${identifier}`;
    }
    
    console.log('Fetched brand:', brand);
    if (!brand) return res.status(404).json({ error: 'Brand not found' });
    
    // Delete logo image from Cloudinary if present
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
    // Delete banner image from Cloudinary if present
    if (brand.banner_url) {
      const publicId = extractCloudinaryPublicId(brand.banner_url);
      console.log('Deleting brand banner:', brand.banner_url, 'Extracted publicId:', publicId);
      if (publicId) {
        try {
          await cloudinary.uploader.destroy(publicId);
        } catch (cloudErr) {
          console.error('Cloudinary delete error (banner):', cloudErr);
        }
      }
    }
    
    // Delete brand from DB using the same identifier logic
    let whereClause;
    if (isNumericId(identifier)) {
      whereClause = sql`id = ${identifier}`;
    } else {
      whereClause = sql`slug = ${identifier}`;
    }
    
    const [deleted] = await sql`DELETE FROM brand WHERE ${whereClause} RETURNING *`;
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router; 