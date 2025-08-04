// Test the API endpoint directly
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testDirectAPI() {
  console.log('🔧 Testing API endpoint directly...\n');
  
  try {
    // Start the server
    const app = require('./app');
    const server = app.listen(3005, async () => {
      console.log('🚀 Test server started on port 3005');
      
      try {
        // Test the images endpoint with detailed logging
        console.log('📡 Making request to /api/images...');
        const response = await fetch('http://localhost:3005/api/images');
        
        console.log('📊 Response status:', response.status);
        console.log('📋 Response headers:', Object.fromEntries(response.headers));
        
        const responseText = await response.text();
        console.log('📄 Response body:', responseText);
        
        if (response.ok) {
          try {
            const data = JSON.parse(responseText);
            console.log('✅ Parsed JSON successfully:', data);
          } catch (parseError) {
            console.log('❌ Failed to parse JSON:', parseError.message);
          }
        }
        
      } catch (error) {
        console.error('❌ Request failed:', error.message);
      } finally {
        server.close();
        console.log('\n🏁 Direct API test completed!');
      }
    });
    
  } catch (error) {
    console.error('❌ Test setup failed:', error.message);
  }
}

testDirectAPI();