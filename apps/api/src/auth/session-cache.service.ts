import { Injectable } from '@nestjs/common';
import { AUTH_CONFIG } from './auth.config';

export interface CachedUser {
  id: string;
  name: string | null;
  email: string;
  emailVerified: boolean;
  image: string | null;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CachedSession {
  id: string;
  expiresAt: Date;
  token: string;
  userId: string;
  ipAddress: string | null;
  userAgent: string | null;
}

interface CacheEntry {
  user: CachedUser;
  session: CachedSession;
  expiresAt: number;
}

@Injectable()
export class SessionCacheService {
  private store = new Map<string, CacheEntry>();
  private readonly ttl = AUTH_CONFIG.CACHE_TTL_MS;

  get(token: string): { user: CachedUser; session: CachedSession } | undefined {
    const entry = this.store.get(token);
    if (!entry) return undefined;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(token);
      return undefined;
    }
    return { user: entry.user, session: entry.session };
  }

  set(token: string, data: { user: CachedUser; session: CachedSession }): void {
    this.store.set(token, {
      ...data,
      expiresAt: Date.now() + this.ttl,
    });
  }

  invalidate(token: string): void {
    this.store.delete(token);
  }

  clear(): void {
    this.store.clear();
  }
}
