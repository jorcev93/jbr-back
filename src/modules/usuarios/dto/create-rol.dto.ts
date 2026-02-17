import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength, MaxLength } from 'class-validator';

export class CreateRolDto {
  @ApiProperty({ example: 'Administrador' })
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  nombre!: string;
}
