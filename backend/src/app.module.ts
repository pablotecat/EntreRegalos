import { Module, Controller, Get } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AuthModule } from './auth/auth.module';
import { InvitationsModule } from './invitations/invitations.module';
import { ItemsModule } from './items/items.module';
import { ListsModule } from './lists/lists.module';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';

export const PUBLIC_PATH = join(__dirname, '..', 'public');

@Controller()
class HealthController {
  @Get('health')
  health() {
    return { status: 'ok', service: 'entreregalos-backend' };
  }
}

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    // Sirve el frontend compilado (backend/public) y hace fallback a index.html
    // en cualquier ruta que no empiece por /api/v1 (rutas del router de React).
    ServeStaticModule.forRoot({
      rootPath: PUBLIC_PATH,
      exclude: ['/api/v1/(.*)'],
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    InvitationsModule,
    ListsModule,
    ItemsModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
