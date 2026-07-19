import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';

@Injectable()
export class CsrfGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const method = request.method;

    if (method === 'GET' || method === 'HEAD' || method === 'OPTIONS') {
      return true;
    }

    const origin = request.headers.origin;
    const referer = request.headers.referer;

    if (!origin && !referer) {
      return true;
    }

    const allowedOriginsStr = process.env.CORS_ORIGINS || 'http://localhost:3000';
    const allowedOrigins = allowedOriginsStr.split(',').map((o: string) => o.trim());

    const source = origin || referer;
    try {
      const parsed = new URL(source);
      const isAllowed = allowedOrigins.some(
        (allowed: string) => new URL(allowed).origin === parsed.origin,
      );
      if (!isAllowed) {
        throw new ForbiddenException('Cross-site request forbidden');
      }
    } catch {
      if (origin || referer) {
        throw new ForbiddenException('Cross-site request forbidden');
      }
    }

    return true;
  }
}
