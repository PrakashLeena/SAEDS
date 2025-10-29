require('dotenv').config();
const cloudinary = require('./config/cloudinary');

console.log('\n🔍 Testing Cloudinary Configuration...\n');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME || '❌ NOT SET');
console.log('API Key:', process.env.CLOUDINARY_API_KEY || '❌ NOT SET');
console.log('API Secret:', process.env.CLOUDINARY_API_SECRET ? '✅ Set (hidden)' : '❌ NOT SET');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

// Test connection
console.log('Testing connection to Cloudinary...\n');

cloudinary.api.ping()
  .then(result => {
    console.log('✅ SUCCESS! Cloudinary connected successfully!\n');
    console.log('Response:', result);
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ Cloudinary is properly configured!');
    console.log('✅ Image uploads should work!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ FAILED! Cloudinary connection error!\n');
    console.error('Error:', error.message);
    console.error('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error('❌ Cloudinary is NOT configured correctly!');
    console.error('\n💡 Possible fixes:');
    console.error('   1. Check .env file has all 3 Cloudinary variables');
    console.error('   2. Verify credentials at https://cloudinary.com/console');
    console.error('   3. Check for typos in environment variables');
    console.error('   4. Restart backend after changing .env');
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    process.exit(1);
  });
