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
  const { name, author, description } = req.body;
  try {
    const [book] = await sql`
      INSERT INTO reference_book (name, author, description)
      VALUES (${name}, ${author}, ${description})
      RETURNING *`;
    res.status(201).json(book);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update reference book
router.put('/:id', auth, requireAdminOrLimitedAdmin, async (req, res) => {
  const { name, author, description } = req.body;
  try {
    const [book] = await sql`
      UPDATE reference_book SET name=${name}, author=${author}, description=${description}, updated_at=NOW()
      WHERE id=${req.params.id} RETURNING *`;
    if (!book) return res.status(404).json({ error: 'Not found' });
    res.json(book);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete reference book
router.delete('/:id', auth, requireAdminOrLimitedAdmin, async (req, res) => {
  try {
    const [book] = await sql`DELETE FROM reference_book WHERE id=${req.params.id} RETURNING *`;
    if (!book) return res.status(404).json({ error: 'Not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router; 