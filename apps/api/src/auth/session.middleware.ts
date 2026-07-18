import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SessionMiddleware implements NestMiddleware {
  constructor(private prisma: PrismaService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const cookie = req.headers.cookie;
    if (!cookie) return next();

    const match = cookie.match(/better-auth\.session_token=([^;]+)/);
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
    } catch {
      // ignore
    }

    next();
  }
}
