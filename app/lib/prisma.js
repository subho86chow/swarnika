import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis;

// Use a fresh global key so schema changes invalidate the old cached client
const cached = globalForPrisma.__swarnika_prisma;

export const prisma =
  cached ||
  new PrismaClient({
    log: ['query'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.__swarnika_prisma = prisma;
}
