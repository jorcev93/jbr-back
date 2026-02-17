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
import { SeccionesService } from './secciones.service';
import { CreateSeccionDto, UpdateSeccionDto } from './dto';
import { UuidValidationPipe } from '../../common/pipes/uuid-validation.pipe';

@ApiTags('Secciones')
@ApiBearerAuth()
@Controller('secciones')
export class SeccionesController {
  constructor(private readonly seccionesService: SeccionesService) {}

  @Post()
  @ApiOperation({ summary: 'Crear sección' })
  create(@Body() createSeccionDto: CreateSeccionDto) {
    return this.seccionesService.create(createSeccionDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar secciones' })
  findAll() {
    return this.seccionesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener sección por ID' })
  findOne(@Param('id', UuidValidationPipe) id: string) {
    return this.seccionesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar sección' })
  update(
    @Param('id', UuidValidationPipe) id: string,
    @Body() updateSeccionDto: UpdateSeccionDto,
  ) {
    return this.seccionesService.update(id, updateSeccionDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar sección' })
  remove(@Param('id', UuidValidationPipe) id: string) {
    return this.seccionesService.remove(id);
  }
}
