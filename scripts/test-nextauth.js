#!/usr/bin/env node

/**
 * NextAuth.js Testing Utility
 * 
 * Usage:
 *   node scripts/test-nextauth.js help
 *   node scripts/test-nextauth.js register
 *   node scripts/test-nextauth.js signin
 *   node scripts/test-nextauth.js session
 *   node scripts/test-nextauth.js cleanup
 */

const http = require('http');
const querystring = require('querystring');

const BASE_URL = process.env.NEXTAUTH_URL || 'http://localhost:3000';

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

const log = {
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  warn: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  header: (msg) => console.log(`\n${colors.cyan}${msg}${colors.reset}`),
};

/**
 * Make HTTP request
 */
function makeRequest(method, path, data = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    };

    const req = http.request(url, options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          const parsed = body ? JSON.parse(body) : {};
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: parsed,
            rawBody: body,
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: null,
            rawBody: body,
          });
        }
      });
    });

    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

/**
 * Test registration endpoint
 */
async function testRegistration() {
  log.header('📝 Testing User Registration');

  const testUser = {
    name: 'Test User',
    email: `testuser-${Date.now()}@example.com`,
    password: 'TestPassword123',
    confirmPassword: 'TestPassword123',
  };

  log.info(`Registering user: ${testUser.email}`);

  try {
    const response = await makeRequest('POST', '/api/auth/register', testUser);

    if (response.status === 201 || response.status === 200) {
      log.success('User registered successfully');
      log.info(`Email: ${testUser.email}`);
      log.info(`Password: ${testUser.password}`);
      return testUser;
    } else {
      log.error(`Registration failed (${response.status})`);
      log.error(`Response: ${JSON.stringify(response.body, null, 2)}`);
      return null;
    }
  } catch (err) {
    log.error(`Request failed: ${err.message}`);
    return null;
  }
}

/**
 * Test sign-in endpoint
 */
async function testSignIn(email, password) {
  log.header('🔐 Testing User Sign-In');

  log.info(`Signing in as: ${email}`);

  try {
    const response = await makeRequest('POST', '/api/auth/callback/credentials', {
      email,
      password,
    });

    if (response.status === 200) {
      log.success('Sign-in successful');
      log.info(`Session token received`);
      
      // Extract session token from cookies
      const setCookie = response.headers['set-cookie'];
      if (setCookie) {
        log.info(`Cookies set: ${setCookie.length} cookie(s)`);
      }
      
      return response;
    } else {
      log.error(`Sign-in failed (${response.status})`);
      log.error(`Response: ${JSON.stringify(response.body, null, 2)}`);
      return null;
    }
  } catch (err) {
    log.error(`Request failed: ${err.message}`);
    return null;
  }
}

/**
 * Test session endpoint
 */
async function testSession(cookies = '') {
  log.header('📋 Testing Session Endpoint');

  const headers = cookies ? { 'Cookie': cookies } : {};

  try {
    const response = await makeRequest('GET', '/api/auth/session', null, headers);

    if (response.status === 200 && response.body.user) {
      log.success('Session retrieved successfully');
      log.info(`User: ${response.body.user.name}`);
      log.info(`Email: ${response.body.user.email}`);
      log.info(`Role: ${response.body.user.role}`);
      
      if (response.body.expires) {
        const expiresDate = new Date(response.body.expires);
        log.info(`Expires: ${expiresDate.toLocaleString()}`);
      }
    } else {
      log.warn('No active session');
    }
  } catch (err) {
    log.error(`Request failed: ${err.message}`);
  }
}

/**
 * Test error scenarios
 */
