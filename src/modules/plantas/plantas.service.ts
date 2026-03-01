import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Planta } from './entities/planta.entity';
import { CreatePlantaDto, UpdatePlantaDto } from './dto';
import { PaginationDto } from '../../common/dto/pagination.dto';

@Injectable()
export class PlantasService {
  constructor(
    @InjectRepository(Planta)
    private plantaRepository: Repository<Planta>,
  ) {}

  async create(createPlantaDto: CreatePlantaDto) {
    try {
      const planta = this.plantaRepository.create(createPlantaDto);
      return await this.plantaRepository.save(planta);
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async findAll(paginationDto: PaginationDto, seccionId?: string) {
    const { limit = 10, offset = 0 } = paginationDto;

    const query = this.plantaRepository
      .createQueryBuilder('planta')
      .leftJoinAndSelect('planta.seccion', 'seccion')
      .leftJoinAndSelect('planta.taxonomia', 'taxonomia')
      .leftJoinAndSelect('planta.datosGenerales', 'datosGenerales')
      .leftJoinAndSelect('planta.condicionCultivo', 'condicionCultivo')
      .leftJoinAndSelect('planta.morfologia', 'morfologia')
      .leftJoinAndSelect('planta.registrosIngreso', 'registrosIngreso')
      .leftJoinAndSelect('registrosIngreso.persona', 'persona')
      .where('planta.estado = :estado', { estado: true })
      .take(limit)
      .skip(offset);

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
    try {
      return await this.plantaRepository.save(planta);
    } catch (error) {
      this.handleDBExceptions(error);
    }
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

  private handleDBExceptions(error: any) {
    if (error.code === '23505') {
      throw new BadRequestException('Ya existe una planta con este nombre científico');
    }
    console.error(error);
    throw new InternalServerErrorException(
      'Error inesperado, comuníquese con el administrador',
    );
  }
}
