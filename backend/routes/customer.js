// const express = require('express');
// const router = express.Router();
// const sql = require('../config/supabase');
// const auth = require('./auth');
// const { v4: uuidv4 } = require('uuid'); // For order UUIDs if needed

// function requireAdmin(req, res, next) {
//   if (!req.user || req.user.role !== 'admin') {
//     return res.status(403).json({ error: 'Forbidden: admin only' });
//   }
//   next();
// }

// // Get all customers
// router.get('/', auth, requireAdmin, async (req, res) => {
//   try {
//     const customers = await sql`SELECT * FROM customer ORDER BY id DESC`;
//     res.json(customers);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// // Get customer by ID
// router.get('/:id', auth, requireAdmin, async (req, res) => {
//   try {
//     const [customer] = await sql`SELECT * FROM customer WHERE id = ${req.params.id}`;
//     if (!customer) return res.status(404).json({ error: 'Not found' });
//     res.json(customer);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// // Create customer
// router.post('/', auth, requireAdmin, async (req, res) => {
//   const { name, email, mobile, address, active } = req.body;
//   try {
//     // 1. Insert customer, get id and created_at
//     const [customer] = await sql`
//       INSERT INTO customer (name, email, mobile, address, active)
//       VALUES (${name}, ${email}, ${mobile}, ${address}, ${active})
//       RETURNING *`;
//     // 2. Generate custom customer_id
//     const date = (customer.created_at || new Date()).toISOString().slice(0,10).replace(/-/g,'');
//     const namePart = (customer.name || '').toUpperCase().replace(/[^A-Z]/g, '').padEnd(3, 'X').slice(0,3);
//     const idPart = String(customer.id).padStart(2, '0');
//     const customId = `CUST-${date}-${namePart}${idPart}`;
//     // 3. Update customer row
//     await sql`UPDATE customer SET customer_id = ${customId} WHERE id = ${customer.id}`;
//     customer.customer_id = customId;
//     res.status(201).json(customer);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// // Update customer
// router.put('/:id', auth, requireAdmin, async (req, res) => {
//   const { name, email, mobile, address, active } = req.body;
//   try {
//     const [customer] = await sql`UPDATE customer SET name=${name}, email=${email}, mobile=${mobile}, address=${address}, active=${active}, updated_at=NOW() WHERE id=${req.params.id} RETURNING *`;
//     if (!customer) return res.status(404).json({ error: 'Not found' });
//     res.json(customer);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// // Delete customer
// router.delete('/:id', auth, requireAdmin, async (req, res) => {
//   try {
//     const [deleted] = await sql`DELETE FROM customer WHERE id=${req.params.id} RETURNING *`;
//     if (!deleted) return res.status(404).json({ error: 'Not found' });
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
const { google } = require('googleapis');
const path = require('path');

// Google Sheets config
const SPREADSHEET_ID = '131HPWm3xMiKbbBRAFBDhHQ35NPDhsik2VDeCd0vUC5A'; // 🔁 Replace with your actual Google Sheet ID

const authGoogle = new google.auth.GoogleAuth({
  keyFile: path.join(__dirname, '../json/herbalmg-9a3e8-c15a18ff5a68.json'), // ✅ Make sure this file exists
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

async function appendCustomerToSheet(customer) {
  try {
    const sheets = await getSheetsClient();
    const values = [
      customer.customer_id,
      customer.name,
      customer.email,
      customer.mobile,
      customer.address,
      customer.active ? 'Active' : 'Inactive',
    ];
    const response = await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Customers!A1',
      valueInputOption: 'RAW',
      insertDataOption: 'INSERT_ROWS',
      requestBody: { values: [values] },
    });
    console.log('✅ Data appended to Google Sheet:', response.data.updates.updatedRange);
  } catch (error) {
    console.error('❌ Error appending to Google Sheet:', error);
  }
}


async function findCustomerRowIndex(customer_id) {
  const sheets = await getSheetsClient();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: 'Customers!A:A',
  });
  const rows = res.data.values || [];
  for (let i = 0; i < rows.length; i++) {
    if (rows[i][0] === customer_id) return i + 1;
  }
  return -1;
}

async function updateCustomerInSheet(customer, rowIndex) {
  const sheets = await getSheetsClient();
  const values = [
    customer.customer_id,
    customer.name,
    customer.email,
    customer.mobile,
    customer.address,
    customer.active ? 'Active' : 'Inactive',
  ];
  const range = `Customers!A${rowIndex}:F${rowIndex}`;
  await sheets.spreadsheets.values.update({
    spreadsheetId: SPREADSHEET_ID,
    range,
    valueInputOption: 'RAW',
    requestBody: { values: [values] },
  });
}

async function deleteCustomerRowInSheet(rowIndex) {
  const sheets = await getSheetsClient();
  const sheetId = await getSheetIdByName('Customers');
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
}

// Middleware to protect admin routes
function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden: admin only' });
  }
  next();
}

// Routes

