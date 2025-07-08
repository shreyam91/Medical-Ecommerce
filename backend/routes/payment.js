const express = require('express');
const router = express.Router();
const sql = require('../config/supabase');

// Get all payments
router.get('/', async (req, res) => {
  try {
    const payments = await sql`SELECT * FROM payment ORDER BY id DESC`;
    res.json(payments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get payment by ID
router.get('/:id', async (req, res) => {
  try {
    const [payment] = await sql`SELECT * FROM payment WHERE id = ${req.params.id}`;
    if (!payment) return res.status(404).json({ error: 'Not found' });
    res.json(payment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create payment
router.post('/', async (req, res) => {
  const { order_id, amount, status, method, payment_date } = req.body;
  try {
    const [payment] = await sql`INSERT INTO payment (order_id, amount, status, method, payment_date) VALUES (${order_id}, ${amount}, ${status}, ${method}, ${payment_date}) RETURNING *`;
    res.status(201).json(payment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update payment
router.put('/:id', async (req, res) => {
  const { order_id, amount, status, method, payment_date } = req.body;
  try {
    const [payment] = await sql`UPDATE payment SET order_id=${order_id}, amount=${amount}, status=${status}, method=${method}, payment_date=${payment_date}, updated_at=NOW() WHERE id=${req.params.id} RETURNING *`;
    if (!payment) return res.status(404).json({ error: 'Not found' });
    res.json(payment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete payment
router.delete('/:id', async (req, res) => {
  try {
    const [deleted] = await sql`DELETE FROM payment WHERE id=${req.params.id} RETURNING *`;
    if (!deleted) return res.status(404).json({ error: 'Not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router; 