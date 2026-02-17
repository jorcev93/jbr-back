import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { TaxonomiaService } from './taxonomia.service';
import { CreateTaxonomiaDto, UpdateTaxonomiaDto } from './dto';
import { UuidValidationPipe } from '../../common/pipes/uuid-validation.pipe';

@ApiTags('Taxonomía')
@ApiBearerAuth()
@Controller('taxonomia')
export class TaxonomiaController {
  constructor(private readonly taxonomiaService: TaxonomiaService) {}

  @Post()
  @ApiOperation({ summary: 'Crear taxonomía para una planta' })
  create(@Body() createTaxonomiaDto: CreateTaxonomiaDto) {
    return this.taxonomiaService.create(createTaxonomiaDto);
  }

  @Get('planta/:plantaId')
  @ApiOperation({ summary: 'Obtener taxonomía por planta' })
  findByPlanta(@Param('plantaId', UuidValidationPipe) plantaId: string) {
    return this.taxonomiaService.findByPlanta(plantaId);
  }

  @Patch('planta/:plantaId')
  @ApiOperation({ summary: 'Actualizar taxonomía' })
  update(
    @Param('plantaId', UuidValidationPipe) plantaId: string,
    @Body() updateTaxonomiaDto: UpdateTaxonomiaDto,
  ) {
    return this.taxonomiaService.update(plantaId, updateTaxonomiaDto);
  }

  @Delete('planta/:plantaId')
  @ApiOperation({ summary: 'Eliminar taxonomía' })
  remove(@Param('plantaId', UuidValidationPipe) plantaId: string) {
    return this.taxonomiaService.remove(plantaId);
  }
}
