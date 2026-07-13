import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis;

// Use a fresh global key so schema changes invalidate the old cached client
const cached = globalForPrisma.__swarnika_prisma_v2;

const prismaConfig = {
  log:
    process.env.NODE_ENV === 'development'
      ? ['error', 'warn']
      : ['error'],
};

export const prisma = cached || new PrismaClient(prismaConfig);

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.__swarnika_prisma_v2 = prisma;
}
