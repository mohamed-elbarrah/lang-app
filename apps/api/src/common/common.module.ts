import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { HttpExceptionFilter } from './filters/http-exception.filter';
import { RequestIdMiddleware } from './middleware/request-id.middleware';

@Module({
  providers: [
    { provide: APP_FILTER, useClass: HttpExceptionFilter },
  ],
})
export class CommonModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestIdMiddleware).forRoutes('{*path}');
  }
}
