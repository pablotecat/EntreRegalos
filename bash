# Ejecutar desde: EntreRegalos/backend/

# ── Crear estructura de carpetas ─────────────────────────────────
mkdir -p src/auth/{dto,strategies,guards}
mkdir -p src/users
mkdir -p src/common/decorators
mkdir -p src/invitations/dto

# ── Decoradores comunes ──────────────────────────────────────────
cat > src/common/decorators/public.decorator.ts << 'EOF'
import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';
/** Marca un endpoint como público (no requiere JWT) */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
EOF

cat > src/common/decorators/roles.decorator.ts << 'EOF'
import { SetMetadata } from '@nestjs/common';
import { Role } from '@prisma/client';

export const ROLES_KEY = 'roles';
/** Restringe el endpoint a los roles indicados */
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
EOF

cat > src/common/decorators/current-user.decorator.ts << 'EOF'
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User } from '@prisma/client';

/** Inyecta el usuario autenticado en el parámetro del controlador */
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): User => {
    const request = ctx.switchToHttp().getRequest();
    return request.user as User;
  },
);
EOF

# ── Guards ───────────────────────────────────────────────────────
cat > src/auth/guards/jwt-auth.guard.ts << 'EOF'
import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from '../../common/decorators/public.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;
    return super.canActivate(context);
  }
}
EOF

cat > src/auth/guards/roles.guard.ts << 'EOF'
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@prisma/client';
import { ROLES_KEY } from '../../common/decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const rolesRequeridos = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!rolesRequeridos) return true;
    const { user } = context.switchToHttp().getRequest();
    return rolesRequeridos.includes(user?.role);
  }
}
EOF

cat > src/auth/guards/jwt-refresh.guard.ts << 'EOF'
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtRefreshGuard extends AuthGuard('jwt-refresh') {}
EOF

# ── Estrategias JWT ───────────────────────────────────────────────
cat > src/auth/strategies/jwt.strategy.ts << 'EOF'
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from '../../users/users.service';

export interface JwtPayload {
  sub: string;
  username: string;
  role: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    configService: ConfigService,
    private readonly usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('JWT_ACCESS_SECRET'),
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.usersService.findById(payload.sub);
    if (!user || !user.isActive) {
      throw new UnauthorizedException('Usuario no autorizado');
    }
    return user;
  }
}
EOF

cat > src/auth/strategies/jwt-refresh.strategy.ts << 'EOF'
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(
    configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => req?.cookies?.refreshToken as string | null,
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
      passReqToCallback: true,
    });
  }

  async validate(req: Request) {
    const refreshToken = req.cookies?.refreshToken as string | undefined;
    if (!refreshToken) throw new UnauthorizedException('Refresh token no encontrado');

    const token = await this.prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    });

    if (!token || token.revoked || token.expiresAt < new Date()) {
      throw new UnauthorizedException('Refresh token inválido o expirado');
    }
    if (!token.user.isActive) {
      throw new UnauthorizedException('Usuario desactivado');
    }
    return { ...token.user, refreshToken };
  }
}
EOF

# ── DTOs ─────────────────────────────────────────────────────────
cat > src/auth/dto/login.dto.ts << 'EOF'
import { IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @IsString()
  @IsNotEmpty({ message: 'El nombre de usuario es obligatorio' })
  username: string;

  @IsString()
  @IsNotEmpty({ message: 'La contraseña es obligatoria' })
  password: string;
}
EOF

cat > src/auth/dto/register.dto.ts << 'EOF'
import { IsNotEmpty, IsString, IsUUID, Matches, MaxLength, MinLength } from 'class-validator';

export class RegisterDto {
  @IsUUID('4', { message: 'El token de invitación no es válido' })
  invitationToken: string;

  @IsString()
  @MinLength(3, { message: 'El nombre de usuario debe tener al menos 3 caracteres' })
  @MaxLength(30, { message: 'El nombre de usuario no puede superar los 30 caracteres' })
  @Matches(/^[a-z0-9_]+$/, {
    message: 'El nombre de usuario solo puede contener letras minúsculas, números y guiones bajos',
  })
  username: string;

