import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';

@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');

  use(req: Request, res: Response, next: NextFunction) {
    const requestId = randomUUID();
    const start = Date.now();
    const { method, originalUrl } = req;

    res.setHeader('X-Request-Id', requestId);

    res.on('finish', () => {
      const duration = Date.now() - start;
      const { statusCode } = res;
      this.logger.log(`${method} ${originalUrl} ${statusCode} ${duration}ms [${requestId}]`);
    });

    next();
  }
}
