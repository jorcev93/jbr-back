import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CreateFrutoDto {
  @ApiProperty({ example: 'Baya', required: false })
  @IsOptional()
  @IsString()
  carnoso?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  secoDehiscente?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  secoIndehiscente?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  compuesto?: string;
}
