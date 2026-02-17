import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Planta } from './entities/planta.entity';
import { CreatePlantaDto, UpdatePlantaDto } from './dto';

@Injectable()
export class PlantasService {
  constructor(
    @InjectRepository(Planta)
    private plantaRepository: Repository<Planta>,
  ) {}

  async create(createPlantaDto: CreatePlantaDto) {
    const planta = this.plantaRepository.create(createPlantaDto);
    return this.plantaRepository.save(planta);
  }

  async findAll(seccionId?: string) {
    const query = this.plantaRepository
      .createQueryBuilder('planta')
      .leftJoinAndSelect('planta.seccion', 'seccion')
      .where('planta.estado = :estado', { estado: true });

    if (seccionId) {
      query.andWhere('planta.seccionId = :seccionId', { seccionId });
    }

    return query.getMany();
  }

  async findOne(id: string) {
    const planta = await this.plantaRepository.findOne({
      where: { id, estado: true },
      relations: ['seccion'],
    });

    if (!planta) {
      throw new NotFoundException(`Planta con ID ${id} no encontrada`);
    }

    return planta;
  }

  async findOneComplete(id: string) {
    const planta = await this.plantaRepository.findOne({
      where: { id, estado: true },
      relations: [
        'seccion',
        'datosGenerales',
        'taxonomia',
        'condicionCultivo',
        'morfologia',
        'morfologia.hojas',
        'morfologia.tallo',
        'morfologia.raiz',
        'morfologia.flor',
        'morfologia.inflorescencia',
        'morfologia.fruto',
        'fotos',
        'registrosIngreso',
        'registrosIngreso.persona',
      ],
    });

    if (!planta) {
      throw new NotFoundException(`Planta con ID ${id} no encontrada`);
    }

    return planta;
  }

  async update(id: string, updatePlantaDto: UpdatePlantaDto) {
    const planta = await this.findOne(id);
    Object.assign(planta, updatePlantaDto);
    return this.plantaRepository.save(planta);
  }

  async remove(id: string) {
    const planta = await this.findOne(id);
    planta.estado = false;
    await this.plantaRepository.save(planta);
    return { message: 'Planta eliminada exitosamente' };
  }

  async search(term: string) {
    return this.plantaRepository
      .createQueryBuilder('planta')
      .leftJoinAndSelect('planta.seccion', 'seccion')
      .where('planta.estado = :estado', { estado: true })
      .andWhere(
        '(planta.nombreCientifico ILIKE :term OR planta.nombreComun ILIKE :term)',
        { term: `%${term}%` },
      )
      .getMany();
  }
}
