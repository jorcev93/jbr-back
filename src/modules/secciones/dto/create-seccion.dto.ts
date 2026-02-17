import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength, MaxLength, IsOptional } from 'class-validator';

export class CreateSeccionDto {
  @ApiProperty({ example: 'Plantas Medicinales' })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  nombre!: string;

  @ApiProperty({
    example: 'Sección dedicada a plantas con propiedades medicinales',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  descripcion?: string;
}
