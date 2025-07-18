const express = require('express');
const router = express.Router();
const sql = require('../config/supabase');
const auth = require('./auth');

function requireAdminOrLimitedAdmin(req, res, next) {
  if (!req.user || !['admin', 'limited_admin'].includes(req.user.role)) {
    return res.status(403).json({ error: 'Forbidden: insufficient permissions' });
  }
  next();
}

// Get all main categories
router.get('/', async (req, res) => {
  try {
    const categories = await sql`SELECT * FROM main_category ORDER BY id DESC`;
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create main category
router.post('/', auth, requireAdminOrLimitedAdmin, async (req, res) => {
  const { name } = req.body;
  try {
    const [category] = await sql`INSERT INTO main_category (name) VALUES (${name}) RETURNING *`;
    res.status(201).json(category);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update main category
router.put('/:id', auth, requireAdminOrLimitedAdmin, async (req, res) => {
  const { name } = req.body;
  try {
    const [category] = await sql`UPDATE main_category SET name=${name}, updated_at=NOW() WHERE id=${req.params.id} RETURNING *`;
    if (!category) return res.status(404).json({ error: 'Not found' });
    res.json(category);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete main category
router.delete('/:id', auth, requireAdminOrLimitedAdmin, async (req, res) => {
  try {
    const [category] = await sql`DELETE FROM main_category WHERE id=${req.params.id} RETURNING *`;
    if (!category) return res.status(404).json({ error: 'Not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router; 