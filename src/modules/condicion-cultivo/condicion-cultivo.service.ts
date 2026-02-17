import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CondicionCultivo } from './entities/condicion-cultivo.entity';
import { CreateCondicionCultivoDto, UpdateCondicionCultivoDto } from './dto';

@Injectable()
export class CondicionCultivoService {
  constructor(
    @InjectRepository(CondicionCultivo)
    private condicionCultivoRepository: Repository<CondicionCultivo>,
  ) {}

  async create(createCondicionCultivoDto: CreateCondicionCultivoDto) {
    const existing = await this.condicionCultivoRepository.findOne({
      where: { plantaId: createCondicionCultivoDto.plantaId },
    });

    if (existing) {
      throw new ConflictException(
        'Ya existen condiciones de cultivo para esta planta',
      );
    }

    const condicion = this.condicionCultivoRepository.create(
      createCondicionCultivoDto,
    );
    return this.condicionCultivoRepository.save(condicion);
  }

  async findByPlanta(plantaId: string) {
    const condicion = await this.condicionCultivoRepository.findOne({
      where: { plantaId },
    });

    if (!condicion) {
      throw new NotFoundException(
        `Condiciones de cultivo para planta ${plantaId} no encontradas`,
      );
    }

    return condicion;
  }

  async update(
    plantaId: string,
    updateCondicionCultivoDto: UpdateCondicionCultivoDto,
  ) {
    const condicion = await this.findByPlanta(plantaId);
    Object.assign(condicion, updateCondicionCultivoDto);
    return this.condicionCultivoRepository.save(condicion);
  }

  async remove(plantaId: string) {
    const condicion = await this.findByPlanta(plantaId);
    await this.condicionCultivoRepository.remove(condicion);
    return { message: 'Condiciones de cultivo eliminadas exitosamente' };
  }
}
