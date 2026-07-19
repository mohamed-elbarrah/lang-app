import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { PrismaService } from '../prisma/prisma.service';

const COOKIE_NAME = 'better-auth.session_token';

@Injectable()
export class SessionMiddleware implements NestMiddleware {
  private readonly logger = new Logger(SessionMiddleware.name);

  constructor(private prisma: PrismaService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const cookie = req.headers.cookie;
    if (!cookie) return next();

    const match = cookie.match(new RegExp(`${COOKIE_NAME}=([^;]+)`));
    if (!match) return next();

    try {
      const session = await this.prisma.session.findUnique({
        where: { token: match[1] },
        include: { user: true },
      });

      if (session && session.expiresAt > new Date()) {
        (req as any).user = session.user;
        (req as any).session = session;
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
