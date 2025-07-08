const express = require('express');
const router = express.Router();
const sql = require('../config/supabase');

// Get all inventory items
router.get('/', async (req, res) => {
  try {
    const inventory = await sql`SELECT * FROM inventory ORDER BY id DESC`;
    res.json(inventory);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get inventory by ID
router.get('/:id', async (req, res) => {
  try {
    const [item] = await sql`SELECT * FROM inventory WHERE id = ${req.params.id}`;
    if (!item) return res.status(404).json({ error: 'Not found' });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create inventory item
router.post('/', async (req, res) => {
  const { product_id, quantity, status } = req.body;
  try {
    const [item] = await sql`INSERT INTO inventory (product_id, quantity, status) VALUES (${product_id}, ${quantity}, ${status}) RETURNING *`;
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update inventory item
router.put('/:id', async (req, res) => {
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
router.delete('/:id', async (req, res) => {
  try {
    const [deleted] = await sql`DELETE FROM inventory WHERE id=${req.params.id} RETURNING *`;
    if (!deleted) return res.status(404).json({ error: 'Not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router; 