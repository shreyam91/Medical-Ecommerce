// const express = require('express');
// const router = express.Router();
// const sql = require('../config/supabase');
// const auth = require('./auth');
// const { v4: uuidv4 } = require('uuid');

// function requireAdmin(req, res, next) {
//   if (!req.user || req.user.role !== 'admin') {
//     return res.status(403).json({ error: 'Forbidden: admin only' });
//   }
//   next();
// }

// // Get all orders
// router.get('/', auth, requireAdmin, async (req, res) => {
//   try {
//     const orders = await sql`
//       SELECT o.*, c.name AS customer_name, p.method AS payment_method
//       FROM "order" o
//       LEFT JOIN customer c ON o.customer_id = c.id
//       LEFT JOIN payment p ON o.payment_id = p.id
//       ORDER BY o.order_date DESC
//     `;
//     res.json(orders);
//   } catch (err) {
//     console.error('Order API error:', err); // <-- Add this line
//     res.status(500).json({ error: err.message });
//   }
// });

// // Get order by ID
// router.get('/:id', auth, requireAdmin, async (req, res) => {
//   try {
//     const [order] = await sql`SELECT * FROM "order" WHERE id = ${req.params.id}`;
//     if (!order) return res.status(404).json({ error: 'Not found' });
//     res.json(order);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// // Create order
// router.post('/', auth, requireAdmin, async (req, res) => {
//   const { customer_id, status, total_amount, payment_id, address, notes } = req.body;
//   try {
//     const order_uuid = uuidv4();
//     const [order] = await sql`
//       INSERT INTO "order" (id, customer_id, status, total_amount, payment_id, address, notes)
//       VALUES (${order_uuid}, ${customer_id}, ${status}, ${total_amount}, ${payment_id}, ${address}, ${notes})
//       RETURNING *`;
//     res.status(201).json(order);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// // Update order
// router.put('/:id', auth, requireAdmin, async (req, res) => {
//   const { customer_id, status, total_amount, payment_id, address, notes } = req.body;
//   try {
//     const [order] = await sql`
//       UPDATE "order" SET customer_id=${customer_id}, status=${status}, total_amount=${total_amount}, payment_id=${payment_id}, address=${address}, notes=${notes}, updated_at=NOW()
//       WHERE id=${req.params.id} RETURNING *`;
//     if (!order) return res.status(404).json({ error: 'Not found' });
//     res.json(order);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// // Delete order
// router.delete('/:id', auth, requireAdmin, async (req, res) => {
//   try {
//     const [order] = await sql`DELETE FROM "order" WHERE id=${req.params.id} RETURNING *`;
//     if (!order) return res.status(404).json({ error: 'Not found' });
//     res.json({ success: true });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// module.exports = router; 

const express = require('express');
const router = express.Router();
const sql = require('../config/supabase');
const auth = require('./auth');
const { v4: uuidv4 } = require('uuid');
const { google } = require('googleapis');
const path = require('path');

// Google Sheets Config
const SPREADSHEET_ID = '131HPWm3xMiKbbBRAFBDhHQ35NPDhsik2VDeCd0vUC5A';

const authGoogle = new google.auth.GoogleAuth({
  keyFile: path.join(__dirname, '../json/herbalmg-9a3e8-c15a18ff5a68.json'),
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

async function getSheetsClient() {
  const authClient = await authGoogle.getClient();
  return google.sheets({ version: 'v4', auth: authClient });
}

async function getSheetIdByName(sheetName) {
  const sheets = await getSheetsClient();
  const meta = await sheets.spreadsheets.get({ spreadsheetId: SPREADSHEET_ID });
  const sheet = meta.data.sheets.find(s => s.properties.title === sheetName);
  if (!sheet) throw new Error(`Sheet "${sheetName}" not found`);
  return sheet.properties.sheetId;
}

async function appendOrderToSheet(order) {
  try {
    const sheets = await getSheetsClient();
    const values = [
      order.id,
      order.customer_id,
      order.status,
      order.total_amount,
      order.payment_id,
      order.address,
      order.notes || '',
      order.order_date || new Date().toISOString(),
    ];
    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Orders!A1',
      valueInputOption: 'RAW',
      insertDataOption: 'INSERT_ROWS',
      requestBody: { values: [values] },
    });
  } catch (error) {
    console.error('❌ Error appending order to Google Sheet:', error);
  }
}

async function findOrderRowIndex(orderId) {
  const sheets = await getSheetsClient();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: 'Orders!A:A',
  });
  const rows = res.data.values || [];
  for (let i = 0; i < rows.length; i++) {
    if (rows[i][0] === orderId) return i + 1;
  }
  return -1;
}

async function updateOrderInSheet(order, rowIndex) {
  try {
    const sheets = await getSheetsClient();
    const values = [
      order.id,
      order.customer_id,
      order.status,
      order.total_amount,
      order.payment_id,
      order.address,
      order.notes || '',
      order.order_date || new Date().toISOString(),
    ];
    const range = `Orders!A${rowIndex}:H${rowIndex}`;
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range,
      valueInputOption: 'RAW',
      requestBody: { values: [values] },
    });
  } catch (error) {
    console.error('❌ Error updating order in Google Sheet:', error);
  }
}

async function deleteOrderRowInSheet(rowIndex) {
  try {
    const sheets = await getSheetsClient();
    const sheetId = await getSheetIdByName('Orders');
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      requestBody: {
        requests: [
          {
            deleteDimension: {
              range: {
                sheetId,
                dimension: 'ROWS',
                startIndex: rowIndex - 1,
                endIndex: rowIndex,
              },
            },
          },
        ],
      },
    });
  } catch (error) {
    console.error('❌ Error deleting order from Google Sheet:', error);
  }
}

