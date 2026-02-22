import { Injectable, ConflictException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Rol } from '../usuarios/entities/rol.entity';
import { Persona } from '../usuarios/entities/persona.entity';
import { Cuenta } from '../usuarios/entities/cuenta.entity';

const ROLES_SEED = ['admin', 'user'] as const;
const ROL_ADMIN = 'admin';
const ADMIN_NOMBRE_DEFAULT = 'Admin';
const ADMIN_APELLIDO_DEFAULT = 'Sistema';

@Injectable()
export class SeedService {
  constructor(
    @InjectRepository(Rol)
    private readonly rolRepository: Repository<Rol>,
    @InjectRepository(Persona)
    private readonly personaRepository: Repository<Persona>,
    @InjectRepository(Cuenta)
    private readonly cuentaRepository: Repository<Cuenta>,
    private readonly configService: ConfigService,
  ) {}

  async run(): Promise<{
    message: string;
    admin: { email: string; nombre: string; rol: string };
  }> {
    const email: string =
      this.configService.get<string>('SEED_ADMIN_EMAIL') || 'admin@jbre.local';
    const password: string =
      this.configService.get<string>('SEED_ADMIN_PASSWORD') || 'Admin123!';
    const nombre: string =
      this.configService.get<string>('SEED_ADMIN_NOMBRE') ||
      ADMIN_NOMBRE_DEFAULT;
    const apellido: string =
      this.configService.get<string>('SEED_ADMIN_APELLIDO') ||
      ADMIN_APELLIDO_DEFAULT;

    const cuentaExistente = await this.cuentaRepository.findOne({
      where: { email },
    });

    if (cuentaExistente) {
      throw new ConflictException(
        `El usuario administrador con email "${email}" ya existe.`,
      );
    }

    // Crear roles admin y user si no existen
    for (const nombreRol of ROLES_SEED) {
      const existe = await this.rolRepository.findOne({
        where: { nombre: nombreRol, estado: true },
      });
      if (!existe) {
        const nuevoRol = this.rolRepository.create({ nombre: nombreRol });
        await this.rolRepository.save(nuevoRol);
      }
    }

    const rolAdmin = await this.rolRepository.findOneOrFail({
      where: { nombre: ROL_ADMIN, estado: true },
    });

    const persona = this.personaRepository.create({
      nombre,
      apellido,
      rolId: rolAdmin.id,
    });
    const personaGuardada = await this.personaRepository.save(persona);

    const contrasenaHash = await bcrypt.hash(password, 10);
    const cuenta = this.cuentaRepository.create({
      email,
      contrasena: contrasenaHash,
      personaId: personaGuardada.id,
    });
    await this.cuentaRepository.save(cuenta);

    return {
      message:
        'Seed ejecutado correctamente. Roles (admin, user) y usuario administrador creados.',
      admin: {
        email,
        nombre: `${nombre} ${apellido}`,
        rol: ROL_ADMIN,
      },
    };
  }
}
