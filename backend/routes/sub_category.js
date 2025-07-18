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

// Get all sub categories
router.get('/', async (req, res) => {
  try {
    const subCategories = await sql`SELECT * FROM sub_category ORDER BY id DESC`;
    res.json(subCategories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create sub category
router.post('/', auth, requireAdminOrLimitedAdmin, async (req, res) => {
  const { name } = req.body;
  try {
    const [subCategory] = await sql`INSERT INTO sub_category (name) VALUES (${name}) RETURNING *`;
    res.status(201).json(subCategory);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update sub category
router.put('/:id', auth, requireAdminOrLimitedAdmin, async (req, res) => {
  const { name } = req.body;
  try {
    const [subCategory] = await sql`UPDATE sub_category SET name=${name}, updated_at=NOW() WHERE id=${req.params.id} RETURNING *`;
    if (!subCategory) return res.status(404).json({ error: 'Not found' });
    res.json(subCategory);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete sub category
router.delete('/:id', auth, requireAdminOrLimitedAdmin, async (req, res) => {
  try {
    const [subCategory] = await sql`DELETE FROM sub_category WHERE id=${req.params.id} RETURNING *`;
    if (!subCategory) return res.status(404).json({ error: 'Not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router; 