import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    // Variables de entorno disponibles globalmente
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    // Prisma disponible globalmente
    PrismaModule,
  ],
})
export class AppModule {}