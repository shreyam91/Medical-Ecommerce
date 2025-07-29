const express = require('express');
const router = express.Router();
const sql = require('../config/supabase');

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// Send OTP
router.post('/send-otp', async (req, res) => {
  try {
    const { mobile } = req.body;
    
    if (!mobile) {
      return res.status(400).json({ success: false, message: 'Mobile number is required' });
    }

    const otp = generateOTP();

    // Check if user exists
    const existingUser = await sql`
      SELECT id FROM users WHERE mobile = ${mobile}
    `;

    if (existingUser.length > 0) {
      // Update existing user's OTP
      await sql`
        UPDATE users 
        SET otp = ${otp}, updated_at = CURRENT_TIMESTAMP 
        WHERE mobile = ${mobile}
      `;
    } else {
      // Create new user
      await sql`
        INSERT INTO users (mobile, otp) 
        VALUES (${mobile}, ${otp})
      `;
    }

    console.log(`OTP for ${mobile}: ${otp}`); // Simulate SMS
    res.json({ success: true, message: 'OTP sent successfully' });
  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({ success: false, message: 'Failed to send OTP' });
  }
});

// Verify OTP
router.post('/verify-otp', async (req, res) => {
  try {
    const { mobile, otp } = req.body;
    
    if (!mobile || !otp) {
      return res.status(400).json({ success: false, message: 'Mobile and OTP are required' });
    }

    const user = await sql`
      SELECT id, otp, profile_completed, name 
      FROM users 
      WHERE mobile = ${mobile}
    `;

    if (user.length === 0 || user[0].otp !== otp) {
      return res.status(401).json({ success: false, message: 'Invalid OTP' });
    }

    // Clear OTP after successful verification
    await sql`
      UPDATE users 
      SET otp = NULL, updated_at = CURRENT_TIMESTAMP 
      WHERE mobile = ${mobile}
    `;

    const isNewUser = !user[0].profile_completed;
    res.json({ 
      success: true, 
      isNewUser, 
      userId: user[0].id,
      message: 'OTP verified successfully' 
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ success: false, message: 'Failed to verify OTP' });
  }
});

// Complete Profile
router.post('/complete-profile', async (req, res) => {
  try {
    const { userId, name, email, dob, gender } = req.body;

    if (!userId || !name) {
      return res.status(400).json({ success: false, message: 'User ID and name are required' });
    }

    const user = await sql`
      SELECT id FROM users WHERE id = ${userId}
    `;

    if (user.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    await sql`
      UPDATE users 
      SET name = ${name}, 
          email = ${email || null}, 
          dob = ${dob || null}, 
          gender = ${gender || null}, 
          profile_completed = true,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ${userId}
    `;

    res.json({ success: true, message: 'Profile completed successfully' });
  } catch (error) {
    console.error('Complete profile error:', error);
    res.status(500).json({ success: false, message: 'Failed to complete profile' });
  }
});

// Get User Profile
router.get('/profile/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await sql`
      SELECT id, mobile, name, email, dob, gender, profile_completed, created_at
      FROM users 
      WHERE id = ${userId}
    `;

    if (user.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({
      success: true,
      ...user[0]
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ success: false, message: 'Failed to get profile' });
  }
});

module.exports = router;
