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

  async create(
    dto: CreateInvitationDto,
    createdById: string,
  ): Promise<Invitation & { invitationUrl: string }> {
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
