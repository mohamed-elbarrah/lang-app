import { Module, MiddlewareConsumer, NestModule, RequestMethod } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { createAuth } from './better-auth';
import { SessionCacheService } from './session-cache.service';
import { AuthService } from './auth.service';
import { SessionMiddleware } from './session.middleware';
import { AuthController } from './auth.controller';

@Module({
  controllers: [AuthController],
  providers: [SessionCacheService, AuthService, SessionMiddleware],
})
export class AuthModule implements NestModule {
  constructor(private readonly prisma: PrismaService) {
    createAuth(this.prisma);
  }

  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(SessionMiddleware)
      .exclude(
        { path: 'health', method: RequestMethod.GET },
        { path: 'signup', method: RequestMethod.POST },
        { path: 'signin', method: RequestMethod.POST },
        { path: 'signout', method: RequestMethod.POST },
      )
      .forRoutes('{*path}');
  }
}
