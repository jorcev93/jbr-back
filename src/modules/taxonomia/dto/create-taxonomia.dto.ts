import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsOptional, IsString } from 'class-validator';

export class CreateTaxonomiaDto {
  @ApiProperty()
  @IsUUID()
  plantaId!: string;

  @ApiProperty({ example: 'Plantae', required: false })
  @IsOptional()
  @IsString()
  reino?: string;

  @ApiProperty({ example: 'Tracheophyta', required: false })
  @IsOptional()
  @IsString()
  phylum?: string;

  @ApiProperty({ example: 'Magnoliophyta', required: false })
  @IsOptional()
  @IsString()
  division?: string;

  @ApiProperty({ example: 'Magnoliopsida', required: false })
  @IsOptional()
  @IsString()
  clase?: string;

  @ApiProperty({ example: 'Rosidae', required: false })
  @IsOptional()
  @IsString()
  subclase?: string;

  @ApiProperty({ example: 'Rosales', required: false })
  @IsOptional()
  @IsString()
  orden?: string;

  @ApiProperty({ example: 'Rosaceae', required: false })
  @IsOptional()
  @IsString()
  familia?: string;

  @ApiProperty({ example: 'Rosoideae', required: false })
  @IsOptional()
  @IsString()
  subfamilia?: string;

  @ApiProperty({ example: 'Roseae', required: false })
  @IsOptional()
  @IsString()
  tribu?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  subtribu?: string;

  @ApiProperty({ example: 'Rosa', required: false })
  @IsOptional()
  @IsString()
  genero?: string;

  @ApiProperty({ example: 'gallica', required: false })
  @IsOptional()
  @IsString()
  especie?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  subespecie?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  variedad?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  cultivar?: string;

  @ApiProperty({ example: 'L.', required: false })
  @IsOptional()
  @IsString()
  autor?: string;
}
