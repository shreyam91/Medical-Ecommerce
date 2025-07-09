const express = require('express');
const router = express.Router();
const sql = require('../config/supabase');
const cloudinary = require('../config/cloudinary');
const auth = require('./auth');

function extractCloudinaryPublicId(url) {
  if (!url) return null;
  const matches = url.match(/\/upload\/(?:v[0-9]+\/)?(.+)\.[a-zA-Z]+$/);
  return matches ? matches[1] : null;
}

function requireAdminOrLimitedAdmin(req, res, next) {
  if (!req.user || !['admin', 'limited_admin'].includes(req.user.role)) {
    return res.status(403).json({ error: 'Forbidden: insufficient permissions' });
  }
  next();
}

// Get all doctors
router.get('/', async (req, res) => {
  try {
    const doctors = await sql`SELECT * FROM doctor ORDER BY id DESC`;
    res.json(doctors);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get doctor by ID
router.get('/:id', async (req, res) => {
  try {
    const [doctor] = await sql`SELECT * FROM doctor WHERE id = ${req.params.id}`;
    if (!doctor) return res.status(404).json({ error: 'Not found' });
    res.json(doctor);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create doctor
router.post('/', auth, requireAdminOrLimitedAdmin, async (req, res) => {
  const { image_url, name, phone_number, degree, address, city, state, pincode, start_time, end_time, specialization } = req.body;
  try {
    const [doctor] = await sql`
      INSERT INTO doctor (image_url, name, phone_number, degree, address, city, state, pincode, start_time, end_time, specialization)
      VALUES (${image_url}, ${name}, ${phone_number}, ${degree}, ${address}, ${city}, ${state}, ${pincode}, ${start_time}, ${end_time}, ${specialization})
      RETURNING *`;
    res.status(201).json(doctor);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update doctor
router.put('/:id', auth, requireAdminOrLimitedAdmin, async (req, res) => {
  const { image_url, name, phone_number, degree, address, city, state, pincode, start_time, end_time, specialization } = req.body;
  try {
    const [doctor] = await sql`
      UPDATE doctor SET image_url=${image_url}, name=${name}, phone_number=${phone_number}, degree=${degree}, address=${address}, city=${city}, state=${state}, pincode=${pincode}, start_time=${start_time}, end_time=${end_time}, specialization=${specialization}
      WHERE id=${req.params.id} RETURNING *`;
    if (!doctor) return res.status(404).json({ error: 'Not found' });
    res.json(doctor);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete doctor
router.delete('/:id', auth, requireAdminOrLimitedAdmin, async (req, res) => {
  try {
    // Get doctor first to access image_url
    const [doctor] = await sql`SELECT * FROM doctor WHERE id=${req.params.id}`;
    console.log('Fetched doctor:', doctor);
    if (!doctor) return res.status(404).json({ error: 'Not found' });
    // Delete image from Cloudinary if present
    if (doctor.image_url) {
      const publicId = extractCloudinaryPublicId(doctor.image_url);
      console.log('Deleting doctor image:', doctor.image_url, 'Extracted publicId:', publicId);
      if (publicId) {
        try {
          await cloudinary.uploader.destroy(publicId);
        } catch (cloudErr) {
          console.error('Cloudinary delete error:', cloudErr);
        }
      }
    }
    // Delete doctor from DB
    const [deleted] = await sql`DELETE FROM doctor WHERE id=${req.params.id} RETURNING *`;
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// TODO: Add role-based access control middleware. Allow 'admin' and 'limited_admin' to add/edit doctors.

module.exports = router; 