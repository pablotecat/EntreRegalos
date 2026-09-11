import {
  BadRequestException,
  Controller,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { Role, User } from '@prisma/client';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async findAll(@CurrentUser() user: User) {
    const users =
      user.role === Role.ADMIN
        ? await this.usersService.findAll()
        : await this.usersService.findAllActiveExcept(user.id);
    return users.map(({ passwordHash: _, ...u }) => u);
  }

  @Roles(Role.ADMIN)
  @Get('password-reset-tokens')
  async findPasswordResetTokens() {
    return this.usersService.findActivePasswordResetTokens();
  }

  @Roles(Role.ADMIN)
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

  @Roles(Role.ADMIN)
  @Patch(':id/activate')
  async activate(@Param('id') id: string) {
    const user = await this.usersService.findById(id);
    if (!user) throw new NotFoundException('Usuario no encontrado');
    const updated = await this.usersService.update(id, { isActive: true });
    const { passwordHash: _, ...result } = updated;
    return result;
  }

  @Roles(Role.ADMIN)
  @Post(':id/reset-password')
  async createPasswordResetToken(@Param('id') id: string) {
    const user = await this.usersService.findById(id);
    if (!user) throw new NotFoundException('Usuario no encontrado');
    const token = await this.usersService.createPasswordResetToken(id);
    return token;
  }
}