  @IsString()
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  @IsNotEmpty({ message: 'La contraseña es obligatoria' })
  password: string;
}
EOF

# ── Users ────────────────────────────────────────────────────────
cat > src/users/users.repository.ts << 'EOF'
import { Injectable } from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  findByUsername(username: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { username } });
  }

  findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }

  findAll(): Promise<User[]> {
    return this.prisma.user.findMany({ orderBy: { createdAt: 'asc' } });
  }

  create(data: Prisma.UserCreateInput): Promise<User> {
    return this.prisma.user.create({ data });
  }

  update(id: string, data: Prisma.UserUpdateInput): Promise<User> {
    return this.prisma.user.update({ where: { id }, data });
  }
}
EOF

cat > src/users/users.service.ts << 'EOF'
import { Injectable } from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import { UsersRepository } from './users.repository';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  findByUsername(username: string): Promise<User | null> {
    return this.usersRepository.findByUsername(username);
  }

  findById(id: string): Promise<User | null> {
    return this.usersRepository.findById(id);
  }

  findAll(): Promise<User[]> {
    return this.usersRepository.findAll();
  }

  create(data: Prisma.UserCreateInput): Promise<User> {
    return this.usersRepository.create(data);
  }

  update(id: string, data: Prisma.UserUpdateInput): Promise<User> {
    return this.usersRepository.update(id, data);
  }
}
EOF

cat > src/users/users.module.ts << 'EOF'
import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersRepository } from './users.repository';
import { UsersController } from './users.controller';

@Module({
  controllers: [UsersController],
  providers: [UsersService, UsersRepository],
  exports: [UsersService],
})
export class UsersModule {}
EOF

cat > src/users/users.controller.ts << 'EOF'
import {
  BadRequestException,
  Controller,
  Get,
  NotFoundException,
  Param,
  Patch,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { UsersService } from './users.service';
import { User } from '@prisma/client';

@Roles(Role.ADMIN)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async findAll() {
    const users = await this.usersService.findAll();
    return users.map(({ passwordHash: _, ...u }) => u);
  }

  @Patch(':id/deactivate')
  async deactivate(@Param('id') id: string, @CurrentUser() admin: User) {
    if (id === admin.id) {
      throw new BadRequestException('No puedes desactivarte a ti mismo');
    }
    const user = await this.usersService.findById(id);
    if (!user) throw new NotFoundException('Usuario no encontrado');
    const updated = await this.usersService.update(id, { isActive: false });
    const { passwordHash: _, ...result } = updated;
    return result;
  }

  @Patch(':id/activate')
  async activate(@Param('id') id: string) {
    const user = await this.usersService.findById(id);
    if (!user) throw new NotFoundException('Usuario no encontrado');
    const updated = await this.usersService.update(id, { isActive: true });
    const { passwordHash: _, ...result } = updated;
    return result;
  }
}
EOF

# ── Auth Service ─────────────────────────────────────────────────
cat > src/auth/auth.service.ts << 'EOF'
import {
  ConflictException,
  GoneException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  async login(dto: LoginDto): Promise<{ accessToken: string; refreshToken: string }> {
    const user = await this.usersService.findByUsername(dto.username);
    if (!user || !user.isActive) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }
    const valida = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valida) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }
    return this.generarTokens(user);
  }

  async register(dto: RegisterDto): Promise<{ accessToken: string; refreshToken: string }> {
    const invitacion = await this.prisma.invitation.findUnique({
      where: { token: dto.invitationToken },
    });
    if (!invitacion) throw new NotFoundException('Invitación no encontrada');
    if (invitacion.used || invitacion.expiresAt < new Date()) {
      throw new GoneException('La invitación ha expirado o ya ha sido utilizada');
    }

    const existe = await this.usersService.findByUsername(dto.username);
    if (existe) throw new ConflictException('El nombre de usuario ya está en uso');

    const hash = await bcrypt.hash(dto.password, 10);
    const usuario = await this.usersService.create({
      username: dto.username,
      passwordHash: hash,
    });

    await this.prisma.invitation.update({
      where: { id: invitacion.id },
      data: { used: true },
    });

    return this.generarTokens(usuario);
  }

  async refresh(refreshToken: string): Promise<{ accessToken: string }> {
    const token = await this.prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    });
    if (!token || token.revoked || token.expiresAt < new Date()) {
      throw new UnauthorizedException('Refresh token inválido o expirado');
    }
    if (!token.user.isActive) {
      throw new UnauthorizedException('Usuario desactivado');
    }
    return { accessToken: this.generarAccessToken(token.user) };
  }

  async logout(refreshToken: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: { token: refreshToken },
      data: { revoked: true },
    });
  }

  private async generarTokens(user: User): Promise<{ accessToken: string; refreshToken: string }> {
    const accessToken = this.generarAccessToken(user);
    const refreshToken = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await this.prisma.refreshToken.create({
      data: { token: refreshToken, userId: user.id, expiresAt },
    });
    return { accessToken, refreshToken };
  }

  private generarAccessToken(user: User): string {
    return this.jwtService.sign(
      { sub: user.id, username: user.username, role: user.role },
      {
        secret: this.configService.getOrThrow<string>('JWT_ACCESS_SECRET'),
        expiresIn: this.configService.get<string>('JWT_ACCESS_EXPIRES_IN') ?? '15m',
      },
    );
  }
}
EOF

