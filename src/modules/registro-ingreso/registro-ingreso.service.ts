import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RegistroIngreso } from './entities/registro-ingreso.entity';
import { CreateRegistroIngresoDto, UpdateRegistroIngresoDto } from './dto';

@Injectable()
export class RegistroIngresoService {
  constructor(
    @InjectRepository(RegistroIngreso)
    private registroIngresoRepository: Repository<RegistroIngreso>,
  ) {}

  async create(createRegistroIngresoDto: CreateRegistroIngresoDto) {
    const registro = this.registroIngresoRepository.create({
      ...createRegistroIngresoDto,
      fechaIngreso: new Date(createRegistroIngresoDto.fechaIngreso),
    });
    return this.registroIngresoRepository.save(registro);
  }

  async findAll() {
    return this.registroIngresoRepository.find({
      relations: ['planta', 'persona'],
    });
  }

  async findByPlanta(plantaId: string) {
    return this.registroIngresoRepository.find({
      where: { plantaId },
      relations: ['persona'],
    });
  }

  async findOne(id: string) {
    const registro = await this.registroIngresoRepository.findOne({
      where: { id },
      relations: ['planta', 'persona'],
    });

    if (!registro) {
      throw new NotFoundException(
        `Registro de ingreso con ID ${id} no encontrado`,
      );
    }

    return registro;
  }

  async update(id: string, updateRegistroIngresoDto: UpdateRegistroIngresoDto) {
    const registro = await this.findOne(id);
    Object.assign(registro, {
      ...updateRegistroIngresoDto,
      fechaIngreso: updateRegistroIngresoDto.fechaIngreso
        ? new Date(updateRegistroIngresoDto.fechaIngreso)
        : registro.fechaIngreso,
    });
    return this.registroIngresoRepository.save(registro);
  }

  async remove(id: string) {
    const registro = await this.findOne(id);
    await this.registroIngresoRepository.remove(registro);
    return { message: 'Registro de ingreso eliminado exitosamente' };
  }
}
