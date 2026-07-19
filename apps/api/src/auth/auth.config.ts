import { CookieOptions } from 'express';

const isProduction = process.env.NODE_ENV === 'production';

export const AUTH_CONFIG = {
  COOKIE_NAME: 'better-auth.session_token',
  SESSION_EXPIRES_IN: 60 * 60 * 24 * 7,
  SESSION_UPDATE_AGE: 60 * 60 * 24,
  CACHE_TTL_MS: 5 * 60 * 1000,
} as const;

export function getCookieOptions(maxAge?: number): CookieOptions {
  return {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    secure: isProduction,
    maxAge: maxAge ?? AUTH_CONFIG.SESSION_EXPIRES_IN * 1000,
  };
}
