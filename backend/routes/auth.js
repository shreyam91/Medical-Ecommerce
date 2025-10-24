const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const axios = require('axios');

// In-memory storage for OTPs (use Redis in production)
const otpStore = new Map();

// SMS API configuration (replace with your SMS provider)
const SMS_API_CONFIG = {
  // Example for Twilio
  accountSid: process.env.TWILIO_ACCOUNT_SID,
  authToken: process.env.TWILIO_AUTH_TOKEN,
  fromNumber: process.env.TWILIO_FROM_NUMBER,
  
  // Example for TextLocal
  apiKey: process.env.TEXTLOCAL_API_KEY,
  sender: process.env.TEXTLOCAL_SENDER || 'TXTLCL',
  
  // Example for MSG91
  authKey: process.env.MSG91_AUTH_KEY,
  templateId: process.env.MSG91_TEMPLATE_ID,
  
  // Generic SMS API
  apiUrl: process.env.SMS_API_URL,
  apiKey: process.env.SMS_API_KEY
};

// Generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send SMS using different providers
const sendSMS = async (mobile, message) => {
  try {
    // Twilio implementation
    if (SMS_API_CONFIG.accountSid && SMS_API_CONFIG.authToken) {
      const twilio = require('twilio')(SMS_API_CONFIG.accountSid, SMS_API_CONFIG.authToken);
      await twilio.messages.create({
        body: message,
        from: SMS_API_CONFIG.fromNumber,
        to: `+91${mobile}`
      });
      return { success: true };
    }
    
    // TextLocal implementation
    if (SMS_API_CONFIG.apiKey) {
      const response = await axios.post('https://api.textlocal.in/send/', {
        apikey: SMS_API_CONFIG.apiKey,
        numbers: mobile,
        message: message,
        sender: SMS_API_CONFIG.sender
      });
      return { success: response.data.status === 'success' };
    }
    
    // MSG91 implementation
    if (SMS_API_CONFIG.authKey) {
      const response = await axios.post('https://api.msg91.com/api/v5/otp', {
        authkey: SMS_API_CONFIG.authKey,
        template_id: SMS_API_CONFIG.templateId,
        mobile: `91${mobile}`,
        otp: message.match(/\d{6}/)[0] // Extract OTP from message
      });
      return { success: response.data.type === 'success' };
    }
    
    // Generic SMS API implementation
    if (SMS_API_CONFIG.apiUrl && SMS_API_CONFIG.apiKey) {
      const response = await axios.post(SMS_API_CONFIG.apiUrl, {
        api_key: SMS_API_CONFIG.apiKey,
        to: mobile,
        message: message
      });
      return { success: response.status === 200 };
    }
    
    // Fallback - log to console (development only)
    console.log(`SMS to ${mobile}: ${message}`);
    return { success: true };
    
  } catch (error) {
    console.error('SMS sending error:', error);
    return { success: false, error: error.message };
  }
};

// Send OTP endpoint
router.post('/send-otp', async (req, res) => {
  try {
    const { name, mobile } = req.body;
    
    if (!name || !mobile) {
      return res.status(400).json({
        success: false,
        message: 'Name and mobile number are required'
      });
    }
    
    // Validate mobile number format
    const mobileRegex = /^[6-9]\d{9}$/;
    if (!mobileRegex.test(mobile)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid mobile number format'
      });
    }
    
    // Generate OTP
    const otp = generateOTP();
    const otpExpiry = Date.now() + 5 * 60 * 1000; // 5 minutes
    
    // Store OTP with user details
    otpStore.set(mobile, {
      otp,
      name: name.trim(),
      expiry: otpExpiry,
      attempts: 0
    });
    
    // Send SMS
    const message = `Hi ${name}, your OTP for login is: ${otp}. Valid for 5 minutes. Do not share with anyone.`;
    const smsResult = await sendSMS(mobile, message);
    
    if (!smsResult.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to send OTP. Please try again.'
      });
    }
    
    res.json({
      success: true,
      message: 'OTP sent successfully'
    });
    
  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Verify OTP endpoint
router.post('/verify-otp', async (req, res) => {
  try {
    const { name, mobile, otp } = req.body;
    
    if (!name || !mobile || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Name, mobile number and OTP are required'
      });
    }
    
    // Get stored OTP data
    const storedData = otpStore.get(mobile);
    
    if (!storedData) {
      return res.status(400).json({
        success: false,
        message: 'OTP not found or expired. Please request a new OTP.'
      });
    }
    
    // Check if OTP is expired
    if (Date.now() > storedData.expiry) {
      otpStore.delete(mobile);
      return res.status(400).json({
        success: false,
        message: 'OTP has expired. Please request a new OTP.'
      });
    }
    
    // Check attempts limit
    if (storedData.attempts >= 3) {
      otpStore.delete(mobile);
      return res.status(400).json({
        success: false,
        message: 'Too many failed attempts. Please request a new OTP.'
      });
    }
    
    // Verify OTP
    if (storedData.otp !== otp.trim()) {
      storedData.attempts += 1;
      return res.status(400).json({
        success: false,
        message: `Invalid OTP. ${3 - storedData.attempts} attempts remaining.`
      });
    }
    
    // OTP verified successfully
    otpStore.delete(mobile);
    
    // Generate user ID (in production, save to database)
    const userId = crypto.randomUUID();
    
    // Check if user exists (mock logic - replace with database query)
    const isNewUser = true; // Set based on your database logic
    
    res.json({
      success: true,
      message: 'OTP verified successfully',
      userId,
      isNewUser,
      user: {
        id: userId,
        name: storedData.name,
        mobile
      }
    });
    
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Resend OTP endpoint
router.post('/resend-otp', async (req, res) => {
  try {
    const { mobile } = req.body;
    
    if (!mobile) {
      return res.status(400).json({
        success: false,
        message: 'Mobile number is required'
      });
    }
    
    const storedData = otpStore.get(mobile);
    if (!storedData) {
      return res.status(400).json({
        success: false,
        message: 'No active OTP session found. Please start login process again.'
      });
    }
    
    // Generate new OTP
    const otp = generateOTP();
    const otpExpiry = Date.now() + 5 * 60 * 1000;
    
    // Update stored data
    storedData.otp = otp;
    storedData.expiry = otpExpiry;
    storedData.attempts = 0;
    
    // Send SMS
    const message = `Hi ${storedData.name}, your new OTP for login is: ${otp}. Valid for 5 minutes.`;
    const smsResult = await sendSMS(mobile, message);
    
    if (!smsResult.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to resend OTP. Please try again.'
      });
    }
    
    res.json({
      success: true,
      message: 'OTP resent successfully'
    });
    
  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;