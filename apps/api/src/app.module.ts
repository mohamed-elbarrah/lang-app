import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { LessonsModule } from './lessons/lessons.module';
import { AiModule } from './ai/ai.module';
import { AiProvidersModule } from './ai-providers/ai-providers.module';
import { ExamsModule } from './exams/exams.module';
import { ResultsModule } from './results/results.module';
import { CommonModule } from './common/common.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    PrismaModule,
    CommonModule,
    AuthModule,
    UsersModule,
    LessonsModule,
    AiModule,
    AiProvidersModule,
    ExamsModule,
    ResultsModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
