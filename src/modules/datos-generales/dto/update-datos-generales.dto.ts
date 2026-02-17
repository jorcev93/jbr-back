import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateDatosGeneralesDto } from './create-datos-generales.dto';

export class UpdateDatosGeneralesDto extends PartialType(
  OmitType(CreateDatosGeneralesDto, ['plantaId'] as const),
) {}
