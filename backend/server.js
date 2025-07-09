const express = require('express');
const cors = require('cors');
const fs = require('fs');
const uploadRoutes = require('./routes/upload');
const supabase = require('./config/supabase');
const sql = require('./config/supabase').default || require('./config/supabase');
require('dotenv').config(); // This loads .env variables into process.env


const app = express();
const PORT = 3001;
app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

app.use(cors());
app.use('/api', uploadRoutes);
app.use('/api/blog', require('./routes/blog'));
app.use('/api/delivery_status', require('./routes/delivery_status'));
app.use('/api/user', require('./routes/user'));
app.use('/api/product_price', require('./routes/product_price'));
app.use('/api/product', require('./routes/product'));
app.use('/api/doctor', require('./routes/doctor'));
app.use('/api/banner', require('./routes/banner'));
app.use('/api/book', require('./routes/book'));
app.use('/api/brand', require('./routes/brand'));
app.use('/api/order', require('./routes/order'));
app.use('/api/login', require('./routes/login'));
app.use('/api/reference_book', require('./routes/reference_book'));

// Endpoint to fetch pincodes by city or pincode using a free public API
app.get('/api/pincodes/:query', async (req, res) => {
  const query = req.params.query;
  let url;
  if (/^\d+$/.test(query)) {
    // If query is all digits, search by pincode
    url = `https://api.postalpincode.in/pincode/${encodeURIComponent(query)}`;
  } else {
    // Otherwise, search by city
    url = `https://api.postalpincode.in/postoffice/${encodeURIComponent(query)}`;
  }
  try {
    const response = await fetch(url);
    const data = await response.json();
    if (Array.isArray(data) && data[0].Status === "Success") {
      const pincodes = data[0].PostOffice.map(po => ({
        Pincode: po.Pincode,
        Name: po.Name,
        District: po.District,
        State: po.State
      }));
      res.json(pincodes);
    } else {
      res.status(404).json({ error: "No pincodes found for this query" });
    }
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch pincodes" });
  }
});

// Endpoint to detect user location and return pincode using the public API
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
app.get('/api/detect-location', async (req, res) => {
  try {
    const ipRes = await fetch('https://ipapi.co/json/');
    const ipData = await ipRes.json();
    console.log('ipapi.co response:', ipData); // Debug log
    const userCity = ipData.city;
    if (!userCity) {
      console.log('No city detected from IP');
      return res.status(404).json({ message: 'Could not detect city from IP' });
    }
    // Fetch pincodes for the detected city
    const response = await fetch(`https://api.postalpincode.in/postoffice/${encodeURIComponent(userCity)}`);
    const data = await response.json();
    console.log('Postal API for city:', userCity, data); // Debug log
    if (Array.isArray(data) && data[0].Status === "Success" && data[0].PostOffice.length > 0) {
      res.json({ pincode: data[0].PostOffice[0].Pincode });
    } else {
      console.log('No pincode found for detected city:', userCity);
      res.status(404).json({ message: 'Pincode not found for your location' });
    }
  } catch (err) {
    console.error('Geo detection error:', err);
    res.status(500).json({ message: 'Failed to detect location' });
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

app.listen(PORT, () => {
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