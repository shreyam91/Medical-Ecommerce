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

// Get all reference books
router.get('/', async (req, res) => {
  try {
    const books = await sql`SELECT * FROM reference_book ORDER BY id DESC`;
    res.json(books);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get reference book by ID
router.get('/:id', async (req, res) => {
  try {
    const [book] = await sql`SELECT * FROM reference_book WHERE id = ${req.params.id}`;
    if (!book) return res.status(404).json({ error: 'Not found' });
    res.json(book);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create reference book
router.post('/', auth, requireAdminOrLimitedAdmin, async (req, res) => {
  const { name } = req.body;
  try {
    const [book] = await sql`INSERT INTO reference_book (name) VALUES (${name}) RETURNING *`;
    res.status(201).json(book);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update reference book
router.put('/:id', auth, requireAdminOrLimitedAdmin, async (req, res) => {
  const { name } = req.body;
  try {
    const [book] = await sql`UPDATE reference_book SET name=${name}, updated_at=NOW() WHERE id=${req.params.id} RETURNING *`;
    if (!book) return res.status(404).json({ error: 'Not found' });
    res.json(book);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete reference book
router.delete('/:id', auth, requireAdminOrLimitedAdmin, async (req, res) => {
  try {
    const [deleted] = await sql`DELETE FROM reference_book WHERE id=${req.params.id} RETURNING *`;
    if (!deleted) return res.status(404).json({ error: 'Not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// TODO: Add role-based access control middleware. Allow 'admin' and 'limited_admin' to add/edit reference books if needed.

module.exports = router; 