import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Foto } from './entities/foto.entity';
import { CreateFotoDto } from './dto';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class FotosService {
  constructor(
    @InjectRepository(Foto)
    private fotoRepository: Repository<Foto>,
  ) {}

  async create(
    plantaId: string,
    file: Express.Multer.File,
    createFotoDto: CreateFotoDto,
  ) {
    const foto = this.fotoRepository.create({
      plantaId,
      nombre: file.filename,
      ruta: `/uploads/${file.filename}`,
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

    // Eliminar archivo físico
    const filePath = path.join(process.cwd(), 'uploads', foto.nombre);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await this.fotoRepository.remove(foto);
    return { message: 'Foto eliminada exitosamente' };
  }

  async removeByPlanta(plantaId: string) {
    const fotos = await this.findByPlanta(plantaId);

    for (const foto of fotos) {
      const filePath = path.join(process.cwd(), 'uploads', foto.nombre);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await this.fotoRepository.remove(fotos);
    return { message: 'Todas las fotos de la planta eliminadas' };
  }
}
