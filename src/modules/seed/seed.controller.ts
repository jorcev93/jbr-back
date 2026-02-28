import { Controller, Post, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { SeedService } from './seed.service';

@ApiTags('Seed')
@Controller('seed')
export class SeedController {
  constructor(private readonly seedService: SeedService) {}

  @Public()
  @Post()
  @ApiOperation({
    summary: 'Ejecutar seed',
    description:
      'Crea el rol Administrador y el usuario administrador inicial. Solo puede ejecutarse una vez (si el admin ya existe devuelve error).',
  })
  @ApiResponse({ status: 201, description: 'Seed ejecutado correctamente' })
  @ApiResponse({
    status: 409,
    description: 'El usuario administrador ya existe',
  })
  run() {
    return this.seedService.run();
  }

  @Public()
  @Delete()
  @ApiOperation({
    summary: 'Limpiar la base de datos',
    description: 'Elimina todos los registros de la base de datos de manera segura.',
  })
  @ApiResponse({ status: 200, description: 'Base de datos limpiada correctamente' })
  clearDatabase() {
    return this.seedService.clearDatabase();
  }
}
