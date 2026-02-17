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
import { CondicionCultivoService } from './condicion-cultivo.service';
import { CreateCondicionCultivoDto, UpdateCondicionCultivoDto } from './dto';
import { UuidValidationPipe } from '../../common/pipes/uuid-validation.pipe';

@ApiTags('Condiciones de Cultivo')
@ApiBearerAuth()
@Controller('condicion-cultivo')
export class CondicionCultivoController {
  constructor(
    private readonly condicionCultivoService: CondicionCultivoService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Crear condiciones de cultivo para una planta' })
  create(@Body() createCondicionCultivoDto: CreateCondicionCultivoDto) {
    return this.condicionCultivoService.create(createCondicionCultivoDto);
  }

  @Get('planta/:plantaId')
  @ApiOperation({ summary: 'Obtener condiciones de cultivo por planta' })
  findByPlanta(@Param('plantaId', UuidValidationPipe) plantaId: string) {
    return this.condicionCultivoService.findByPlanta(plantaId);
  }

  @Patch('planta/:plantaId')
  @ApiOperation({ summary: 'Actualizar condiciones de cultivo' })
  update(
    @Param('plantaId', UuidValidationPipe) plantaId: string,
    @Body() updateCondicionCultivoDto: UpdateCondicionCultivoDto,
  ) {
    return this.condicionCultivoService.update(
      plantaId,
      updateCondicionCultivoDto,
    );
  }

  @Delete('planta/:plantaId')
  @ApiOperation({ summary: 'Eliminar condiciones de cultivo' })
  remove(@Param('plantaId', UuidValidationPipe) plantaId: string) {
    return this.condicionCultivoService.remove(plantaId);
  }
}
