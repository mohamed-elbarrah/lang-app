import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { LessonsModule } from './lessons/lessons.module';
import { AiModule } from './ai/ai.module';
import { AiProvidersModule } from './ai-providers/ai-providers.module';
import { ExamsModule } from './exams/exams.module';
import { ResultsModule } from './results/results.module';
import { StudyModule } from './study/study.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { CommonModule } from './common/common.module';
import { CsrfGuard } from './common/guards/csrf.guard';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    ThrottlerModule.forRoot({
      throttlers: [{
        ttl: 60000,
        limit: 60,
      }],
      getTracker: (req) => req.ip || 'unknown',
    }),
    PrismaModule,
    CommonModule,
    AuthModule,
    UsersModule,
    LessonsModule,
    AiModule,
    AiProvidersModule,
    ExamsModule,
    ResultsModule,
    StudyModule,
    DashboardModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_GUARD,
      useClass: CsrfGuard,
    },
  ],
})
export class AppModule {}
