#!/usr/bin/env node

/**
 * Generate a secure JWT secret
 * Run: node scripts/generate-secret.js
 */

const crypto = require('crypto');

function generateSecret(length = 32) {
  return crypto.randomBytes(length).toString('hex');
}

const secret = generateSecret();
console.log('Generated JWT Secret:');
console.log(secret);
console.log('\nAdd this to your .env.local:');
console.log(`JWT_SECRET="${secret}"\n`);
