const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api/auth';
const TEST_MOBILE = '9876543210';

async function testAuth() {
  try {
    console.log('🧪 Testing Authentication Endpoints...\n');

    // Test 1: Send OTP
    console.log('1. Testing Send OTP...');
    const sendOtpResponse = await axios.post(`${BASE_URL}/send-otp`, {
      mobile: TEST_MOBILE
    });
    console.log('✅ Send OTP Response:', sendOtpResponse.data);

    // Get OTP from console (in real app, this would come from SMS)
    const otp = '123456'; // You'll need to check the server console for the actual OTP

    console.log('\n2. Testing Verify OTP...');
    console.log('⚠️  Please check the server console for the OTP and update the test script');
    
    // Uncomment and update OTP to test verification
    /*
    const verifyOtpResponse = await axios.post(`${BASE_URL}/verify-otp`, {
      mobile: TEST_MOBILE,
      otp: otp // Update this with the actual OTP from server console
    });
    console.log('✅ Verify OTP Response:', verifyOtpResponse.data);

    if (verifyOtpResponse.data.isNewUser) {
      console.log('\n3. Testing Complete Profile...');
      const completeProfileResponse = await axios.post(`${BASE_URL}/complete-profile`, {
        userId: verifyOtpResponse.data.userId,
        name: 'Test User',
        email: 'test@example.com',
        dob: '1990-01-01',
        gender: 'male'
      });
      console.log('✅ Complete Profile Response:', completeProfileResponse.data);
    }
    */

  } catch (error) {
    console.error('❌ Test Error:', error.response?.data || error.message);
  }
}

// Run tests
testAuth();