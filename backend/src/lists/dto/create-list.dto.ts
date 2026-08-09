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
