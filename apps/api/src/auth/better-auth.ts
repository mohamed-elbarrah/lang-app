import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { PrismaClient } from '@prisma/client';
import { AUTH_CONFIG } from './auth.config';

let authInstance: any = null;

export function createAuth(prisma: PrismaClient) {
  const instance = betterAuth({
    database: prismaAdapter(prisma, { provider: 'postgresql' }),
    emailAndPassword: {
      enabled: true,
    },
    session: {
      expiresIn: AUTH_CONFIG.SESSION_EXPIRES_IN,
      updateAge: AUTH_CONFIG.SESSION_UPDATE_AGE,
    },
    secret: process.env.BETTER_AUTH_SECRET,
    baseURL: process.env.BETTER_AUTH_URL,
  });
  authInstance = instance;
  return instance;
}

export function getAuth() {
  if (!authInstance) {
    throw new Error('Auth not initialized. Call createAuth first.');
  }
  return authInstance;
}
