import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class CreateMorfologiaDto {
  @ApiProperty()
  @IsUUID()
  plantaId!: string;
}
