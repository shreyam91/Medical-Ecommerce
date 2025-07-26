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

// 📦 Get All Orders
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

// 🆕 Create Order
router.post('/', auth, requireAdmin, async (req, res) => {
  const { customer_id, status, total_amount, payment_id, address, notes } = req.body;
  try {
    const order_uuid = uuidv4();
    const [order] = await sql`
      INSERT INTO "order" (id, customer_id, status, total_amount, payment_id, address, notes)
      VALUES (${order_uuid}, ${customer_id}, ${status}, ${total_amount}, ${payment_id}, ${address}, ${notes})
      RETURNING *`;

    await appendOrderToSheet(order);

    res.status(201).json(order);
  } catch (err) {
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
