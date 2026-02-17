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
import { RegistroIngresoService } from './registro-ingreso.service';
import { CreateRegistroIngresoDto, UpdateRegistroIngresoDto } from './dto';
import { UuidValidationPipe } from '../../common/pipes/uuid-validation.pipe';

@ApiTags('Registro de Ingreso')
@ApiBearerAuth()
@Controller('registro-ingreso')
export class RegistroIngresoController {
  constructor(
    private readonly registroIngresoService: RegistroIngresoService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Crear registro de ingreso' })
  create(@Body() createRegistroIngresoDto: CreateRegistroIngresoDto) {
    return this.registroIngresoService.create(createRegistroIngresoDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar registros de ingreso' })
  findAll() {
    return this.registroIngresoService.findAll();
  }

  @Get('planta/:plantaId')
  @ApiOperation({ summary: 'Obtener registros por planta' })
  findByPlanta(@Param('plantaId', UuidValidationPipe) plantaId: string) {
    return this.registroIngresoService.findByPlanta(plantaId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener registro por ID' })
  findOne(@Param('id', UuidValidationPipe) id: string) {
    return this.registroIngresoService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar registro de ingreso' })
  update(
    @Param('id', UuidValidationPipe) id: string,
    @Body() updateRegistroIngresoDto: UpdateRegistroIngresoDto,
  ) {
    return this.registroIngresoService.update(id, updateRegistroIngresoDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar registro de ingreso' })
  remove(@Param('id', UuidValidationPipe) id: string) {
    return this.registroIngresoService.remove(id);
  }
}
