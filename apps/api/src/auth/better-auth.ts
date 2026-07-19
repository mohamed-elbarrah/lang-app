import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { PrismaClient } from '@prisma/client';

// Better Auth requires a synchronous PrismaClient at import/initialization time,
// so we create a separate instance here rather than using DI.
// This is an accepted limitation — the PrismaService singleton used elsewhere
// (controllers, middleware) is not shared with better-auth internals.
const prisma = new PrismaClient();

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  emailAndPassword: {
    enabled: true,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7,
  },
});
