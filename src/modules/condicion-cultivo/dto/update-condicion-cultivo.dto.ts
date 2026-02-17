import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateCondicionCultivoDto } from './create-condicion-cultivo.dto';

export class UpdateCondicionCultivoDto extends PartialType(
  OmitType(CreateCondicionCultivoDto, ['plantaId'] as const),
) {}
