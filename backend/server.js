const express = require('express');
const cors = require('cors');
const fs = require('fs');
const uploadRoutes = require('./routes/upload');
const supabase = require('./config/supabase');
const sql = require('./config/supabase').default || require('./config/supabase');
require('dotenv').config(); // This loads .env variables into process.env
const locationRoutes = require('./routes/location');
const getSheetsClient = require('./routes/googleSheets');

const SPREADSHEET_ID = '131HPWm3xMiKbbBRAFBDhHQ35NPDhsik2VDeCd0vUC5A';

const app = express();
const PORT = 3001;
// app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

app.use(cors());
app.use('/api', uploadRoutes);
// app.use('/api', locationRoutes);
app.use('/api/blog', require('./routes/blog'));
app.use('/api/delivery_status', require('./routes/delivery_status'));
app.use('/api/user', require('./routes/user'));
app.use('/api/product_price', require('./routes/product_price'));
app.use('/api/product', require('./routes/product'));
app.use('/api/doctor', require('./routes/doctor'));
app.use('/api/inventory', require('./routes/inventory')); // Add this line
app.use('/api/banner', require('./routes/banner'));
app.use('/api/book', require('./routes/book'));
app.use('/api/brand', require('./routes/brand'));
app.use('/api/order', require('./routes/order'));
app.use('/api/login', require('./routes/login'));
app.use('/api/reference_book', require('./routes/reference_book'));
app.use('/api/disease', require('./routes/disease'));
app.use('/api/main_category', require('./routes/main_category'));
app.use('/api/sub_category', require('./routes/sub_category'));
app.use('/api/customer', require('./routes/customer'));
app.use('/api/payment', require('./routes/payment'));

// Endpoint to fetch pincodes by city or pincode using a free public API
app.use('/api', locationRoutes);

// Endpoint to detect user location and return pincode using the public API

// Read data from any sheet
app.get('/api/sheet/:sheetName', async (req, res) => {
  try {
    const sheets = await getSheetsClient();
    const sheetName = req.params.sheetName;
    const range = `${sheetName}!A1:Z1000`; // adjust range as needed

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range,
    });

    res.json(response.data.values || []);
  } catch (error) {
    console.error(error);
    res.status(500).send('Failed to read sheet data');
  }
});

// Append a row to a sheet
app.post('/api/sheet/:sheetName', async (req, res) => {
  try {
    const sheets = await getSheetsClient();
    const sheetName = req.params.sheetName;
    const values = req.body.values; // Expect an array of values

    if (!Array.isArray(values)) {
      return res.status(400).send('Request body must have a "values" array');
    }

    const response = await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: `${sheetName}!A1`,
      valueInputOption: 'RAW',
      insertDataOption: 'INSERT_ROWS',
      requestBody: { values: [values] },
    });

    res.json({ updatedRange: response.data.updates.updatedRange });
  } catch (error) {
    console.error(error);
    res.status(500).send('Failed to append data');
  }
});



// Test route to verify Postgres connection
app.get('/api/postgres-test', async (req, res) => {
  try {
    const result = await sql`SELECT 1 as test`;
    res.json({ success: true, result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(PORT,'0.0.0.0', () => {
  console.log(`Backend server running at http://localhost:${PORT}`);
});


// Example usage in a route

// Example: Fetch data from a table
async function getData() {
  const { data, error } = await supabase
    .from('your_table')
    .select('*');
  if (error) {
    console.error(error);
    return null;
  }
  return data;
}