import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CreateFlorDto {
  @ApiProperty({ example: 'Hermafrodita', required: false })
  @IsOptional()
  @IsString()
  tipo?: string;

  @ApiProperty({ example: 'Actinomorfa', required: false })
  @IsOptional()
  @IsString()
  simetria?: string;

  @ApiProperty({ example: 'Heteroclamídeo', required: false })
  @IsOptional()
  @IsString()
  perianto?: string;

  @ApiProperty({ example: 'Dialisépalo', required: false })
  @IsOptional()
  @IsString()
  caliz?: string;

  @ApiProperty({ example: 'Dialipétala', required: false })
  @IsOptional()
  @IsString()
  corola?: string;

  @ApiProperty({ example: 'Numerosos', required: false })
  @IsOptional()
  @IsString()
  estambre?: string;

  @ApiProperty({ example: 'Basifija', required: false })
  @IsOptional()
  @IsString()
  antera?: string;

  @ApiProperty({ example: 'Súpero', required: false })
  @IsOptional()
  @IsString()
  ovario?: string;

  @ApiProperty({ example: 'Imbricada', required: false })
  @IsOptional()
  @IsString()
  prefloracion?: string;
}
