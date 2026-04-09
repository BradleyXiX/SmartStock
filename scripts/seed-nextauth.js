#!/usr/bin/env node

/**
 * Database Seeding Script for NextAuth.js
 * 
 * Creates test users with various roles for development and testing
 * 
 * Usage:
 *   node scripts/seed-nextauth.js        # Seed default users
 *   node scripts/seed-nextauth.js clean  # Clean and reseed
 *   node scripts/seed-nextauth.js user   # Create single user
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

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
  header: (msg) => console.log(`\n${colors.cyan}${msg}${colors.reset}`);
};

/**
 * Hash password using bcryptjs
 */
async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

/**
 * Check if user exists by email
 */
async function userExists(email) {
  const user = await prisma.user.findUnique({
    where: { email },
  });
  return !!user;
}

/**
 * Create test user
 */
async function createUser(name, email, password, role = 'user') {
  try {
    // Check if user already exists
    if (await userExists(email)) {
      log.warn(`User ${email} already exists, skipping`);
      return null;
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
        active: true,
      },
    });

    log.success(`Created ${role} user: ${email}`);
    log.info(`  Password: ${password}`);

    return user;
  } catch (error) {
    log.error(`Failed to create user ${email}: ${error.message}`);
    return null;
  }
}

/**
 * Seed default test users
 */
async function seedDefaultUsers() {
  log.header('🌱 Seeding Test Users');

  const users = [
    {
      name: 'Admin User',
      email: 'admin@smartstock.local',
      password: 'Admin@123456',
      role: 'admin',
    },
    {
      name: 'Manager User',
      email: 'manager@smartstock.local',
      password: 'Manager@123456',
      role: 'manager',
    },
    {
      name: 'John Doe',
      email: 'john@smartstock.local',
      password: 'John@123456',
      role: 'user',
    },
    {
      name: 'Jane Smith',
      email: 'jane@smartstock.local',
      password: 'Jane@123456',
      role: 'user',
    },
    {
      name: 'Test User',
      email: 'test@example.com',
      password: 'Test@123456',
      role: 'user',
    },
  ];

  let created = 0;
  let skipped = 0;

  for (const userData of users) {
    const user = await createUser(userData.name, userData.email, userData.password, userData.role);
    if (user) {
      created++;
    } else {
      skipped++;
    }
  }

  log.info(`\nSummary: ${created} created, ${skipped} skipped`);
  return created > 0;
}

/**
 * Display seeded users
 */
async function displayUsers() {
  log.header('👥 Current Users in Database');

  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      active: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  if (users.length === 0) {
    log.warn('No users found in database');
    return;
  }

  console.log(`\n${colors.cyan}Total: ${users.length} user(s)${colors.reset}\n`);

  // Table header
  console.log(
    `${colors.cyan}${'Email'.padEnd(30)} | ${'Name'.padEnd(20)} | ${'Role'.padEnd(8)} | Active${colors.reset}`
  );
  console.log('-'.repeat(80));

  // Table rows
  for (const user of users) {
    const status = user.active ? '✓' : '✗';
    console.log(
      `${user.email.padEnd(30)} | ${user.name.padEnd(20)} | ${user.role.padEnd(8)} | ${status}`
    );
  }

  console.log();
}

/**
 * Clean database (delete all users)
 */
async function cleanDatabase() {
  log.header('🗑️  Cleaning Database');

  try {
    // Delete in correct order due to foreign keys
    log.info('Deleting sessions...');
    await prisma.session.deleteMany();

    log.info('Deleting accounts...');
    await prisma.account.deleteMany();

    log.info('Deleting verification tokens...');
    await prisma.verificationToken.deleteMany();

    log.info('Deleting users...');
    const deletedUsers = await prisma.user.deleteMany();

    log.success(`Deleted ${deletedUsers.count} user(s)`);
    log.info('Database is clean');

    return true;
  } catch (error) {
    log.error(`Failed to clean database: ${error.message}`);
    return false;
  }
}

/**
 * Reset database and reseed
 */
async function resetDatabase() {
  log.header('🔄 Resetting Database');

  const cleaned = await cleanDatabase();
  if (!cleaned) return;

  const seeded = await seedDefaultUsers();
  if (seeded) {
    await displayUsers();
  }
}

/**
 * Create single user interactively
 */
async function createSingleUser() {
  log.header('👤 Create New User');

  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const question = (query) =>
    new Promise((resolve) => {
      rl.question(query, resolve);
    });

  try {
    const name = await question('Name: ');
    const email = await question('Email: ');
    const password = await question('Password: ');
    const role = await question('Role (user/manager/admin) [user]: ') || 'user';

    if (!name || !email || !password) {
      log.error('All fields are required');
      rl.close();
      return;
    }

    const user = await createUser(name, email, password, role);
    if (user) {
      log.success('User created successfully');
      log.info(`ID: ${user.id}`);
    }

    rl.close();
  } catch (error) {
    log.error(`Failed: ${error.message}`);
    rl.close();
  }
}

/**
 * Print help
 */
function printHelp() {
  console.log(`
${colors.cyan}NextAuth.js Database Seeding Script${colors.reset}

${colors.green}Usage:${colors.reset}
  node scripts/seed-nextauth.js [command]

${colors.green}Commands:${colors.reset}
  (none)              Show current users and seed if empty
  seed                Seed default test users (if not exist)
  reset               Clean database and reseed
  clean               Delete all users from database
  user                Create single user (interactive)
  list                List all users in database
  help                Show this help message

${colors.green}Default Test Users:${colors.reset}
  • admin@smartstock.local (password: Admin@123456) - admin
  • manager@smartstock.local (password: Manager@123456) - manager
  • john@smartstock.local (password: John@123456) - user
  • jane@smartstock.local (password: Jane@123456) - user
  • test@example.com (password: Test@123456) - user

${colors.green}Examples:${colors.reset}
  node scripts/seed-nextauth.js           # Seed if empty
  node scripts/seed-nextauth.js seed      # Seed all
  node scripts/seed-nextauth.js reset     # Clean and reseed
  node scripts/seed-nextauth.js list      # Show users
  node scripts/seed-nextauth.js user      # Create user
  node scripts/seed-nextauth.js clean     # Delete all

${colors.yellow}Note:${colors.reset}
  Make sure DATABASE_URL is set in .env.local
  Make sure Prisma migrations have been run
  `);
}

/**
 * Main function
 */
async function main() {
  const command = process.argv[2]?.toLowerCase() || 'seed';

  try {
    switch (command) {
      case 'help':
        printHelp();
        break;

      case 'seed':
        await seedDefaultUsers();
        await displayUsers();
        break;

      case 'reset':
        await resetDatabase();
        break;

      case 'clean':
        await cleanDatabase();
        break;

      case 'list':
        await displayUsers();
        break;

      case 'user':
        await createSingleUser();
        break;

      default:
        // Default: display users and seed if empty
        const userCount = await prisma.user.count();
        if (userCount === 0) {
          log.info('No users found, seeding database...\n');
          await seedDefaultUsers();
        }
        await displayUsers();
    }
  } catch (error) {
    log.error(`Fatal error: ${error.message}`);
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
