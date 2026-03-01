import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Foto } from './entities/foto.entity';
import { CreateFotoDto } from './dto';
import { STORAGE_SERVICE } from '../../common/storage';
import type { StorageService } from '../../common/storage';

@Injectable()
export class FotosService {
  constructor(
    @InjectRepository(Foto)
    private fotoRepository: Repository<Foto>,
    @Inject(STORAGE_SERVICE)
    private storageService: StorageService,
  ) {}

  async create(
    plantaId: string,
    file: Express.Multer.File,
    createFotoDto: CreateFotoDto,
  ) {
    const result = await this.storageService.upload(file);

    const foto = this.fotoRepository.create({
      plantaId,
      nombre: result.key,
      ruta: result.url,
      descripcion: createFotoDto.descripcion,
      tipo: createFotoDto.tipo,
    });

    return this.fotoRepository.save(foto);
  }

  async findByPlanta(plantaId: string) {
    return this.fotoRepository.find({
      where: { plantaId },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string) {
    const foto = await this.fotoRepository.findOne({
      where: { id },
    });

    if (!foto) {
      throw new NotFoundException(`Foto con ID ${id} no encontrada`);
    }

    return foto;
  }

  async remove(id: string) {
    const foto = await this.findOne(id);

    // Eliminar archivo del storage
    await this.storageService.delete(foto.nombre);

    await this.fotoRepository.remove(foto);
    return { message: 'Foto eliminada exitosamente' };
  }

  async removeByPlanta(plantaId: string) {
    const fotos = await this.findByPlanta(plantaId);

    for (const foto of fotos) {
      await this.storageService.delete(foto.nombre);
    }

    await this.fotoRepository.remove(fotos);
    return { message: 'Todas las fotos de la planta eliminadas' };
  }
}
