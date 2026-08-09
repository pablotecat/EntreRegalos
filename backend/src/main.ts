import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Prefijo global de la API
  app.setGlobalPrefix('api/v1');

  // Validación automática de DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Cookie parser para el refresh token HttpOnly
  app.use(cookieParser());

  // CORS: solo permite el origen del frontend
  app.enableCors({
    origin: configService.get<string>('FRONTEND_URL'),
    credentials: true,
  });

  const port = configService.get<number>('PORT') ?? 3001;
  await app.listen(port);
  console.log(`🚀 Backend arrancado en http://localhost:${port}/api/v1`);
}

bootstrap();