# ── Auth Controller ───────────────────────────────────────────────
cat > src/auth/auth.controller.ts << 'EOF'
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { User } from '@prisma/client';
import { Public } from '../common/decorators/public.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const { accessToken, refreshToken } = await this.authService.login(dto);
    this.setCookieRefresh(res, refreshToken);
    return { accessToken };
  }

  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() dto: RegisterDto, @Res({ passthrough: true }) res: Response) {
    const { accessToken, refreshToken } = await this.authService.register(dto);
    this.setCookieRefresh(res, refreshToken);
    return { accessToken };
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Req() req: Request) {
    const refreshToken = req.cookies?.refreshToken as string | undefined;
    if (!refreshToken) throw new UnauthorizedException('Refresh token no encontrado');
    return this.authService.refresh(refreshToken);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const refreshToken = req.cookies?.refreshToken as string | undefined;
    if (refreshToken) await this.authService.logout(refreshToken);
    res.clearCookie('refreshToken');
    return { message: 'Sesión cerrada correctamente' };
  }

  @Get('me')
  me(@CurrentUser() user: User) {
    const { passwordHash: _, ...datos } = user;
    return datos;
  }

  private setCookieRefresh(res: Response, refreshToken: string): void {
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env['NODE_ENV'] === 'production',
      sameSite: 'strict',
      path: '/api/v1/auth/refresh',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
  }
}
EOF

# ── Auth Module ───────────────────────────────────────────────────
cat > src/auth/auth.module.ts << 'EOF'
import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [UsersModule, PassportModule, JwtModule.register({})],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    JwtRefreshStrategy,
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AuthModule {}
EOF

# ── Invitations ───────────────────────────────────────────────────
cat > src/invitations/dto/create-invitation.dto.ts << 'EOF'
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateInvitationDto {
  @IsOptional()
  @IsString()
  @MaxLength(100, { message: 'La referencia no puede superar los 100 caracteres' })
  reference?: string;
}
EOF

cat > src/invitations/invitations.repository.ts << 'EOF'
import { Injectable } from '@nestjs/common';
import { Invitation, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class InvitationsRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: Prisma.InvitationCreateInput): Promise<Invitation> {
    return this.prisma.invitation.create({ data });
  }

  findAll(): Promise<Invitation[]> {
    return this.prisma.invitation.findMany({ orderBy: { createdAt: 'desc' } });
  }

  findByToken(token: string): Promise<Invitation | null> {
    return this.prisma.invitation.findUnique({ where: { token } });
  }
}
EOF

cat > src/invitations/invitations.service.ts << 'EOF'
import { GoneException, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Invitation } from '@prisma/client';
import { InvitationsRepository } from './invitations.repository';
import { CreateInvitationDto } from './dto/create-invitation.dto';

@Injectable()
export class InvitationsService {
  constructor(
    private readonly invitationsRepository: InvitationsRepository,
    private readonly configService: ConfigService,
  ) {}

