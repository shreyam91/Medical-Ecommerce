const express = require('express');
const router = express.Router();
const sql = require('../config/supabase');
const auth = require('./auth');

function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden: admin only' });
  }
  next();
}

// Get all inventory items
router.get('/', auth, requireAdmin, async (req, res) => {
  try {
    const inventory = await sql`SELECT * FROM inventory ORDER BY id DESC`;
    res.json(inventory);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get inventory by ID
router.get('/:id', auth, requireAdmin, async (req, res) => {
  try {
    const [item] = await sql`SELECT * FROM inventory WHERE id = ${req.params.id}`;
    if (!item) return res.status(404).json({ error: 'Not found' });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create inventory item
router.post('/', auth, requireAdmin, async (req, res) => {
  const { product_id, quantity, status } = req.body;
  try {
    const [item] = await sql`INSERT INTO inventory (product_id, quantity, status) VALUES (${product_id}, ${quantity}, ${status}) RETURNING *`;
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update inventory item
router.put('/:id', auth, requireAdmin, async (req, res) => {
  const { product_id, quantity, status } = req.body;
  try {
    const [item] = await sql`UPDATE inventory SET product_id=${product_id}, quantity=${quantity}, status=${status}, updated_at=NOW() WHERE id=${req.params.id} RETURNING *`;
    if (!item) return res.status(404).json({ error: 'Not found' });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete inventory item
router.delete('/:id', auth, requireAdmin, async (req, res) => {
  try {
    const [deleted] = await sql`DELETE FROM inventory WHERE id=${req.params.id} RETURNING *`;
    if (!deleted) return res.status(404).json({ error: 'Not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router; 