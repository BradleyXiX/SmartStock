import { PrismaClient } from '@prisma/client';

/**
 * Instantiate Prisma Client
 *
 * In Prisma 7, the DATABASE_URL is passed directly to the PrismaClient constructor
 * to establish a connection with the database.
 */
const client = global.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  global.prisma = client;
}

export default client;
