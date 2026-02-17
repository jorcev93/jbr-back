import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsOptional, IsString } from 'class-validator';

export class CreateCondicionCultivoDto {
  @ApiProperty()
  @IsUUID(undefined, { message: 'La plantaId no es válida' })
  plantaId!: string;

  @ApiProperty({ example: 'Sombra parcial', required: false })
  @IsOptional()
  @IsString()
  exposicion?: string;

  @ApiProperty({ example: 'Primavera-Verano', required: false })
  @IsOptional()
  @IsString()
  floracion?: string;

  @ApiProperty({ example: 'Media-Alta', required: false })
  @IsOptional()
  @IsString()
  humedad?: string;

  @ApiProperty({ example: 'Moderado, cada 3 días', required: false })
  @IsOptional()
  @IsString()
  riego?: string;

  @ApiProperty({ example: 'Poda anual, abonado en primavera', required: false })
  @IsOptional()
  @IsString()
  laboresCulturales?: string;

  @ApiProperty({ example: 'Sensible a heladas', required: false })
  @IsOptional()
  @IsString()
  observaciones?: string;
}
