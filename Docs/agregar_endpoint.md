# Guía para implementar Paginación en `jbre-back`

Actualmente tu aplicación Flutter ya cuenta con el soporte para enviar los parámetros `limit` y `offset` (o `page` y `limit`) a través del método `getPlantsByPage` en el repositorio de plantas.

Sin embargo, al revisar el código fuente de tu directorio `jbre-back`, noto que solo contiene los archivos compilados en la carpeta `dist/` y no los archivos fuente originales (`src/`). Además, no se encontró un controlador funcional de `plantas.controller.ts` dentro de los archivos compilados que actualmente reciba parámetros de consulta (`@Query`).

Para que tu aplicación Flutter funcione como esperas, necesitas añadir paginación al endpoint GET `/plantas` en el backend. 

### Pasos a seguir en NestJS (en tu código fuente original)

#### 1. Actualizar el DTO de Paginación (Opcional pero Recomendado)
Crea un archivo llamado `pagination.dto.ts` en tu carpeta `common/dto/` (o donde manejes tus utilidades compartidas):

```typescript
import { Type } from 'class-transformer';
import { IsOptional, IsPositive, Min } from 'class-validator';

export class PaginationDto {
  @IsOptional()
  @IsPositive()
  @Type(() => Number) // Convierte a número la query string
  limit?: number;

  @IsOptional()
  @Min(0)
  @Type(() => Number)
  offset?: number;
}
```

#### 2. Actualizar `plantas.controller.ts`
Busca el método que maneja la petición GET global (`findAll`) e inyecta el nuevo decorador `@Query()`:

```typescript
import { Controller, Get, Query } from '@nestjs/common';
import { PlantasService } from './plantas.service';
import { PaginationDto } from '../../common/dto/pagination.dto';

@Controller('plantas')
export class PlantasController {
  constructor(private readonly plantasService: PlantasService) {}

  @Get()
  findAll(@Query() paginationDto: PaginationDto) {
    return this.plantasService.findAll(paginationDto);
  }
}
```

#### 3. Actualizar `plantas.service.ts`
Modifica el servicio para que reciba estos parámetros y los aplique utilizando el repositorio de `TypeORM` con las propiedades `take` (limit) y `skip` (offset).

```typescript
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Planta } from './entities/planta.entity';
import { PaginationDto } from '../../common/dto/pagination.dto';

@Injectable()
export class PlantasService {
  constructor(
    @InjectRepository(Planta)
    private readonly plantaRepository: Repository<Planta>,
  ) {}

  async findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;

    return this.plantaRepository.find({
      take: limit,
      skip: offset,
      where: { estado: true }, // Asumiendo que quieres ignorar los borrados lógicos
      relations: [
        'seccion', 
        'taxonomia', 
        'datosGenerales', 
        'condicionCultivo', 
        'morfologia', 
        'registrosIngreso',
        'registrosIngreso.persona', // Importante para que Flutter reciba todo el anidamiento
      ]
    });
  }
}
```

¡Una vez que apliques estos cambios en el backend, tu código en Flutter en el Datasource funcionará a la perfección con la instrucción `.get('/plantas', queryParameters: {'limit': limit, 'offset': offset})`!
