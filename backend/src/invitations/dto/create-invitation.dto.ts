import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateInvitationDto {
  @IsOptional()
  @IsString()
  @MaxLength(100, { message: 'La referencia no puede superar los 100 caracteres' })
  reference?: string;
}
