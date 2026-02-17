import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Seccion } from './entities/seccion.entity';
import { CreateSeccionDto, UpdateSeccionDto } from './dto';

@Injectable()
export class SeccionesService {
  constructor(
    @InjectRepository(Seccion)
    private seccionRepository: Repository<Seccion>,
  ) {}

  async create(createSeccionDto: CreateSeccionDto) {
    const seccion = this.seccionRepository.create(createSeccionDto);
    return this.seccionRepository.save(seccion);
  }

  async findAll() {
    return this.seccionRepository.find({
      where: { estado: true },
    });
  }

  async findOne(id: string) {
    const seccion = await this.seccionRepository.findOne({
      where: { id, estado: true },
      relations: ['plantas'],
    });

    if (!seccion) {
      throw new NotFoundException(`Sección con ID ${id} no encontrada`);
    }

    return seccion;
  }

  async update(id: string, updateSeccionDto: UpdateSeccionDto) {
    const seccion = await this.findOne(id);
    Object.assign(seccion, updateSeccionDto);
    return this.seccionRepository.save(seccion);
  }

  async remove(id: string) {
    const seccion = await this.findOne(id);
    seccion.estado = false;
    await this.seccionRepository.save(seccion);
    return { message: 'Sección eliminada exitosamente' };
  }
}
