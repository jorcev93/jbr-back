import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsOptional, IsString, IsInt, Min } from 'class-validator';

export class CreateDatosGeneralesDto {
  @ApiProperty()
  @IsUUID()
  plantaId!: string;

  @ApiProperty({ example: 'Endémica', required: false })
  @IsOptional()
  @IsString()
  endemismo?: string;

  @ApiProperty({ example: 'Vulnerable', required: false })
  @IsOptional()
  @IsString()
  estadoConservacion?: string;

  @ApiProperty({ example: 'Herbario Nacional', required: false })
  @IsOptional()
  @IsString()
  fuenteInformacion?: string;

  @ApiProperty({ example: 'Arbustivo', required: false })
  @IsOptional()
  @IsString()
  habitoCrecimiento?: string;

  @ApiProperty({ example: 'Donación del Jardín Botánico', required: false })
  @IsOptional()
  @IsString()
  historialRecibido?: string;

  @ApiProperty({ example: 'Semillas', required: false })
  @IsOptional()
  @IsString()
  materialRecibido?: string;

  @ApiProperty({ example: 10, required: false })
  @IsOptional()
  @IsInt()
  @Min(0)
  numeroIndividuos?: number;

  @ApiProperty({ example: 'Colombia, Cundinamarca', required: false })
  @IsOptional()
  @IsString()
  procedencia?: string;

  @ApiProperty({ example: 'Por sus hojas aserradas', required: false })
  @IsOptional()
  @IsString()
  comoSeReconoce?: string;

  @ApiProperty({ example: 'Andes colombianos', required: false })
  @IsOptional()
  @IsString()
  ubicacionGeografica?: string;

  @ApiProperty({ example: 'Bosque húmedo montano', required: false })
  @IsOptional()
  @IsString()
  zonaVida?: string;
}
