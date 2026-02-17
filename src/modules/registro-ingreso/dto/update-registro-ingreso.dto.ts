import { PartialType } from '@nestjs/swagger';
import { CreateRegistroIngresoDto } from './create-registro-ingreso.dto';

export class UpdateRegistroIngresoDto extends PartialType(
  CreateRegistroIngresoDto,
) {}
