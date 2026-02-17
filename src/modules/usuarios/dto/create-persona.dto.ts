import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  MinLength,
  MaxLength,
  IsOptional,
  IsDateString,
  IsIn,
  IsBoolean,
  IsUUID,
} from 'class-validator';

export class CreatePersonaDto {
  @ApiProperty({ example: 'Juan' })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  nombre!: string;

  @ApiProperty({ example: 'Pérez' })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  apellido!: string;

  @ApiProperty({ example: 'M', required: false })
  @IsOptional()
  @IsIn(['M', 'F', 'O'])
  genero?: string;

  @ApiProperty({ example: '1990-01-15', required: false })
  @IsOptional()
  @IsDateString()
  fechaNacimiento?: string;

  @ApiProperty({ example: false, required: false })
  @IsOptional()
  @IsBoolean()
  esAutor?: boolean;

  @ApiProperty({ example: false, required: false })
  @IsOptional()
  @IsBoolean()
  esColector?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  rolId?: string;
}
