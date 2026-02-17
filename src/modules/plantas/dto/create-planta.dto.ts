import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  MinLength,
  MaxLength,
  IsOptional,
  IsUUID,
} from 'class-validator';

export class CreatePlantaDto {
  @ApiProperty({ example: 'Rosa gallica' })
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  nombreCientifico!: string;

  @ApiProperty({ example: 'Rosa silvestre', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  nombreComun?: string;

  @ApiProperty({ example: 'Rosa rubra, Rosa officinalis', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  sinonimos?: string;

  @ApiProperty({
    example: 'Planta ornamental con flores de diversos colores',
    required: false,
  })
  @IsOptional()
  @IsString()
  descripcion?: string;

  @ApiProperty({
    example: 'Ornamental, medicinal, perfumería',
    required: false,
  })
  @IsOptional()
  @IsString()
  usos?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  seccionId?: string;
}
