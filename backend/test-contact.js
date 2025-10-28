// Quick test script for contact endpoint
const testData = {
  name: 'Test User',
  email: 'test@example.com',
  subject: 'Test Subject',
  message: 'This is a test message',
  phone: '1234567890'
};

fetch('http://localhost:5000/api/contact', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(testData),
})
  .then(res => res.json())
  .then(data => {
    console.log('✅ Success:', data);
  })
  .catch(error => {
    console.error('❌ Error:', error.message);
  });