// Admin Middleware
function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden: admin only' });
  }
  next();
}

// 📦 Get All Orders (Admin only)
router.get('/', auth, requireAdmin, async (req, res) => {
  try {
    const orders = await sql`
      SELECT o.*, c.name AS customer_name, p.method AS payment_method
      FROM "order" o
      LEFT JOIN customer c ON o.customer_id = c.id
      LEFT JOIN payment p ON o.payment_id = p.id
      ORDER BY o.order_date DESC
    `;
    res.json(orders);
  } catch (err) {
    console.error('Order API error:', err);
    res.status(500).json({ error: err.message });
  }
});

// 📦 Get Customer Orders (Customer can access their own orders)
router.get('/customer/:customerId', async (req, res) => {
  try {
    const customerId = req.params.customerId;
    const orders = await sql`
      SELECT o.*, c.name AS customer_name
      FROM "order" o
      LEFT JOIN customer c ON o.customer_id = c.id
      WHERE o.customer_id = ${customerId}
      ORDER BY o.order_date DESC
    `;

    // Get order items for each order
    for (let order of orders) {
      const items = await sql`
        SELECT oi.*, p.name as product_name
        FROM order_item oi
        LEFT JOIN product p ON oi.product_id = p.id
        WHERE oi.order_id = ${order.id}
      `;
      order.items = items;
    }

    res.json(orders);
  } catch (err) {
    console.error('Customer orders API error:', err);
    res.status(500).json({ error: err.message });
  }
});

// 📦 Get Order by ID
router.get('/:id', auth, requireAdmin, async (req, res) => {
  try {
    const [order] = await sql`SELECT * FROM "order" WHERE id = ${req.params.id}`;
    if (!order) return res.status(404).json({ error: 'Not found' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Function to generate formatted order ID for display
function generateOrderId(orderId, orderDate) {
  const date = new Date(orderDate);
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  // Use first 8 characters of UUID for uniqueness
  const uuidShort = orderId.replace(/-/g, '').substring(0, 8).toUpperCase();
  return `ORD-${dateStr}-${uuidShort}`;
}

// 🆕 Create Order (Public endpoint for checkout)
router.post('/', async (req, res) => {
  const { customer_id, status = 'Ordered', total_amount, address, notes, items } = req.body;
  try {
    // Generate UUID for the order
    const orderId = uuidv4();
    
    const [order] = await sql`
      INSERT INTO "order" (id, customer_id, status, total_amount, address, notes)
      VALUES (${orderId}, ${customer_id}, ${status}, ${total_amount}, ${address}, ${notes})
      RETURNING *`;

    // Insert order items if provided
    if (items && items.length > 0) {
      for (const item of items) {
        await sql`
          INSERT INTO order_item (order_id, product_id, quantity, price)
          VALUES (${order.id}, ${item.product_id}, ${item.quantity}, ${item.price})
        `;
      }
    }

    // Get the complete order with items and product names for response
    const orderWithItems = await sql`
      SELECT o.*, c.name AS customer_name
      FROM "order" o
      LEFT JOIN customer c ON o.customer_id = c.id
      WHERE o.id = ${order.id}
    `;

    if (items && items.length > 0) {
      const orderItems = await sql`
        SELECT oi.*, p.name as product_name
        FROM order_item oi
        LEFT JOIN product p ON oi.product_id = p.id
        WHERE oi.order_id = ${order.id}
      `;
      orderWithItems[0].items = orderItems;
    }

    // Generate formatted order ID for display
    const formattedOrderId = generateOrderId(order.id, order.order_date);
    const finalOrder = orderWithItems[0] || order;
    finalOrder.formatted_order_id = formattedOrderId;

    // await appendOrderToSheet(order); // Temporarily disabled

    res.status(201).json(finalOrder);
  } catch (err) {
    console.error('Create order error:', err);
    res.status(500).json({ error: err.message });
  }
});

// 📊 Update Order Status (Public endpoint for status updates)
router.patch('/:id/status', async (req, res) => {
  const { status } = req.body;
  try {
    const [order] = await sql`
      UPDATE "order" 
      SET status=${status}, updated_at=NOW()
      WHERE id=${req.params.id} RETURNING *`;

    if (!order) return res.status(404).json({ error: 'Order not found' });

    const rowIndex = await findOrderRowIndex(order.id);
    if (rowIndex > 0) {
      await updateOrderInSheet(order, rowIndex);
    }

    res.json(order);
  } catch (err) {
    console.error('Update order status error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ✏️ Update Order
router.put('/:id', auth, requireAdmin, async (req, res) => {
  const { customer_id, status, total_amount, payment_id, address, notes } = req.body;
  try {
    const [order] = await sql`
      UPDATE "order" 
      SET customer_id=${customer_id}, status=${status}, total_amount=${total_amount}, 
          payment_id=${payment_id}, address=${address}, notes=${notes}, updated_at=NOW()
      WHERE id=${req.params.id} RETURNING *`;

    if (!order) return res.status(404).json({ error: 'Not found' });

    const rowIndex = await findOrderRowIndex(order.id);
    if (rowIndex > 0) {
      await updateOrderInSheet(order, rowIndex);
    } else {
      await appendOrderToSheet(order);
    }

    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ❌ Delete Order
router.delete('/:id', auth, requireAdmin, async (req, res) => {
  try {
    const [order] = await sql`DELETE FROM "order" WHERE id=${req.params.id} RETURNING *`;
    if (!order) return res.status(404).json({ error: 'Not found' });

    const rowIndex = await findOrderRowIndex(order.id);
    if (rowIndex > 0) {
      await deleteOrderRowInSheet(rowIndex);
    }

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
