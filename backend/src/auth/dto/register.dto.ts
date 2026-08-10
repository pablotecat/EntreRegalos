import { IsNotEmpty, IsString, IsUUID, Matches, MaxLength, MinLength } from 'class-validator';

export class RegisterDto {
  @IsUUID('4', { message: 'El token de invitación no es válido' })
  invitationToken!: string;

  @IsString()
  @MinLength(3, { message: 'El nombre de usuario debe tener al menos 3 caracteres' })
  @MaxLength(30, { message: 'El nombre de usuario no puede superar los 30 caracteres' })
  @Matches(/^[a-zA-Z0-9_]+$/, {
    message: 'El nombre de usuario solo puede contener letras, números y guiones bajos',
  })
  username!: string;

  @IsString()
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  @IsNotEmpty({ message: 'La contraseña es obligatoria' })
  password!: string;
}
