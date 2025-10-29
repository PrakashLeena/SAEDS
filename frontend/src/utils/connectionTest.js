// Connection Test Utility
// Add this to your app temporarily to debug connection issues

export const testBackendConnection = async () => {
  const API_URL = process.env.REACT_APP_API_URL || '/api';
  
  console.log('🔍 Testing Backend Connection...');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📍 API URL:', API_URL);
  console.log('🌍 Environment:', process.env.NODE_ENV);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  // Check if environment variables are set
  console.log('\n📋 Environment Variables Check:');
  console.log('REACT_APP_API_URL:', process.env.REACT_APP_API_URL ? '✅ Set' : '❌ Missing');
  console.log('REACT_APP_FIREBASE_API_KEY:', process.env.REACT_APP_FIREBASE_API_KEY ? '✅ Set' : '❌ Missing');
  console.log('REACT_APP_FIREBASE_AUTH_DOMAIN:', process.env.REACT_APP_FIREBASE_AUTH_DOMAIN ? '✅ Set' : '❌ Missing');
  console.log('REACT_APP_FIREBASE_PROJECT_ID:', process.env.REACT_APP_FIREBASE_PROJECT_ID ? '✅ Set' : '❌ Missing');
  console.log('REACT_APP_FIREBASE_STORAGE_BUCKET:', process.env.REACT_APP_FIREBASE_STORAGE_BUCKET ? '✅ Set' : '❌ Missing');
  console.log('REACT_APP_FIREBASE_MESSAGING_SENDER_ID:', process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID ? '✅ Set' : '❌ Missing');
  console.log('REACT_APP_FIREBASE_APP_ID:', process.env.REACT_APP_FIREBASE_APP_ID ? '✅ Set' : '❌ Missing');
  console.log('REACT_APP_FIREBASE_MEASUREMENT_ID:', process.env.REACT_APP_FIREBASE_MEASUREMENT_ID ? '✅ Set' : '❌ Missing');
  
  // Test backend health endpoint
  console.log('\n🏥 Testing Backend Health Endpoint...');
  try {
    const response = await fetch(`${API_URL}/health`);
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Backend is reachable!');
      console.log('📦 Response:', data);
      console.log('🎉 Connection test PASSED!');
      return { success: true, data };
    } else {
      console.error('❌ Backend returned error status:', response.status);
      console.error('📦 Response:', data);
      return { success: false, error: `HTTP ${response.status}`, data };
    }
  } catch (error) {
    console.error('❌ Failed to connect to backend!');
    console.error('🔴 Error:', error.message);
    console.error('\n💡 Possible causes:');
    console.error('   1. REACT_APP_API_URL is not set or incorrect');
    console.error('   2. Backend is not deployed or not running');
    console.error('   3. CORS is blocking the request');
    console.error('   4. Network connectivity issue');
    console.error('\n🔧 To fix:');
    console.error('   1. Check Vercel environment variables');
    console.error('   2. Verify backend URL is correct');
    console.error('   3. Check backend FRONTEND_URL setting');
    console.error('   4. Redeploy after changing environment variables');
    return { success: false, error: error.message };
  }
};

export const testAPIEndpoints = async () => {
  const API_URL = process.env.REACT_APP_API_URL || '/api';
  
  console.log('\n🧪 Testing API Endpoints...');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  const endpoints = [
    { name: 'Health', path: '/health' },
    { name: 'Stats', path: '/stats' },
    { name: 'Books', path: '/books?limit=1' },
    { name: 'Activities', path: '/activities?limit=1' },
  ];
  
  const results = [];
  
  for (const endpoint of endpoints) {
    try {
      const response = await fetch(`${API_URL}${endpoint.path}`);
      const status = response.ok ? '✅' : '❌';
      console.log(`${status} ${endpoint.name}: ${response.status} ${response.statusText}`);
      results.push({ ...endpoint, status: response.status, ok: response.ok });
    } catch (error) {
      console.log(`❌ ${endpoint.name}: Failed - ${error.message}`);
      results.push({ ...endpoint, status: 'error', ok: false, error: error.message });
    }
  }
  
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  const allPassed = results.every(r => r.ok);
  if (allPassed) {
    console.log('🎉 All endpoints are working!');
  } else {
    console.log('⚠️ Some endpoints failed. Check backend logs.');
  }
  
  return results;
};

export const printConnectionGuide = () => {
  console.log('\n📖 Connection Setup Guide');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('\n1️⃣ Backend Vercel Environment Variables:');
  console.log('   FRONTEND_URL=https://your-frontend.vercel.app');
  console.log('   MONGODB_URI=your_mongodb_connection_string');
  console.log('   NODE_ENV=production');
  console.log('   + Cloudinary and Email variables');
  console.log('\n2️⃣ Frontend Vercel Environment Variables:');
  console.log('   REACT_APP_API_URL=https://your-backend.vercel.app/api');
  console.log('   + All REACT_APP_FIREBASE_* variables');
  console.log('\n3️⃣ Firebase Console:');
  console.log('   Add your Vercel domain to Authorized Domains');
  console.log('   https://console.firebase.google.com/project/saeds-c04b1');
  console.log('\n4️⃣ After changing environment variables:');
  console.log('   Redeploy both projects in Vercel');
  console.log('\n📚 See VERCEL_CONNECTION_FIX.md for detailed instructions');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
};

// Run all tests
export const runAllTests = async () => {
  console.clear();
  console.log('🚀 SAEDS Connection Diagnostic Tool');
  console.log('═══════════════════════════════════════════════════\n');
  
  printConnectionGuide();
  await testBackendConnection();
  await testAPIEndpoints();
  
  console.log('\n═══════════════════════════════════════════════════');
  console.log('✨ Diagnostic complete!');
  console.log('═══════════════════════════════════════════════════\n');
};

// Export for use in browser console
if (typeof window !== 'undefined') {
  window.testConnection = runAllTests;
  window.testBackend = testBackendConnection;
  window.testEndpoints = testAPIEndpoints;
  window.connectionGuide = printConnectionGuide;
}

export default {
  testBackendConnection,
  testAPIEndpoints,
  printConnectionGuide,
  runAllTests,
};
