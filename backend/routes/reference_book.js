const express = require('express');
const router = express.Router();
const sql = require('../config/supabase');

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
router.post('/', async (req, res) => {
  const { name, author, description } = req.body;
  try {
    const [book] = await sql`INSERT INTO reference_book (name, author, description) VALUES (${name}, ${author}, ${description}) RETURNING *`;
    res.status(201).json(book);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update reference book
router.put('/:id', async (req, res) => {
  const { name, author, description } = req.body;
  try {
    const [book] = await sql`UPDATE reference_book SET name=${name}, author=${author}, description=${description}, updated_at=NOW() WHERE id=${req.params.id} RETURNING *`;
    if (!book) return res.status(404).json({ error: 'Not found' });
    res.json(book);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete reference book
router.delete('/:id', async (req, res) => {
  try {
    const [deleted] = await sql`DELETE FROM reference_book WHERE id=${req.params.id} RETURNING *`;
    if (!deleted) return res.status(404).json({ error: 'Not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router; 