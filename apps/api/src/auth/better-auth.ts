import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { PrismaClient } from '@prisma/client';
import { AUTH_CONFIG } from './auth.config';

let authInstance: any = null;

function getFrontendUrl(): string {
  return process.env.FRONTEND_URL || 'http://localhost:3000';
}

function rewriteResetUrl(betterAuthUrl: string): string {
  const url = new URL(betterAuthUrl);
  const tokenMatch = url.pathname.match(/\/reset-password\/(.+)$/);
  const token = tokenMatch ? tokenMatch[1] : null;
  const frontend = getFrontendUrl();
  return `${frontend}/reset-password${token ? `?token=${token}` : ''}`;
}

function sendPasswordResetEmail(email: string, url: string): void {
  const frontendUrl = rewriteResetUrl(url);
  const logger = console;
  logger.log('========================================');
  logger.log(`PASSWORD RESET REQUESTED for: ${email}`);
  logger.log(`Reset URL: ${frontendUrl}`);
  logger.log('========================================');
  logger.log('NOTE: Configure a real email service in better-auth.ts to send this automatically.');
}

export function createAuth(prisma: PrismaClient) {
  const instance = betterAuth({
    database: prismaAdapter(prisma, { provider: 'postgresql' }),
    emailAndPassword: {
      enabled: true,
      sendResetPassword: async ({ user, url }) => {
        sendPasswordResetEmail(user.email, url);
      },
    },
    user: {
      additionalFields: {
        role: {
          type: 'string',
          required: true,
          defaultValue: 'user',
          input: false,
          returned: true,
        },
      },
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
