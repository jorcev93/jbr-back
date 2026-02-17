import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Rol, Persona, Cuenta } from './entities';
import { CreateRolDto, CreatePersonaDto, UpdatePersonaDto } from './dto';

@Injectable()
export class UsuariosService {
  constructor(
    @InjectRepository(Rol)
    private rolRepository: Repository<Rol>,
    @InjectRepository(Persona)
    private personaRepository: Repository<Persona>,
    @InjectRepository(Cuenta)
    private cuentaRepository: Repository<Cuenta>,
  ) {}

  // Roles
  async createRol(createRolDto: CreateRolDto) {
    const rol = this.rolRepository.create(createRolDto);
    return this.rolRepository.save(rol);
  }

  async findAllRoles() {
    return this.rolRepository.find({
      where: { estado: true },
    });
  }

  async findRolById(id: string) {
    const rol = await this.rolRepository.findOne({
      where: { id, estado: true },
    });

    if (!rol) {
      throw new NotFoundException(`Rol con ID ${id} no encontrado`);
    }

    return rol;
  }

  // Personas
  async createPersona(createPersonaDto: CreatePersonaDto) {
    const { fechaNacimiento, ...rest } = createPersonaDto;
    const persona = this.personaRepository.create({
      ...rest,
      ...(fechaNacimiento && { fechaNacimiento: new Date(fechaNacimiento) }),
    });
    return this.personaRepository.save(persona);
  }

  async findAllPersonas() {
    return this.personaRepository.find({
      where: { estado: true },
      relations: ['rol'],
    });
  }

  async findPersonaById(id: string) {
    const persona = await this.personaRepository.findOne({
      where: { id, estado: true },
      relations: ['rol', 'cuenta'],
    });

    if (!persona) {
      throw new NotFoundException(`Persona con ID ${id} no encontrada`);
    }

    return persona;
  }

  async updatePersona(id: string, updatePersonaDto: UpdatePersonaDto) {
    const persona = await this.findPersonaById(id);

    Object.assign(persona, {
      ...updatePersonaDto,
      fechaNacimiento: updatePersonaDto.fechaNacimiento
        ? new Date(updatePersonaDto.fechaNacimiento)
        : persona.fechaNacimiento,
    });

    return this.personaRepository.save(persona);
  }

  async removePersona(id: string) {
    const persona = await this.findPersonaById(id);
    persona.estado = false;
    await this.personaRepository.save(persona);
    return { message: 'Persona eliminada exitosamente' };
  }

  // Autores y Colectores
  async findAutores() {
    return this.personaRepository.find({
      where: { esAutor: true, estado: true },
      relations: ['rol'],
    });
  }

  async findColectores() {
    return this.personaRepository.find({
      where: { esColector: true, estado: true },
      relations: ['rol'],
    });
  }
}
