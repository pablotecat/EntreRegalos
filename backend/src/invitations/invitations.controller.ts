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
