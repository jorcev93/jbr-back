import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CreateHojasDto {
  @ApiProperty({ example: 'Ovalada', required: false })
  @IsOptional()
  @IsString()
  forma?: string;

  @ApiProperty({ example: 'Cordada', required: false })
  @IsOptional()
  @IsString()
  base?: string;

  @ApiProperty({ example: 'Agudo', required: false })
  @IsOptional()
  @IsString()
  apice?: string;

  @ApiProperty({ example: 'Aserrado', required: false })
  @IsOptional()
  @IsString()
  borde?: string;

  @ApiProperty({ example: 'Pinnada', required: false })
  @IsOptional()
  @IsString()
  nervadura?: string;

  @ApiProperty({ example: 'Alterna', required: false })
  @IsOptional()
  @IsString()
  filotaxis?: string;

  @ApiProperty({ example: 'Simple', required: false })
  @IsOptional()
  @IsString()
  complejidad?: string;

  @ApiProperty({ example: 'Presente', required: false })
  @IsOptional()
  @IsString()
  peciolo?: string;

  @ApiProperty({ example: 'Presentes', required: false })
  @IsOptional()
  @IsString()
  estipulas?: string;

  @ApiProperty({ example: 'Tricomas', required: false })
  @IsOptional()
  @IsString()
  emergencia?: string;

  @ApiProperty({ example: 'Verde oscuro', required: false })
  @IsOptional()
  @IsString()
  colores?: string;
}
