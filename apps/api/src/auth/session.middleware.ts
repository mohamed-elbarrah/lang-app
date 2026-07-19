import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import type { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service';
import { AUTH_CONFIG } from './auth.config';

@Injectable()
export class SessionMiddleware implements NestMiddleware {
  private readonly logger = new Logger(SessionMiddleware.name);

  constructor(private readonly auth: AuthService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const token =
      req.cookies?.[AUTH_CONFIG.COOKIE_NAME] ??
      req.headers.authorization?.replace('Bearer ', '');

    if (!token) return next();

    try {
      const session = await this.auth.validateSession(token);

      if (session) {
        (req as any).user = session.user;
        (req as any).session = session.session;
      }
    } catch (error) {
      this.logger.error(
        `Session lookup failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error.stack : undefined,
      );
    }

    next();
  }
}
