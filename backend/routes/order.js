const express = require('express');
const router = express.Router();
const sql = require('../config/supabase');

// Get all orders
router.get('/', async (req, res) => {
  try {
    const orders = await sql`SELECT * FROM "order" ORDER BY order_date DESC`;
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get order by ID
router.get('/:id', async (req, res) => {
  try {
    const [order] = await sql`SELECT * FROM "order" WHERE id = ${req.params.id}`;
    if (!order) return res.status(404).json({ error: 'Not found' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create order
router.post('/', async (req, res) => {
  const { customer_id, status, total_amount, payment_id, address, notes } = req.body;
  try {
    const [order] = await sql`
      INSERT INTO "order" (customer_id, status, total_amount, payment_id, address, notes)
      VALUES (${customer_id}, ${status}, ${total_amount}, ${payment_id}, ${address}, ${notes})
      RETURNING *`;
    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update order
router.put('/:id', async (req, res) => {
  const { customer_id, status, total_amount, payment_id, address, notes } = req.body;
  try {
    const [order] = await sql`
      UPDATE "order" SET customer_id=${customer_id}, status=${status}, total_amount=${total_amount}, payment_id=${payment_id}, address=${address}, notes=${notes}, updated_at=NOW()
      WHERE id=${req.params.id} RETURNING *`;
    if (!order) return res.status(404).json({ error: 'Not found' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete order
router.delete('/:id', async (req, res) => {
  try {
    const [order] = await sql`DELETE FROM "order" WHERE id=${req.params.id} RETURNING *`;
    if (!order) return res.status(404).json({ error: 'Not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router; 