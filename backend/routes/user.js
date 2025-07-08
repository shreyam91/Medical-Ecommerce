const express = require('express');
const router = express.Router();
const sql = require('../config/supabase');

// Get all users (do not return password_hash)
router.get('/', async (req, res) => {
  try {
    const users = await sql`SELECT id, username, email, role, created_at, updated_at FROM "user" ORDER BY created_at DESC`;
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get user by ID (do not return password_hash)
router.get('/:id', async (req, res) => {
  try {
    const [user] = await sql`SELECT id, username, email, role, created_at, updated_at FROM "user" WHERE id = ${req.params.id}`;
    if (!user) return res.status(404).json({ error: 'Not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create user
router.post('/', async (req, res) => {
  const { username, email, password_hash, role } = req.body;
  try {
    const [user] = await sql`INSERT INTO "user" (username, email, password_hash, role) VALUES (${username}, ${email}, ${password_hash}, ${role}) RETURNING id, username, email, role, created_at, updated_at`;
    res.status(201).json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update user
router.put('/:id', async (req, res) => {
  const { username, email, password_hash, role } = req.body;
  try {
    const [user] = await sql`UPDATE "user" SET username=${username}, email=${email}, password_hash=${password_hash}, role=${role}, updated_at=NOW() WHERE id=${req.params.id} RETURNING id, username, email, role, created_at, updated_at`;
    if (!user) return res.status(404).json({ error: 'Not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete user
router.delete('/:id', async (req, res) => {
  try {
    const [user] = await sql`DELETE FROM "user" WHERE id=${req.params.id} RETURNING id`;
    if (!user) return res.status(404).json({ error: 'Not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router; 