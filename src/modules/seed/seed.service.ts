import { Injectable, ConflictException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Rol } from '../usuarios/entities/rol.entity';
import { Persona } from '../usuarios/entities/persona.entity';
import { Cuenta } from '../usuarios/entities/cuenta.entity';

const ROL_ADMIN_NOMBRE = 'Administrador';
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

    let rolAdmin = await this.rolRepository.findOne({
      where: { nombre: ROL_ADMIN_NOMBRE, estado: true },
    });

    if (!rolAdmin) {
      const nuevoRol = this.rolRepository.create({
        nombre: ROL_ADMIN_NOMBRE,
      });
      rolAdmin = await this.rolRepository.save(nuevoRol);
    }

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
      message: 'Seed ejecutado correctamente. Usuario administrador creado.',
      admin: {
        email,
        nombre: `${nombre} ${apellido}`,
        rol: ROL_ADMIN_NOMBRE,
      },
    };
  }
}