  async create(dto: CreateInvitationDto, createdById: string): Promise<Invitation & { invitationUrl: string }> {
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const invitation = await this.invitationsRepository.create({
      reference: dto.reference,
      expiresAt,
      createdBy: { connect: { id: createdById } },
    });
    const frontendUrl = this.configService.get<string>('FRONTEND_URL') ?? 'http://localhost:3000';
    return { ...invitation, invitationUrl: `${frontendUrl}/register?token=${invitation.token}` };
  }

  findAll(): Promise<Invitation[]> {
    return this.invitationsRepository.findAll();
  }

  async validate(token: string): Promise<{ valid: true }> {
    const invitation = await this.invitationsRepository.findByToken(token);
    if (!invitation) throw new NotFoundException('Invitación no encontrada');
    if (invitation.used || invitation.expiresAt < new Date()) {
      throw new GoneException('La invitación ha expirado o ya ha sido utilizada');
    }
    return { valid: true };
  }
}
EOF

cat > src/invitations/invitations.controller.ts << 'EOF'
import { Body, Controller, Get, HttpCode, HttpStatus, Post, Query } from '@nestjs/common';
import { Role } from '@prisma/client';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { CreateInvitationDto } from './dto/create-invitation.dto';
import { InvitationsService } from './invitations.service';
import { User } from '@prisma/client';

@Controller('invitations')
export class InvitationsController {
  constructor(private readonly invitationsService: InvitationsService) {}

  @Roles(Role.ADMIN)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateInvitationDto, @CurrentUser() user: User) {
    return this.invitationsService.create(dto, user.id);
  }

  @Roles(Role.ADMIN)
  @Get()
  findAll() {
    return this.invitationsService.findAll();
  }

  @Public()
  @Get('validate')
  validate(@Query('token') token: string) {
    return this.invitationsService.validate(token);
  }
}
EOF

cat > src/invitations/invitations.module.ts << 'EOF'
import { Module } from '@nestjs/common';
import { InvitationsController } from './invitations.controller';
import { InvitationsRepository } from './invitations.repository';
import { InvitationsService } from './invitations.service';

@Module({
  controllers: [InvitationsController],
  providers: [InvitationsService, InvitationsRepository],
})
export class InvitationsModule {}
EOF

# ── Lists ─────────────────────────────────────────────────────────
mkdir -p src/lists/dto
mkdir -p src/items/dto

