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

// Get all diseases
router.get('/', async (req, res) => {
  try {
    const diseases = await sql`SELECT * FROM disease ORDER BY id DESC`;
    res.json(diseases);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create disease
router.post('/', auth, requireAdminOrLimitedAdmin, async (req, res) => {
  const { name } = req.body;
  try {
    const [disease] = await sql`INSERT INTO disease (name) VALUES (${name}) RETURNING *`;
    res.status(201).json(disease);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update disease
router.put('/:id', auth, requireAdminOrLimitedAdmin, async (req, res) => {
  const { name } = req.body;
  try {
    const [disease] = await sql`UPDATE disease SET name=${name}, updated_at=NOW() WHERE id=${req.params.id} RETURNING *`;
    if (!disease) return res.status(404).json({ error: 'Not found' });
    res.json(disease);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete disease
router.delete('/:id', auth, requireAdminOrLimitedAdmin, async (req, res) => {
  try {
    const [disease] = await sql`DELETE FROM disease WHERE id=${req.params.id} RETURNING *`;
    if (!disease) return res.status(404).json({ error: 'Not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router; 