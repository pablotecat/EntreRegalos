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
