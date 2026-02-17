import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { PlantasService } from './plantas.service';
import { CreatePlantaDto, UpdatePlantaDto } from './dto';
import { UuidValidationPipe } from '../../common/pipes/uuid-validation.pipe';

@ApiTags('Plantas')
@ApiBearerAuth()
@Controller('plantas')
export class PlantasController {
  constructor(private readonly plantasService: PlantasService) {}

  @Post()
  @ApiOperation({ summary: 'Crear planta' })
  create(@Body() createPlantaDto: CreatePlantaDto) {
    return this.plantasService.create(createPlantaDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar plantas' })
  @ApiQuery({ name: 'seccionId', required: false })
  findAll(@Query('seccionId') seccionId?: string) {
    return this.plantasService.findAll(seccionId);
  }

  @Get('search')
  @ApiOperation({ summary: 'Buscar plantas por nombre' })
  @ApiQuery({ name: 'term', required: true })
  search(@Query('term') term: string) {
    return this.plantasService.search(term);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener planta por ID' })
  findOne(@Param('id', UuidValidationPipe) id: string) {
    return this.plantasService.findOne(id);
  }

  @Get(':id/completa')
  @ApiOperation({ summary: 'Obtener planta con toda su información' })
  findOneComplete(@Param('id', UuidValidationPipe) id: string) {
    return this.plantasService.findOneComplete(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar planta' })
  update(
    @Param('id', UuidValidationPipe) id: string,
    @Body() updatePlantaDto: UpdatePlantaDto,
  ) {
    return this.plantasService.update(id, updatePlantaDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar planta' })
  remove(@Param('id', UuidValidationPipe) id: string) {
    return this.plantasService.remove(id);
  }
}
