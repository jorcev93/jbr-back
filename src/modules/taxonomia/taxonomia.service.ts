import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Taxonomia } from './entities/taxonomia.entity';
import { CreateTaxonomiaDto, UpdateTaxonomiaDto } from './dto';

@Injectable()
export class TaxonomiaService {
  constructor(
    @InjectRepository(Taxonomia)
    private taxonomiaRepository: Repository<Taxonomia>,
  ) {}

  async create(createTaxonomiaDto: CreateTaxonomiaDto) {
    const existing = await this.taxonomiaRepository.findOne({
      where: { plantaId: createTaxonomiaDto.plantaId },
    });

    if (existing) {
      throw new ConflictException('Ya existe taxonomía para esta planta');
    }

    const taxonomia = this.taxonomiaRepository.create(createTaxonomiaDto);
    return this.taxonomiaRepository.save(taxonomia);
  }

  async findByPlanta(plantaId: string) {
    const taxonomia = await this.taxonomiaRepository.findOne({
      where: { plantaId },
    });

    if (!taxonomia) {
      throw new NotFoundException(
        `Taxonomía para planta ${plantaId} no encontrada`,
      );
    }

    return taxonomia;
  }

  async update(plantaId: string, updateTaxonomiaDto: UpdateTaxonomiaDto) {
    const taxonomia = await this.findByPlanta(plantaId);
    Object.assign(taxonomia, updateTaxonomiaDto);
    return this.taxonomiaRepository.save(taxonomia);
  }

  async remove(plantaId: string) {
    const taxonomia = await this.findByPlanta(plantaId);
    await this.taxonomiaRepository.remove(taxonomia);
    return { message: 'Taxonomía eliminada exitosamente' };
  }
}
