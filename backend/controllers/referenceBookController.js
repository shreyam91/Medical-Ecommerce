const sql = require('../config/supabase');

// Get all reference books
exports.getAll = async (req, res) => {
  try {
    const books = await sql`SELECT * FROM reference_book ORDER BY id DESC`;
    res.json(books);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get reference book by ID
exports.getById = async (req, res) => {
  try {
    const [book] = await sql`SELECT * FROM reference_book WHERE id = ${req.params.id}`;
    if (!book) return res.status(404).json({ error: 'Not found' });
    res.json(book);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Create reference book
exports.create = async (req, res) => {
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
};

// Update reference book
exports.update = async (req, res) => {
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
};

// Delete reference book
exports.remove = async (req, res) => {
  try {
    const [book] = await sql`DELETE FROM reference_book WHERE id=${req.params.id} RETURNING *`;
    if (!book) return res.status(404).json({ error: 'Not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
