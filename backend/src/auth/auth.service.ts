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
