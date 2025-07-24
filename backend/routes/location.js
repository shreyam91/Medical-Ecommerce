const express = require('express');
const router = express.Router();
const {
  getPincodeByQuery,
  detectUserLocation
} = require('../controllers/locationController');

// Get pincodes by city or pincode
router.get('/pincodes/:query', getPincodeByQuery);

// Detect user's location and return pincode
router.get('/detect-location', detectUserLocation);

module.exports = router;
