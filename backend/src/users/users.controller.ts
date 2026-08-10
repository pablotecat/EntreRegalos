import {
  BadRequestException,
  Controller,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
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

  @Post(':id/reset-password')
  async createPasswordResetToken(@Param('id') id: string) {
    const user = await this.usersService.findById(id);
    if (!user) throw new NotFoundException('Usuario no encontrado');
    const token = await this.usersService.createPasswordResetToken(id);
    return token;
  }
}
