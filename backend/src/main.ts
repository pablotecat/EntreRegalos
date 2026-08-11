import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

export async function createApp() {
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

  return { app, configService };
}

async function bootstrap() {
  const { app, configService } = await createApp();
  const port = configService.get<number>('PORT') ?? 3001;
  await app.listen(port);
  console.log(`🚀 Backend arrancado en http://localhost:${port}/api/v1`);
}

// En HelioHost con Passenger no arrancamos el servidor aquí;
// passenger.js importa createApp() y lo hace desde la raíz.
if (process.env.PASSENGER !== 'true') {
  bootstrap();
}