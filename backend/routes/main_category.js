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

// Get all main categories
router.get('/', async (req, res) => {
  try {
    const mainCategories = await sql`SELECT * FROM main_category ORDER BY id DESC`;
    res.json(mainCategories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get main category by ID or slug
router.get('/:identifier', async (req, res) => {
  try {
    const identifier = req.params.identifier;
    let mainCategory;
    
    if (isNumericId(identifier)) {
      // It's an ID
      [mainCategory] = await sql`SELECT * FROM main_category WHERE id = ${identifier}`;
    } else {
      // It's a slug
      [mainCategory] = await sql`SELECT * FROM main_category WHERE slug = ${identifier}`;
    }
    
    if (!mainCategory) return res.status(404).json({ error: 'Main category not found' });
    res.json(mainCategory);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create main category
router.post('/', auth, requireAdminOrLimitedAdmin, async (req, res) => {
  const { name, slug } = req.body;
  try {
    const finalSlug = slug || generateSlug(name);
    const [mainCategory] = await sql`INSERT INTO main_category (name, slug) VALUES (${name}, ${finalSlug}) RETURNING *`;
    res.status(201).json(mainCategory);
  } catch (err) {
    if (err.message.includes('duplicate key value violates unique constraint') && err.message.includes('slug')) {
      res.status(400).json({ error: 'A main category with this slug already exists. Please choose a different name or provide a custom slug.' });
    } else {
      res.status(500).json({ error: err.message });
    }
  }
});

// Update main category by ID or slug
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
    
    const [mainCategory] = await sql`UPDATE main_category SET name=${name}, slug=${finalSlug}, updated_at=NOW() WHERE ${whereClause} RETURNING *`;
    if (!mainCategory) return res.status(404).json({ error: 'Main category not found' });
    res.json(mainCategory);
  } catch (err) {
    if (err.message.includes('duplicate key value violates unique constraint') && err.message.includes('slug')) {
      res.status(400).json({ error: 'A main category with this slug already exists. Please choose a different slug.' });
    } else {
      res.status(500).json({ error: err.message });
    }
  }
});

// Delete main category by ID or slug
router.delete('/:identifier', auth, requireAdminOrLimitedAdmin, async (req, res) => {
  try {
    const identifier = req.params.identifier;
    let whereClause;
    
    if (isNumericId(identifier)) {
      whereClause = sql`id = ${identifier}`;
    } else {
      whereClause = sql`slug = ${identifier}`;
    }
    
    const [mainCategory] = await sql`DELETE FROM main_category WHERE ${whereClause} RETURNING *`;
    if (!mainCategory) return res.status(404).json({ error: 'Main category not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router; 