// test-jwt.js
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'f47ac10b-58cc-4372-a567-0e02b2c3d479';
const testUserId = '65a1b2c3d4e5f67890a1b2c3';

console.log('Testing JWT with secret:', JWT_SECRET);

// Generate token
const token = jwt.sign({ userId: testUserId }, JWT_SECRET, { expiresIn: '7d' });
console.log('Generated token:', token);

// Verify token
try {
  const decoded = jwt.verify(token, JWT_SECRET);
  console.log('Token verified successfully:', decoded);
} catch (error) {
  console.error('Verification failed:', error.message);
}