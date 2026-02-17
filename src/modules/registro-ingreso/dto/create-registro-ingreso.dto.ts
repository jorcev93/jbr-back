import { ApiProperty } from '@nestjs/swagger';
import {
  IsUUID,
  IsInt,
  Min,
  IsDateString,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateRegistroIngresoDto {
  @ApiProperty()
  @IsUUID()
  plantaId!: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  personaId?: string;

  @ApiProperty({ example: 5 })
  @IsInt()
  @Min(1)
  cantidad!: number;

  @ApiProperty({ example: '2024-01-15' })
  @IsDateString()
  fechaIngreso!: string;

  @ApiProperty({ example: 'Plantas recibidas en buen estado', required: false })
  @IsOptional()
  @IsString()
  observaciones?: string;
}
