const express = require('express');
const router = express.Router();
const sql = require('../config/supabase');
const auth = require('./auth');
const { generateSlug, isNumericId } = require('../utils/slugUtils');

function requireAdminOrLimitedAdmin(req, res, next) {
  if (!req.user || !['admin', 'limited_admin'].includes(req.user.role)) {
    return res.status(403).json({ error: 'Forbidden: insufficient permissions' });
  }
  next();
}

// Get all sub categories
router.get('/', async (req, res) => {
  try {
    const subCategories = await sql`SELECT * FROM sub_category ORDER BY id DESC`;
    res.json(subCategories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get sub category by ID or slug
router.get('/:identifier', async (req, res) => {
  try {
    const identifier = req.params.identifier;
    let subCategory;
    
    if (isNumericId(identifier)) {
      // It's an ID
      [subCategory] = await sql`SELECT * FROM sub_category WHERE id = ${identifier}`;
    } else {
      // It's a slug
      [subCategory] = await sql`SELECT * FROM sub_category WHERE slug = ${identifier}`;
    }
    
    if (!subCategory) return res.status(404).json({ error: 'Sub category not found' });
    res.json(subCategory);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create sub category
router.post('/', auth, requireAdminOrLimitedAdmin, async (req, res) => {
  const { name, slug } = req.body;
  try {
    const finalSlug = slug || generateSlug(name);
    const [subCategory] = await sql`INSERT INTO sub_category (name, slug) VALUES (${name}, ${finalSlug}) RETURNING *`;
    res.status(201).json(subCategory);
  } catch (err) {
    if (err.message.includes('duplicate key value violates unique constraint') && err.message.includes('slug')) {
      res.status(400).json({ error: 'A sub category with this slug already exists. Please choose a different name or provide a custom slug.' });
    } else {
      res.status(500).json({ error: err.message });
    }
  }
});

// Update sub category by ID or slug
router.put('/:identifier', auth, requireAdminOrLimitedAdmin, async (req, res) => {
  const { name, slug } = req.body;
  try {
    const identifier = req.params.identifier;
    const finalSlug = slug || generateSlug(name);
    let whereClause;
    
    if (isNumericId(identifier)) {
      whereClause = sql`id = ${identifier}`;
    } else {
      whereClause = sql`slug = ${identifier}`;
    }
    
    const [subCategory] = await sql`UPDATE sub_category SET name=${name}, slug=${finalSlug}, updated_at=NOW() WHERE ${whereClause} RETURNING *`;
    if (!subCategory) return res.status(404).json({ error: 'Sub category not found' });
    res.json(subCategory);
  } catch (err) {
    if (err.message.includes('duplicate key value violates unique constraint') && err.message.includes('slug')) {
      res.status(400).json({ error: 'A sub category with this slug already exists. Please choose a different slug.' });
    } else {
      res.status(500).json({ error: err.message });
    }
  }
});

// Delete sub category by ID or slug
router.delete('/:identifier', auth, requireAdminOrLimitedAdmin, async (req, res) => {
  try {
    const identifier = req.params.identifier;
    let whereClause;
    
    if (isNumericId(identifier)) {
      whereClause = sql`id = ${identifier}`;
    } else {
      whereClause = sql`slug = ${identifier}`;
    }
    
    const [subCategory] = await sql`DELETE FROM sub_category WHERE ${whereClause} RETURNING *`;
    if (!subCategory) return res.status(404).json({ error: 'Sub category not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router; 