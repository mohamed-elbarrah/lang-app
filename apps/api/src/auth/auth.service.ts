import { Injectable } from '@nestjs/common';
import { getAuth } from './better-auth';
import { PrismaService } from '../prisma/prisma.service';
import { SessionCacheService, CachedUser, CachedSession } from './session-cache.service';
import { AUTH_CONFIG } from './auth.config';
import { SignUpDto } from '../common/dto/signup.dto';
import { SignInDto } from '../common/dto/signin.dto';

function cookieHeader(token: string): Record<string, string> {
  return { cookie: `${AUTH_CONFIG.COOKIE_NAME}=${token}` };
}

interface AuthResult<T = any> {
  headers: Headers;
  response: T;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly cache: SessionCacheService,
    private readonly prisma: PrismaService,
  ) {}

  private async enrichUserWithRole<T extends { id: string }>(user: T): Promise<T & { role: string }> {
    const dbUser = await this.prisma.user.findUnique({
      where: { id: user.id },
      select: { role: true },
    });
    return { ...user, role: dbUser?.role ?? 'user' };
  }

  async validateSession(token: string) {
    const cached = this.cache.get(token);
    if (cached) return cached;

    const auth = getAuth();
    const result = await auth.api.getSession({ headers: cookieHeader(token) });

    if (result) {
      const enrichedUser = await this.enrichUserWithRole(result.user);
      const enriched = { user: enrichedUser as CachedUser, session: result.session as CachedSession };
      this.cache.set(token, enriched);
      return enriched;
    }

    return result;
  }

  async signUp(dto: SignUpDto) {
    const auth = getAuth();
    const result = await auth.api.signUpEmail({
      body: {
        email: dto.email.toLowerCase(),
        password: dto.password,
        name: dto.name || dto.email.split('@')[0],
      },
      returnHeaders: true,
    }) as unknown as AuthResult;

    const enrichedUser = await this.enrichUserWithRole(result.response.user);
    result.response.user = enrichedUser;
    return result;
  }

  async signIn(dto: SignInDto) {
    const auth = getAuth();
    const result = await auth.api.signInEmail({
      body: {
        email: dto.email.toLowerCase(),
        password: dto.password,
      },
      returnHeaders: true,
    }) as unknown as AuthResult;

    const enrichedUser = await this.enrichUserWithRole(result.response.user);
    result.response.user = enrichedUser;
    return result;
  }

  async signOut(token: string) {
    this.cache.invalidate(token);
    const auth = getAuth();
    return auth.api.signOut({
      headers: cookieHeader(token),
      returnHeaders: true,
    }) as unknown as AuthResult;
  }

  invalidateSession(token: string) {
    this.cache.invalidate(token);
  }
}
