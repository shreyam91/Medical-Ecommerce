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

// Get all customers
router.get('/', auth, requireAdmin, async (req, res) => {
  try {
    const customers = await sql`SELECT * FROM customer ORDER BY id DESC`;
    res.json(customers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get customer by ID
router.get('/:id', auth, requireAdmin, async (req, res) => {
  try {
    const [customer] = await sql`SELECT * FROM customer WHERE id = ${req.params.id}`;
    if (!customer) return res.status(404).json({ error: 'Not found' });
    res.json(customer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create customer
router.post('/', auth, requireAdmin, async (req, res) => {
  const { name, email, mobile, address, active } = req.body;
  try {
    const [customer] = await sql`INSERT INTO customer (name, email, mobile, address, active) VALUES (${name}, ${email}, ${mobile}, ${address}, ${active}) RETURNING *`;
    res.status(201).json(customer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update customer
router.put('/:id', auth, requireAdmin, async (req, res) => {
  const { name, email, mobile, address, active } = req.body;
  try {
    const [customer] = await sql`UPDATE customer SET name=${name}, email=${email}, mobile=${mobile}, address=${address}, active=${active}, updated_at=NOW() WHERE id=${req.params.id} RETURNING *`;
    if (!customer) return res.status(404).json({ error: 'Not found' });
    res.json(customer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete customer
router.delete('/:id', auth, requireAdmin, async (req, res) => {
  try {
    const [deleted] = await sql`DELETE FROM customer WHERE id=${req.params.id} RETURNING *`;
    if (!deleted) return res.status(404).json({ error: 'Not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router; 