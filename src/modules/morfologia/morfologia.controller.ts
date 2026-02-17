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
import { MorfologiaService } from './morfologia.service';
import {
  CreateMorfologiaDto,
  CreateHojasDto,
  CreateTalloDto,
  CreateRaizDto,
  CreateFlorDto,
  CreateInflorescenciaDto,
  CreateFrutoDto,
} from './dto';
import { UuidValidationPipe } from '../../common/pipes/uuid-validation.pipe';

@ApiTags('Morfología')
@ApiBearerAuth()
@Controller('morfologia')
export class MorfologiaController {
  constructor(private readonly morfologiaService: MorfologiaService) {}

  @Post()
  @ApiOperation({ summary: 'Crear morfología para una planta' })
  create(@Body() createMorfologiaDto: CreateMorfologiaDto) {
    return this.morfologiaService.create(createMorfologiaDto);
  }

  @Get('planta/:plantaId')
  @ApiOperation({ summary: 'Obtener morfología completa por planta' })
  findByPlanta(@Param('plantaId', UuidValidationPipe) plantaId: string) {
    return this.morfologiaService.findByPlanta(plantaId);
  }

  @Delete('planta/:plantaId')
  @ApiOperation({ summary: 'Eliminar morfología' })
  remove(@Param('plantaId', UuidValidationPipe) plantaId: string) {
    return this.morfologiaService.remove(plantaId);
  }

  // Hojas
  @Patch(':morfologiaId/hojas')
  @ApiOperation({ summary: 'Crear o actualizar hojas' })
  createOrUpdateHojas(
    @Param('morfologiaId', UuidValidationPipe) morfologiaId: string,
    @Body() createHojasDto: CreateHojasDto,
  ) {
    return this.morfologiaService.createOrUpdateHojas(
      morfologiaId,
      createHojasDto,
    );
  }

  @Get(':morfologiaId/hojas')
  @ApiOperation({ summary: 'Obtener hojas' })
  getHojas(@Param('morfologiaId', UuidValidationPipe) morfologiaId: string) {
    return this.morfologiaService.getHojas(morfologiaId);
  }

  // Tallo
  @Patch(':morfologiaId/tallo')
  @ApiOperation({ summary: 'Crear o actualizar tallo' })
  createOrUpdateTallo(
    @Param('morfologiaId', UuidValidationPipe) morfologiaId: string,
    @Body() createTalloDto: CreateTalloDto,
  ) {
    return this.morfologiaService.createOrUpdateTallo(
      morfologiaId,
      createTalloDto,
    );
  }

  @Get(':morfologiaId/tallo')
  @ApiOperation({ summary: 'Obtener tallo' })
  getTallo(@Param('morfologiaId', UuidValidationPipe) morfologiaId: string) {
    return this.morfologiaService.getTallo(morfologiaId);
  }

  // Raíz
  @Patch(':morfologiaId/raiz')
  @ApiOperation({ summary: 'Crear o actualizar raíz' })
  createOrUpdateRaiz(
    @Param('morfologiaId', UuidValidationPipe) morfologiaId: string,
    @Body() createRaizDto: CreateRaizDto,
  ) {
    return this.morfologiaService.createOrUpdateRaiz(
      morfologiaId,
      createRaizDto,
    );
  }

  @Get(':morfologiaId/raiz')
  @ApiOperation({ summary: 'Obtener raíz' })
  getRaiz(@Param('morfologiaId', UuidValidationPipe) morfologiaId: string) {
    return this.morfologiaService.getRaiz(morfologiaId);
  }

  // Flor
  @Patch(':morfologiaId/flor')
  @ApiOperation({ summary: 'Crear o actualizar flor' })
  createOrUpdateFlor(
    @Param('morfologiaId', UuidValidationPipe) morfologiaId: string,
    @Body() createFlorDto: CreateFlorDto,
  ) {
    return this.morfologiaService.createOrUpdateFlor(
      morfologiaId,
      createFlorDto,
    );
  }

  @Get(':morfologiaId/flor')
  @ApiOperation({ summary: 'Obtener flor' })
  getFlor(@Param('morfologiaId', UuidValidationPipe) morfologiaId: string) {
    return this.morfologiaService.getFlor(morfologiaId);
  }

  // Inflorescencia
  @Patch(':morfologiaId/inflorescencia')
  @ApiOperation({ summary: 'Crear o actualizar inflorescencia' })
  createOrUpdateInflorescencia(
    @Param('morfologiaId', UuidValidationPipe) morfologiaId: string,
    @Body() createInflorescenciaDto: CreateInflorescenciaDto,
  ) {
    return this.morfologiaService.createOrUpdateInflorescencia(
      morfologiaId,
      createInflorescenciaDto,
    );
  }

  @Get(':morfologiaId/inflorescencia')
  @ApiOperation({ summary: 'Obtener inflorescencia' })
  getInflorescencia(
    @Param('morfologiaId', UuidValidationPipe) morfologiaId: string,
  ) {
    return this.morfologiaService.getInflorescencia(morfologiaId);
  }

  // Fruto
  @Patch(':morfologiaId/fruto')
  @ApiOperation({ summary: 'Crear o actualizar fruto' })
  createOrUpdateFruto(
    @Param('morfologiaId', UuidValidationPipe) morfologiaId: string,
    @Body() createFrutoDto: CreateFrutoDto,
  ) {
    return this.morfologiaService.createOrUpdateFruto(
      morfologiaId,
      createFrutoDto,
    );
  }

  @Get(':morfologiaId/fruto')
  @ApiOperation({ summary: 'Obtener fruto' })
  getFruto(@Param('morfologiaId', UuidValidationPipe) morfologiaId: string) {
    return this.morfologiaService.getFruto(morfologiaId);
  }
}
