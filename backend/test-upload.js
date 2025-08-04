// Test actual image upload to ImageKit
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testImageUpload() {
  console.log('🖼️  Testing ImageKit Upload Functionality...\n');
  
  try {
    // Create a simple test image buffer (1x1 pixel PNG)
    const testImageBuffer = Buffer.from([
      0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D,
      0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
      0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, 0xDE, 0x00, 0x00, 0x00,
      0x0C, 0x49, 0x44, 0x41, 0x54, 0x08, 0xD7, 0x63, 0xF8, 0x00, 0x00, 0x00,
      0x01, 0x00, 0x01, 0x5C, 0xC2, 0x5D, 0xB4, 0x00, 0x00, 0x00, 0x00, 0x49,
      0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82
    ]);
    
    // Start the server
    const app = require('./app');
    const server = app.listen(3003, async () => {
      console.log('🚀 Test server started on port 3003');
      
      try {
        // Create form data
        const form = new FormData();
        form.append('image', testImageBuffer, {
          filename: 'test-image.png',
          contentType: 'image/png'
        });
        
        // Upload the test image
        console.log('📤 Uploading test image...');
        const response = await fetch('http://localhost:3003/api/upload', {
          method: 'POST',
          body: form
        });
        
        const result = await response.json();
        
        if (response.ok) {
          console.log('✅ Upload successful!');
          console.log('📷 Image URL:', result.imageUrl);
          console.log('🆔 File ID:', result.fileId);
          console.log('📁 File Path:', result.filePath);
          
          // Test delete functionality
          console.log('\n🗑️  Testing delete functionality...');
          const deleteResponse = await fetch(`http://localhost:3003/api/delete/${result.fileId}`, {
            method: 'DELETE'
          });
          
          if (deleteResponse.ok) {
            console.log('✅ Delete successful!');
          } else {
            console.log('⚠️  Delete failed:', await deleteResponse.text());
          }
          
        } else {
          console.log('❌ Upload failed:', result);
        }
        
      } catch (error) {
        console.error('❌ Test failed:', error.message);
      } finally {
        server.close();
        console.log('\n🏁 Upload test completed!');
      }
    });
    
  } catch (error) {
    console.error('❌ Test setup failed:', error.message);
  }
}

testImageUpload();