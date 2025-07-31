const express = require('express');
const router = express.Router();
const sql = require('../config/supabase');

// Get all product requests (admin only)
router.get('/', async (req, res) => {
  try {
    const requests = await sql`
      SELECT * FROM product_request 
      ORDER BY created_at DESC
    `;
    res.json(requests);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a new product request
router.post('/', async (req, res) => {
  const {
    productName,
    brandName,
    category,
    description,
    customerName,
    email,
    phone,
    urgency,
    requestDate,
    status
  } = req.body;

  try {
    const [request] = await sql`
      INSERT INTO product_request (
        product_name,
        brand_name,
        category,
        description,
        customer_name,
        email,
        phone,
        urgency,
        request_date,
        status
      )
      VALUES (
        ${productName},
        ${brandName || null},
        ${category || null},
        ${description || null},
        ${customerName},
        ${email},
        ${phone},
        ${urgency || 'normal'},
        ${requestDate || new Date().toISOString()},
        ${status || 'pending'}
      )
      RETURNING *
    `;
    
    res.status(201).json(request);
  } catch (err) {
    console.error('Error creating product request:', err);
    res.status(500).json({ error: err.message });
  }
});

// Update product request status (admin only)
router.put('/:id', async (req, res) => {
  const { status, adminNotes } = req.body;
  
  try {
    const [request] = await sql`
      UPDATE product_request 
      SET status = ${status}, 
          admin_notes = ${adminNotes || null},
          updated_at = NOW()
      WHERE id = ${req.params.id}
      RETURNING *
    `;
    
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }
    
    res.json(request);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete product request (admin only)
router.delete('/:id', async (req, res) => {
  try {
    const [request] = await sql`
      DELETE FROM product_request 
      WHERE id = ${req.params.id}
      RETURNING *
    `;
    
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }
    
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;