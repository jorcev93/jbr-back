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
import { DatosGeneralesService } from './datos-generales.service';
import { CreateDatosGeneralesDto, UpdateDatosGeneralesDto } from './dto';
import { UuidValidationPipe } from '../../common/pipes/uuid-validation.pipe';

@ApiTags('Datos Generales')
@ApiBearerAuth()
@Controller('datos-generales')
export class DatosGeneralesController {
  constructor(private readonly datosGeneralesService: DatosGeneralesService) {}

  @Post()
  @ApiOperation({ summary: 'Crear datos generales para una planta' })
  create(@Body() createDatosGeneralesDto: CreateDatosGeneralesDto) {
    return this.datosGeneralesService.create(createDatosGeneralesDto);
  }

  @Get('planta/:plantaId')
  @ApiOperation({ summary: 'Obtener datos generales por planta' })
  findByPlanta(@Param('plantaId', UuidValidationPipe) plantaId: string) {
    return this.datosGeneralesService.findByPlanta(plantaId);
  }

  @Patch('planta/:plantaId')
  @ApiOperation({ summary: 'Actualizar datos generales' })
  update(
    @Param('plantaId', UuidValidationPipe) plantaId: string,
    @Body() updateDatosGeneralesDto: UpdateDatosGeneralesDto,
  ) {
    return this.datosGeneralesService.update(plantaId, updateDatosGeneralesDto);
  }

  @Delete('planta/:plantaId')
  @ApiOperation({ summary: 'Eliminar datos generales' })
  remove(@Param('plantaId', UuidValidationPipe) plantaId: string) {
    return this.datosGeneralesService.remove(plantaId);
  }
}
