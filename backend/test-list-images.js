// Test ImageKit image listing functionality
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testImageListing() {
  console.log('📋 Testing ImageKit Image Listing...\n');
  
  try {
    // Start the server
    const app = require('./app');
    const server = app.listen(3004, async () => {
      console.log('🚀 Test server started on port 3004');
      
      try {
        // Test the images endpoint
        console.log('📡 Fetching images from ImageKit...');
        const response = await fetch('http://localhost:3004/api/images');
        
        if (response.ok) {
          const images = await response.json();
          console.log('✅ Image listing successful!');
          console.log(`📁 Found ${images.length} images`);
          
          if (images.length > 0) {
            console.log('\n📷 Sample images:');
            images.slice(0, 3).forEach((img, index) => {
              console.log(`   ${index + 1}. ${img.name || 'Unnamed'}`);
              console.log(`      📎 URL: ${img.url || 'No URL'}`);
              console.log(`      📅 Created: ${img.createdAt || 'Unknown'}`);
              console.log(`      📏 Size: ${img.size ? (img.size / 1024).toFixed(2) + ' KB' : 'Unknown'}`);
              console.log('');
            });
          } else {
            console.log('📭 No images found in ImageKit');
          }
          
        } else {
          const error = await response.text();
          console.log('❌ Image listing failed:', error);
        }
        
      } catch (error) {
        console.error('❌ Test failed:', error.message);
      } finally {
        server.close();
        console.log('🏁 Image listing test completed!');
      }
    });
    
  } catch (error) {
    console.error('❌ Test setup failed:', error.message);
  }
}

testImageListing();