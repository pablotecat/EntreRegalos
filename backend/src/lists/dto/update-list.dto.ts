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
