// Test ImageKit integration
const imagekit = require('./config/imagekit');

async function testImageKit() {
  console.log('🧪 Testing ImageKit Integration...\n');
  
  try {
    // Test 1: Check configuration
    console.log('1️⃣ Testing ImageKit Configuration...');
    console.log('   Public Key:', process.env.IMAGEKIT_PUBLIC_KEY ? '✅ Set' : '❌ Missing');
    console.log('   Private Key:', process.env.IMAGEKIT_PRIVATE_KEY ? '✅ Set' : '❌ Missing');
    console.log('   URL Endpoint:', process.env.IMAGEKIT_URL_ENDPOINT ? '✅ Set' : '❌ Missing');
    
    if (!process.env.IMAGEKIT_PUBLIC_KEY || !process.env.IMAGEKIT_PRIVATE_KEY || !process.env.IMAGEKIT_URL_ENDPOINT) {
      console.log('\n❌ ImageKit environment variables are not set!');
      console.log('Please add the following to your .env file:');
      console.log('IMAGEKIT_PUBLIC_KEY=your_public_key');
      console.log('IMAGEKIT_PRIVATE_KEY=your_private_key');
      console.log('IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your_imagekit_id');
      return;
    }
    
    // Test 2: Test connection by listing files
    console.log('\n2️⃣ Testing ImageKit Connection...');
    const files = await imagekit.listFiles({
      limit: 5
    });
    console.log('   ✅ Connection successful!');
    console.log(`   📁 Found ${files.length} files in ImageKit`);
    
    // Test 3: Test authentication parameters
    console.log('\n3️⃣ Testing Authentication Parameters...');
    const authParams = imagekit.getAuthenticationParameters();
    console.log('   ✅ Authentication parameters generated');
    console.log('   🔑 Token:', authParams.token ? 'Generated' : 'Failed');
    console.log('   ⏰ Expires:', new Date(authParams.expire * 1000).toLocaleString());
    console.log('   🔐 Signature:', authParams.signature ? 'Generated' : 'Failed');
    
    // Test 4: Test upload endpoint (without actually uploading)
    console.log('\n4️⃣ Testing Upload Route...');
    const app = require('./app');
    const request = require('http');
    
    const server = app.listen(3002, () => {
      console.log('   🚀 Test server started on port 3002');
      
      // Test upload endpoint availability
      const options = {
        hostname: 'localhost',
        port: 3002,
        path: '/api/upload',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      };
      
      const req = request.request(options, (res) => {
        console.log(`   📡 Upload endpoint status: ${res.statusCode}`);
        if (res.statusCode === 400) {
          console.log('   ✅ Upload endpoint is working (expected 400 for no file)');
        } else {
          console.log('   ⚠️  Unexpected status code');
        }
        server.close();
        console.log('\n🎉 ImageKit integration test completed!');
      });
      
      req.on('error', (e) => {
        console.error('   ❌ Upload endpoint test failed:', e.message);
        server.close();
      });
      
      req.end();
    });
    
  } catch (error) {
    console.error('\n❌ ImageKit test failed:', error.message);
    console.error('Error details:', error);
  }
}

// Run the test
testImageKit();