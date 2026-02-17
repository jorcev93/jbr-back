import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Morfologia,
  Hojas,
  Tallo,
  Raiz,
  Flor,
  Inflorescencia,
  Fruto,
} from './entities';
import {
  CreateMorfologiaDto,
  CreateHojasDto,
  CreateTalloDto,
  CreateRaizDto,
  CreateFlorDto,
  CreateInflorescenciaDto,
  CreateFrutoDto,
} from './dto';

@Injectable()
export class MorfologiaService {
  constructor(
    @InjectRepository(Morfologia)
    private morfologiaRepository: Repository<Morfologia>,
    @InjectRepository(Hojas)
    private hojasRepository: Repository<Hojas>,
    @InjectRepository(Tallo)
    private talloRepository: Repository<Tallo>,
    @InjectRepository(Raiz)
    private raizRepository: Repository<Raiz>,
    @InjectRepository(Flor)
    private florRepository: Repository<Flor>,
    @InjectRepository(Inflorescencia)
    private inflorescenciaRepository: Repository<Inflorescencia>,
    @InjectRepository(Fruto)
    private frutoRepository: Repository<Fruto>,
  ) {}

  // Morfología principal
  async create(createMorfologiaDto: CreateMorfologiaDto) {
    const existing = await this.morfologiaRepository.findOne({
      where: { plantaId: createMorfologiaDto.plantaId },
    });

    if (existing) {
      throw new ConflictException('Ya existe morfología para esta planta');
    }

    const morfologia = this.morfologiaRepository.create(createMorfologiaDto);
    return this.morfologiaRepository.save(morfologia);
  }

  async findByPlanta(plantaId: string) {
    const morfologia = await this.morfologiaRepository.findOne({
      where: { plantaId },
      relations: ['hojas', 'tallo', 'raiz', 'flor', 'inflorescencia', 'fruto'],
    });

    if (!morfologia) {
      throw new NotFoundException(
        `Morfología para planta ${plantaId} no encontrada`,
      );
    }

    return morfologia;
  }

  async remove(plantaId: string) {
    const morfologia = await this.findByPlanta(plantaId);
    await this.morfologiaRepository.remove(morfologia);
    return { message: 'Morfología eliminada exitosamente' };
  }

  // Hojas
  async createOrUpdateHojas(
    morfologiaId: string,
    createHojasDto: CreateHojasDto,
  ) {
    let hojas = await this.hojasRepository.findOne({ where: { morfologiaId } });

    if (hojas) {
      Object.assign(hojas, createHojasDto);
    } else {
      hojas = this.hojasRepository.create({ ...createHojasDto, morfologiaId });
    }

    return this.hojasRepository.save(hojas);
  }

  async getHojas(morfologiaId: string) {
    return this.hojasRepository.findOne({ where: { morfologiaId } });
  }

  // Tallo
  async createOrUpdateTallo(
    morfologiaId: string,
    createTalloDto: CreateTalloDto,
  ) {
    let tallo = await this.talloRepository.findOne({ where: { morfologiaId } });

    if (tallo) {
      Object.assign(tallo, createTalloDto);
    } else {
      tallo = this.talloRepository.create({ ...createTalloDto, morfologiaId });
    }

    return this.talloRepository.save(tallo);
  }

  async getTallo(morfologiaId: string) {
    return this.talloRepository.findOne({ where: { morfologiaId } });
  }

  // Raíz
  async createOrUpdateRaiz(morfologiaId: string, createRaizDto: CreateRaizDto) {
    let raiz = await this.raizRepository.findOne({ where: { morfologiaId } });

    if (raiz) {
      Object.assign(raiz, createRaizDto);
    } else {
      raiz = this.raizRepository.create({ ...createRaizDto, morfologiaId });
    }

    return this.raizRepository.save(raiz);
  }

  async getRaiz(morfologiaId: string) {
    return this.raizRepository.findOne({ where: { morfologiaId } });
  }

  // Flor
  async createOrUpdateFlor(morfologiaId: string, createFlorDto: CreateFlorDto) {
    let flor = await this.florRepository.findOne({ where: { morfologiaId } });

    if (flor) {
      Object.assign(flor, createFlorDto);
    } else {
      flor = this.florRepository.create({ ...createFlorDto, morfologiaId });
    }

    return this.florRepository.save(flor);
  }

  async getFlor(morfologiaId: string) {
    return this.florRepository.findOne({ where: { morfologiaId } });
  }

  // Inflorescencia
  async createOrUpdateInflorescencia(
    morfologiaId: string,
    createInflorescenciaDto: CreateInflorescenciaDto,
  ) {
    let inflorescencia = await this.inflorescenciaRepository.findOne({
      where: { morfologiaId },
    });

    if (inflorescencia) {
      Object.assign(inflorescencia, createInflorescenciaDto);
    } else {
      inflorescencia = this.inflorescenciaRepository.create({
        ...createInflorescenciaDto,
        morfologiaId,
      });
    }

    return this.inflorescenciaRepository.save(inflorescencia);
  }

  async getInflorescencia(morfologiaId: string) {
    return this.inflorescenciaRepository.findOne({ where: { morfologiaId } });
  }

  // Fruto
  async createOrUpdateFruto(
    morfologiaId: string,
    createFrutoDto: CreateFrutoDto,
  ) {
    let fruto = await this.frutoRepository.findOne({ where: { morfologiaId } });

    if (fruto) {
      Object.assign(fruto, createFrutoDto);
    } else {
      fruto = this.frutoRepository.create({ ...createFrutoDto, morfologiaId });
    }

    return this.frutoRepository.save(fruto);
  }

  async getFruto(morfologiaId: string) {
    return this.frutoRepository.findOne({ where: { morfologiaId } });
  }
}