router.get('/', auth, requireAdmin, async (req, res) => {
  try {
    const customers = await sql`SELECT * FROM customer ORDER BY id DESC`;
    res.json(customers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', auth, requireAdmin, async (req, res) => {
  try {
    const [customer] = await sql`SELECT * FROM customer WHERE id = ${req.params.id}`;
    if (!customer) return res.status(404).json({ error: 'Not found' });
    res.json(customer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', auth, requireAdmin, async (req, res) => {
  const { name, email, mobile, address, active } = req.body;
  try {
    const [customer] = await sql`
      INSERT INTO customer (name, email, mobile, address, active)
      VALUES (${name}, ${email}, ${mobile}, ${address}, ${active})
      RETURNING *`;
    const date = (customer.created_at || new Date()).toISOString().slice(0,10).replace(/-/g,'');
    const namePart = (customer.name || '').toUpperCase().replace(/[^A-Z]/g, '').padEnd(3, 'X').slice(0,3);
    const idPart = String(customer.id).padStart(2, '0');
    const customId = `CUST-${date}-${namePart}${idPart}`;
    await sql`UPDATE customer SET customer_id = ${customId} WHERE id = ${customer.id}`;
    customer.customer_id = customId;

    await appendCustomerToSheet(customer);

    res.status(201).json(customer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', auth, requireAdmin, async (req, res) => {
  const { name, email, mobile, address, active } = req.body;
  try {
    const [customer] = await sql`
      UPDATE customer 
      SET name=${name}, email=${email}, mobile=${mobile}, address=${address}, active=${active}, updated_at=NOW() 
      WHERE id=${req.params.id} RETURNING *`;
    if (!customer) return res.status(404).json({ error: 'Not found' });

    const rowIndex = await findCustomerRowIndex(customer.customer_id);
    if (rowIndex > 0) {
      await updateCustomerInSheet(customer, rowIndex);
    } else {
      await appendCustomerToSheet(customer);
    }

    res.json(customer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', auth, requireAdmin, async (req, res) => {
  try {
    const [deleted] = await sql`DELETE FROM customer WHERE id=${req.params.id} RETURNING *`;
    if (!deleted) return res.status(404).json({ error: 'Not found' });

    const rowIndex = await findCustomerRowIndex(deleted.customer_id);
    if (rowIndex > 0) {
      await deleteCustomerRowInSheet(rowIndex);
    }

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Address CRUD endpoints

// Get all addresses for a customer
router.get('/:customerId/addresses', auth, async (req, res) => {
  try {
    const addresses = await sql`SELECT * FROM address WHERE customer_id = ${req.params.customerId} ORDER BY is_default DESC, id DESC`;
    res.json(addresses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get a single address by id
router.get('/:customerId/addresses/:addressId', auth, async (req, res) => {
  try {
    const [address] = await sql`SELECT * FROM address WHERE id = ${req.params.addressId} AND customer_id = ${req.params.customerId}`;
    if (!address) return res.status(404).json({ error: 'Not found' });
    res.json(address);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add a new address for a customer
router.post('/:customerId/addresses', auth, async (req, res) => {
  const { address_line1, address_line2, city, state, pincode, country, is_default } = req.body;
  try {
    // If is_default is true, unset previous default
    if (is_default) {
      await sql`UPDATE address SET is_default = FALSE WHERE customer_id = ${req.params.customerId}`;
    }
    const [address] = await sql`
      INSERT INTO address (customer_id, address_line1, address_line2, city, state, pincode, country, is_default)
      VALUES (${req.params.customerId}, ${address_line1}, ${address_line2}, ${city}, ${state}, ${pincode}, ${country || 'India'}, ${!!is_default})
      RETURNING *`;
    res.status(201).json(address);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update an address
router.put('/:customerId/addresses/:addressId', auth, async (req, res) => {
  const { address_line1, address_line2, city, state, pincode, country, is_default } = req.body;
  try {
    // If is_default is true, unset previous default
    if (is_default) {
      await sql`UPDATE address SET is_default = FALSE WHERE customer_id = ${req.params.customerId}`;
    }
    const [address] = await sql`
      UPDATE address SET address_line1=${address_line1}, address_line2=${address_line2}, city=${city}, state=${state}, pincode=${pincode}, country=${country || 'India'}, is_default=${!!is_default}, updated_at=NOW()
      WHERE id=${req.params.addressId} AND customer_id=${req.params.customerId} RETURNING *`;
    if (!address) return res.status(404).json({ error: 'Not found' });
    res.json(address);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete an address
router.delete('/:customerId/addresses/:addressId', auth, async (req, res) => {
  try {
    const [deleted] = await sql`DELETE FROM address WHERE id=${req.params.addressId} AND customer_id=${req.params.customerId} RETURNING *`;
    if (!deleted) return res.status(404).json({ error: 'Not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Set an address as default
router.post('/:customerId/addresses/:addressId/set-default', auth, async (req, res) => {
  try {
    await sql`UPDATE address SET is_default = FALSE WHERE customer_id = ${req.params.customerId}`;
    const [address] = await sql`UPDATE address SET is_default = TRUE WHERE id = ${req.params.addressId} AND customer_id = ${req.params.customerId} RETURNING *`;
    if (!address) return res.status(404).json({ error: 'Not found' });
    res.json(address);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
