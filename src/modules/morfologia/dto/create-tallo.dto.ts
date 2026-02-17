import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CreateTalloDto {
  @ApiProperty({ example: 'Herbáceo', required: false })
  @IsOptional()
  @IsString()
  tipo?: string;

  @ApiProperty({ example: 'Dicotómica', required: false })
  @IsOptional()
  @IsString()
  ramificacion?: string;
}
