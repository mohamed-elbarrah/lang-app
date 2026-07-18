import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { SessionMiddleware } from './session.middleware';
import { AuthController } from './auth.controller';

@Module({
  controllers: [AuthController],
})
export class AuthModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(SessionMiddleware).forRoutes('{*path}');
  }
}
