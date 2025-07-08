const express = require('express');
const router = express.Router();
const sql = require('../config/supabase');

// Get all categories
router.get('/', async (req, res) => {
  try {
    const categories = await sql`SELECT * FROM category ORDER BY id DESC`;
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get category by ID
router.get('/:id', async (req, res) => {
  try {
    const [category] = await sql`SELECT * FROM category WHERE id = ${req.params.id}`;
    if (!category) return res.status(404).json({ error: 'Not found' });
    res.json(category);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create category
router.post('/', async (req, res) => {
  const { name } = req.body;
  try {
    const [category] = await sql`INSERT INTO category (name) VALUES (${name}) RETURNING *`;
    res.status(201).json(category);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update category
router.put('/:id', async (req, res) => {
  const { name } = req.body;
  try {
    const [category] = await sql`UPDATE category SET name=${name}, updated_at=NOW() WHERE id=${req.params.id} RETURNING *`;
    if (!category) return res.status(404).json({ error: 'Not found' });
    res.json(category);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete category
router.delete('/:id', async (req, res) => {
  try {
    const [deleted] = await sql`DELETE FROM category WHERE id=${req.params.id} RETURNING *`;
    if (!deleted) return res.status(404).json({ error: 'Not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router; 