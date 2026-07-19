import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { validateEnv } from './config/env.config';

async function bootstrap() {
  const env = validateEnv();

  const app = await NestFactory.create(AppModule);

  const allowedOrigins = env.CORS_ORIGINS.split(',').map((o) => o.trim());

  app.getHttpAdapter().getInstance().set('trust proxy', 1);
  app.use(helmet());
  app.use(cookieParser());

  app.setGlobalPrefix('api');
  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.enableShutdownHooks();

  await app.listen(env.PORT);
  console.log(`API running on http://localhost:${env.PORT}`);
}
bootstrap();