cat > src/lists/dto/create-list.dto.ts << 'EOF'
import { IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { Visibility } from '@prisma/client';

export class CreateListDto {
  @IsString()
  @IsNotEmpty({ message: 'El nombre de la lista es obligatorio' })
  @MaxLength(100, { message: 'El nombre no puede superar los 100 caracteres' })
  name: string;

  @IsOptional()
  @IsEnum(Visibility, { message: 'La visibilidad debe ser PUBLIC o PRIVATE' })
  visibility?: Visibility;
}
EOF

cat > src/lists/dto/update-list.dto.ts << 'EOF'
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { Visibility } from '@prisma/client';

export class UpdateListDto {
  @IsOptional()
  @IsString()
  @MaxLength(100, { message: 'El nombre no puede superar los 100 caracteres' })
  name?: string;

  @IsOptional()
  @IsEnum(Visibility, { message: 'La visibilidad debe ser PUBLIC o PRIVATE' })
  visibility?: Visibility;
}
EOF

cat > src/lists/lists.repository.ts << 'EOF'
import { Injectable } from '@nestjs/common';
import { List, Prisma, Visibility } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ListsRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAllByOwner(ownerId: string) {
    return this.prisma.list.findMany({
      where: { ownerId },
      include: { _count: { select: { items: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  findPublic(excludeOwnerId: string) {
    return this.prisma.list.findMany({
      where: { visibility: Visibility.PUBLIC, ownerId: { not: excludeOwnerId } },
      include: { owner: { select: { id: true, username: true } }, _count: { select: { items: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  findById(id: string) {
    return this.prisma.list.findUnique({
      where: { id },
      include: { items: { orderBy: { order: 'asc' } }, owner: { select: { id: true, username: true } } },
    });
  }

  create(data: Prisma.ListCreateInput): Promise<List> {
    return this.prisma.list.create({ data });
  }

  update(id: string, data: Prisma.ListUpdateInput): Promise<List> {
    return this.prisma.list.update({ where: { id }, data });
  }

  delete(id: string): Promise<List> {
    return this.prisma.list.delete({ where: { id } });
  }
}
EOF

cat > src/lists/lists.service.ts << 'EOF'
import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Visibility } from '@prisma/client';
import { ListsRepository } from './lists.repository';
import { CreateListDto } from './dto/create-list.dto';
import { UpdateListDto } from './dto/update-list.dto';

@Injectable()
export class ListsService {
  constructor(private readonly listsRepository: ListsRepository) {}

  findAllByOwner(ownerId: string) {
    return this.listsRepository.findAllByOwner(ownerId);
  }

  findPublic(userId: string) {
    return this.listsRepository.findPublic(userId);
  }

  async findById(id: string, userId: string) {
    const list = await this.listsRepository.findById(id);
    if (!list) throw new NotFoundException('Lista no encontrada');
    if (list.visibility === Visibility.PRIVATE && list.ownerId !== userId) {
      throw new ForbiddenException('No tienes acceso a esta lista');
    }
    return list;
  }

  create(dto: CreateListDto, ownerId: string) {
    return this.listsRepository.create({
      name: dto.name,
      visibility: dto.visibility ?? Visibility.PRIVATE,
      owner: { connect: { id: ownerId } },
    });
  }

  async update(id: string, dto: UpdateListDto, userId: string) {
    const list = await this.listsRepository.findById(id);
    if (!list) throw new NotFoundException('Lista no encontrada');
    if (list.ownerId !== userId) throw new ForbiddenException('No puedes editar esta lista');
    return this.listsRepository.update(id, dto);
  }

  async delete(id: string, userId: string) {
    const list = await this.listsRepository.findById(id);
    if (!list) throw new NotFoundException('Lista no encontrada');
    if (list.ownerId !== userId) throw new ForbiddenException('No puedes eliminar esta lista');
    return this.listsRepository.delete(id);
  }
}
EOF

cat > src/lists/lists.controller.ts << 'EOF'
import {
  Body, Controller, Delete, Get, HttpCode, HttpStatus,
  Param, Patch, Post,
} from '@nestjs/common';
import { User } from '@prisma/client';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { CreateListDto } from './dto/create-list.dto';
import { UpdateListDto } from './dto/update-list.dto';
import { ListsService } from './lists.service';

@Controller('lists')
export class ListsController {
  constructor(private readonly listsService: ListsService) {}

  @Get()
  findMine(@CurrentUser() user: User) {
    return this.listsService.findAllByOwner(user.id);
  }

  @Get('public')
  findPublic(@CurrentUser() user: User) {
    return this.listsService.findPublic(user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: User) {
    return this.listsService.findById(id, user.id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateListDto, @CurrentUser() user: User) {
    return this.listsService.create(dto, user.id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateListDto, @CurrentUser() user: User) {
    return this.listsService.update(id, dto, user.id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  delete(@Param('id') id: string, @CurrentUser() user: User) {
    return this.listsService.delete(id, user.id);
  }
}
EOF

cat > src/lists/lists.module.ts << 'EOF'
import { Module } from '@nestjs/common';
import { ListsController } from './lists.controller';
import { ListsRepository } from './lists.repository';
import { ListsService } from './lists.service';

@Module({
  controllers: [ListsController],
  providers: [ListsService, ListsRepository],
})
export class ListsModule {}
EOF

# ── Items ─────────────────────────────────────────────────────────
cat > src/items/dto/create-item.dto.ts << 'EOF'
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateItemDto {
  @IsString()
  @IsNotEmpty({ message: 'El nombre del artículo es obligatorio' })
  @MaxLength(200, { message: 'El nombre no puede superar los 200 caracteres' })
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'La descripción no puede superar los 500 caracteres' })
  description?: string;
}
EOF

cat > src/items/dto/update-item.dto.ts << 'EOF'
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateItemDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;
}
EOF

cat > src/items/items.repository.ts << 'EOF'
import { Injectable } from '@nestjs/common';
import { Item, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ItemsRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: Prisma.ItemCreateInput): Promise<Item> {
    return this.prisma.item.create({ data });
  }

  findById(id: string): Promise<Item | null> {
    return this.prisma.item.findUnique({ where: { id } });
  }

  update(id: string, data: Prisma.ItemUpdateInput): Promise<Item> {
    return this.prisma.item.update({ where: { id }, data });
  }

  delete(id: string): Promise<Item> {
    return this.prisma.item.delete({ where: { id } });
  }
}
EOF

cat > src/items/items.service.ts << 'EOF'
import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { ItemsRepository } from './items.repository';
import { ListsRepository } from '../lists/lists.repository';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';

@Injectable()
export class ItemsService {
  constructor(
    private readonly itemsRepository: ItemsRepository,
    private readonly listsRepository: ListsRepository,
  ) {}

  private async verificarPropietario(listId: string, userId: string) {
    const list = await this.listsRepository.findById(listId);
    if (!list) throw new NotFoundException('Lista no encontrada');
    if (list.ownerId !== userId) throw new ForbiddenException('No puedes modificar esta lista');
    return list;
  }

  async create(listId: string, dto: CreateItemDto, userId: string) {
    await this.verificarPropietario(listId, userId);
    return this.itemsRepository.create({
      name: dto.name,
      description: dto.description,
      list: { connect: { id: listId } },
    });
  }

  async update(listId: string, itemId: string, dto: UpdateItemDto, userId: string) {
    await this.verificarPropietario(listId, userId);
    const item = await this.itemsRepository.findById(itemId);
    if (!item || item.listId !== listId) throw new NotFoundException('Artículo no encontrado');
    return this.itemsRepository.update(itemId, dto);
  }

  async delete(listId: string, itemId: string, userId: string) {
    await this.verificarPropietario(listId, userId);
    const item = await this.itemsRepository.findById(itemId);
    if (!item || item.listId !== listId) throw new NotFoundException('Artículo no encontrado');
    return this.itemsRepository.delete(itemId);
  }
}
EOF

cat > src/items/items.controller.ts << 'EOF'
import {
  Body, Controller, Delete, HttpCode, HttpStatus,
  Param, Patch, Post,
} from '@nestjs/common';
import { User } from '@prisma/client';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { ItemsService } from './items.service';

@Controller('lists/:listId/items')
export class ItemsController {
  constructor(private readonly itemsService: ItemsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(
    @Param('listId') listId: string,
    @Body() dto: CreateItemDto,
    @CurrentUser() user: User,
  ) {
    return this.itemsService.create(listId, dto, user.id);
  }

  @Patch(':itemId')
  update(
    @Param('listId') listId: string,
    @Param('itemId') itemId: string,
    @Body() dto: UpdateItemDto,
    @CurrentUser() user: User,
  ) {
    return this.itemsService.update(listId, itemId, dto, user.id);
  }

  @Delete(':itemId')
  @HttpCode(HttpStatus.NO_CONTENT)
  delete(
    @Param('listId') listId: string,
    @Param('itemId') itemId: string,
    @CurrentUser() user: User,
  ) {
    return this.itemsService.delete(listId, itemId, user.id);
  }
}
EOF

cat > src/items/items.module.ts << 'EOF'
import { Module } from '@nestjs/common';
import { ItemsController } from './items.controller';
import { ItemsRepository } from './items.repository';
import { ItemsService } from './items.service';
import { ListsRepository } from '../lists/lists.repository';

@Module({
  controllers: [ItemsController],
  providers: [ItemsService, ItemsRepository, ListsRepository],
})
export class ItemsModule {}
EOF

# ── App Module actualizado ────────────────────────────────────────
cat > src/app.module.ts << 'EOF'
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { InvitationsModule } from './invitations/invitations.module';
import { ItemsModule } from './items/items.module';
import { ListsModule } from './lists/lists.module';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UsersModule,
    InvitationsModule,
    ListsModule,
    ItemsModule,
  ],
})
export class AppModule {}
EOF

echo "✅ Backend completo (T-007 a T-021) generado correctamente"
