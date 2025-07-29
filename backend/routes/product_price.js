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

// Get all product prices
router.get('/', async (req, res) => {
  try {
    const prices = await sql`SELECT * FROM product_price ORDER BY created_at DESC`;
    res.json(prices);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get by ID
router.get('/:id', async (req, res) => {
  try {
    const [price] = await sql`SELECT * FROM product_price WHERE id = ${req.params.id}`;
    if (!price) return res.status(404).json({ error: 'Not found' });
    res.json(price);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get prices by product ID
router.get('/product/:productId', async (req, res) => {
  try {
    const prices = await sql`SELECT * FROM product_price WHERE product_id = ${req.params.productId} ORDER BY created_at ASC`;
    res.json(prices);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create multiple prices for a product
router.post('/', auth, requireAdminOrLimitedAdmin, async (req, res) => {
  const { productId, prices } = req.body;
  console.log('Creating product prices:', { productId, prices });
  
  try {
    const createdPrices = [];
    for (const price of prices) {
      console.log('Inserting price:', price);
      const [createdPrice] = await sql`
        INSERT INTO product_price (product_id, size, actual_price, discount_percent, selling_price, quantity)
        VALUES (${productId}, ${price.size}, ${price.actual_price}, ${price.discount_percent}, ${price.selling_price}, ${price.quantity})
        RETURNING *`;
      createdPrices.push(createdPrice);
    }
    console.log('Created prices:', createdPrices);
    res.status(201).json(createdPrices);
  } catch (err) {
    console.error('Error creating product prices:', err);
    res.status(500).json({ error: err.message });
  }
});

// Update prices for a product
router.put('/:productId', auth, requireAdminOrLimitedAdmin, async (req, res) => {
  const { prices } = req.body;
  const productId = req.params.productId;
  console.log('Updating product prices:', { productId, prices });
  
  try {
    // Delete existing prices for this product
    await sql`DELETE FROM product_price WHERE product_id = ${productId}`;
    console.log('Deleted existing prices for product:', productId);
    
    // Insert new prices
    const updatedPrices = [];
    for (const price of prices) {
      console.log('Inserting updated price:', price);
      const [updatedPrice] = await sql`
        INSERT INTO product_price (product_id, size, actual_price, discount_percent, selling_price, quantity)
        VALUES (${productId}, ${price.size}, ${price.actual_price}, ${price.discount_percent}, ${price.selling_price}, ${price.quantity})
        RETURNING *`;
      updatedPrices.push(updatedPrice);
    }
    
    console.log('Updated prices:', updatedPrices);
    res.json(updatedPrices);
  } catch (err) {
    console.error('Error updating product prices:', err);
    res.status(500).json({ error: err.message });
  }
});

// Delete
router.delete('/:id', async (req, res) => {
  try {
    const [price] = await sql`DELETE FROM product_price WHERE id=${req.params.id} RETURNING *`;
    if (!price) return res.status(404).json({ error: 'Not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router; 