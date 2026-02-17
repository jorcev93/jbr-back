import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateTaxonomiaDto } from './create-taxonomia.dto';

export class UpdateTaxonomiaDto extends PartialType(
  OmitType(CreateTaxonomiaDto, ['plantaId'] as const),
) {}
