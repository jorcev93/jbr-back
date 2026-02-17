import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DatosGenerales } from './entities/datos-generales.entity';
import { CreateDatosGeneralesDto, UpdateDatosGeneralesDto } from './dto';

@Injectable()
export class DatosGeneralesService {
  constructor(
    @InjectRepository(DatosGenerales)
    private datosGeneralesRepository: Repository<DatosGenerales>,
  ) {}

  async create(createDatosGeneralesDto: CreateDatosGeneralesDto) {
    const existing = await this.datosGeneralesRepository.findOne({
      where: { plantaId: createDatosGeneralesDto.plantaId },
    });

    if (existing) {
      throw new ConflictException(
        'Ya existen datos generales para esta planta',
      );
    }

    const datos = this.datosGeneralesRepository.create(createDatosGeneralesDto);
    return this.datosGeneralesRepository.save(datos);
  }

  async findByPlanta(plantaId: string) {
    const datos = await this.datosGeneralesRepository.findOne({
      where: { plantaId },
    });

    if (!datos) {
      throw new NotFoundException(
        `Datos generales para planta ${plantaId} no encontrados`,
      );
    }

    return datos;
  }

  async update(
    plantaId: string,
    updateDatosGeneralesDto: UpdateDatosGeneralesDto,
  ) {
    const datos = await this.findByPlanta(plantaId);
    Object.assign(datos, updateDatosGeneralesDto);
    return this.datosGeneralesRepository.save(datos);
  }

  async remove(plantaId: string) {
    const datos = await this.findByPlanta(plantaId);
    await this.datosGeneralesRepository.remove(datos);
    return { message: 'Datos generales eliminados exitosamente' };
  }
}