async function testErrors() {
  log.header('🚨 Testing Error Scenarios');

  // Test 1: Wrong password
  log.info('Test 1: Wrong password');
  const response1 = await makeRequest('POST', '/api/auth/callback/credentials', {
    email: 'test@example.com',
    password: 'WrongPassword',
  });
  log.info(`Status: ${response1.status}`);
  log.info(`Response: ${JSON.stringify(response1.body, null, 2)}`);

  // Test 2: Non-existent user
  log.info('\nTest 2: Non-existent user');
  const response2 = await makeRequest('POST', '/api/auth/callback/credentials', {
    email: 'nonexistent@example.com',
    password: 'SomePassword',
  });
  log.info(`Status: ${response2.status}`);
  log.info(`Response: ${JSON.stringify(response2.body, null, 2)}`);

  // Test 3: Password mismatch in registration
  log.info('\nTest 3: Password mismatch in registration');
  const response3 = await makeRequest('POST', '/api/auth/register', {
    name: 'Test User',
    email: `testuser-${Date.now()}@example.com`,
    password: 'Password123',
    confirmPassword: 'Different123',
  });
  log.info(`Status: ${response3.status}`);
  log.info(`Response: ${JSON.stringify(response3.body, null, 2)}`);

  // Test 4: Duplicate email
  log.info('\nTest 4: Duplicate email registration');
  const response4 = await makeRequest('POST', '/api/auth/register', {
    name: 'Another User',
    email: 'existing@example.com',
    password: 'Password123',
    confirmPassword: 'Password123',
  });
  log.info(`Status: ${response4.status}`);
  log.info(`Response: ${JSON.stringify(response4.body, null, 2)}`);
}

/**
 * Print help
 */
function printHelp() {
  console.log(`
${colors.cyan}NextAuth.js Testing Utility${colors.reset}

${colors.green}Usage:${colors.reset}
  node scripts/test-nextauth.js <command>

${colors.green}Commands:${colors.reset}
  help              Show this help message
  register          Test user registration
  signin            Test user sign-in
  session           Test session retrieval
  errors            Test error scenarios
  flow              Test complete auth flow (register → signin → session)

${colors.green}Examples:${colors.reset}
  node scripts/test-nextauth.js register
  node scripts/test-nextauth.js signin
  node scripts/test-nextauth.js flow

${colors.green}Environment:${colors.reset}
  NEXTAUTH_URL      Base URL (default: http://localhost:3000)

${colors.yellow}Note:${colors.reset}
  Make sure the Next.js server is running on port 3000:
  npm run dev
  `);
}

/**
 * Test complete authentication flow
 */
async function testCompleteFlow() {
  log.header('🔄 Testing Complete Authentication Flow');

  // Step 1: Register
  log.info('Step 1: Register new user');
  const testUser = await testRegistration();
  if (!testUser) {
    log.error('Registration failed, aborting flow test');
    return;
  }

  // Step 2: Sign in
  log.info('\nStep 2: Sign in with registered user');
  const signInResponse = await testSignIn(testUser.email, testUser.password);
  if (!signInResponse) {
    log.error('Sign-in failed, aborting flow test');
    return;
  }

  // Step 3: Verify session
  log.info('\nStep 3: Verify session');
  const cookies = signInResponse.headers['set-cookie'];
  if (cookies) {
    await testSession(Array.isArray(cookies) ? cookies.join('; ') : cookies);
  } else {
    log.warn('No cookies in sign-in response');
  }

  log.header('✅ Flow Test Complete');
}

/**
 * Main entry point
 */
async function main() {
  const command = process.argv[2] || 'help';

  log.info(`Base URL: ${BASE_URL}\n`);

  switch (command.toLowerCase()) {
    case 'help':
      printHelp();
      break;

    case 'register':
      await testRegistration();
      break;

    case 'signin':
      // For signin test without registration, we'd need a pre-existing user
      log.warn('Please provide email and password:');
      log.info('Example: node scripts/test-nextauth.js signin test@example.com password123');
      const email = process.argv[3];
      const password = process.argv[4];
      if (email && password) {
        await testSignIn(email, password);
      }
      break;

    case 'session':
      await testSession();
      break;

    case 'errors':
      await testErrors();
      break;

    case 'flow':
      await testCompleteFlow();
      break;

    default:
      log.error(`Unknown command: ${command}`);
      printHelp();
  }
}

main().catch((err) => {
  log.error(`Fatal error: ${err.message}`);
  process.exit(1);
});
