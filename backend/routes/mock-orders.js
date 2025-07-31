const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');

// Mock data storage
let customers = [];
let orders = [];
let nextCustomerId = 1;

// Create customer (Public endpoint for checkout)
router.post('/customer/public', async (req, res) => {
  try {
    const { name, email, mobile, address } = req.body;
    
    // Check if customer exists
    let customer = customers.find(c => c.email === email);
    
    if (!customer) {
      const id = nextCustomerId++;
      const date = new Date().toISOString().slice(0,10).replace(/-/g,'');
      const namePart = name.toUpperCase().replace(/[^A-Z]/g, '').padEnd(3, 'X').slice(0,3);
      const serialPart = String(id).padStart(2, '0');
      
      customer = {
        id,
        name,
        email,
        mobile,
        address,
        customer_id: `CUST-${date}-${namePart}${serialPart}`,
        created_at: new Date().toISOString()
      };
      customers.push(customer);
    }
    
    res.status(201).json(customer);
  } catch (err) {
    console.error('Mock customer creation error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get customer by email
router.get('/customer/email/:email', async (req, res) => {
  try {
    const customer = customers.find(c => c.email === req.params.email);
    if (!customer) return res.status(404).json({ error: 'Customer not found' });
    res.json(customer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create order
router.post('/orders', async (req, res) => {
  try {
    const { customer_id, total_amount, address, notes, items } = req.body;
    
    const order = {
      id: uuidv4(),
      customer_id,
      total_amount,
      address,
      notes,
      status: 'Ordered',
      order_date: new Date().toISOString(),
      items: items || []
    };
    
    orders.push(order);
    res.status(201).json(order);
  } catch (err) {
    console.error('Mock order creation error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get customer orders
router.get('/orders/customer/:customerId', async (req, res) => {
  try {
    const customerId = parseInt(req.params.customerId);
    const customerOrders = orders.filter(o => o.customer_id === customerId);
    
    // Add mock items if none exist
    const ordersWithItems = customerOrders.map(order => ({
      ...order,
      items: order.items.length > 0 ? order.items : [
        { product_name: 'Sample Product', price: order.total_amount }
      ]
    }));
    
    res.json(ordersWithItems);
  } catch (err) {
    console.error('Mock get orders error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Update order status
router.patch('/orders/:id/status', async (req, res) => {
  try {
    const orderId = req.params.id; // UUID, no need to parse as int
    const { status } = req.body;
    
    const order = orders.find(o => o.id === orderId);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    
    order.status = status;
    res.json(order);
  } catch (err) {
    console.error('Mock update order error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;