import { Injectable, ConflictException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Rol } from '../usuarios/entities/rol.entity';
import { Persona } from '../usuarios/entities/persona.entity';
import { Cuenta } from '../usuarios/entities/cuenta.entity';
import { PlantasService } from '../plantas/plantas.service';
import { SeccionesService } from '../secciones/secciones.service';
import { TaxonomiaService } from '../taxonomia/taxonomia.service';
import { DatosGeneralesService } from '../datos-generales/datos-generales.service';
import { CondicionCultivoService } from '../condicion-cultivo/condicion-cultivo.service';
import { MorfologiaService } from '../morfologia/morfologia.service';
import { RegistroIngresoService } from '../registro-ingreso/registro-ingreso.service';
import { initialPlantasCompleta } from './data/plantas.seed';

const ROLES_SEED = ['admin', 'user'] as const;
const ROL_ADMIN = 'admin';
const ADMIN_NOMBRE_DEFAULT = 'Jorge';
const ADMIN_APELLIDO_DEFAULT = 'Cevallos';

@Injectable()
export class SeedService {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectRepository(Rol)
    private readonly rolRepository: Repository<Rol>,
    @InjectRepository(Persona)
    private readonly personaRepository: Repository<Persona>,
    @InjectRepository(Cuenta)
    private readonly cuentaRepository: Repository<Cuenta>,
    private readonly configService: ConfigService,
    private readonly plantasService: PlantasService,
    private readonly seccionesService: SeccionesService,
    private readonly taxonomiaService: TaxonomiaService,
    private readonly datosGeneralesService: DatosGeneralesService,
    private readonly condicionCultivoService: CondicionCultivoService,
    private readonly morfologiaService: MorfologiaService,
    private readonly registroIngresoService: RegistroIngresoService,
    private readonly dataSource: DataSource,
  ) {}

  async clearDatabase() {
    this.logger.log('Borrando base de datos...');
    
    // Obtenemos todas las entidades de TypeORM
    const entities = this.dataSource.entityMetadatas;
    
    // Eliminamos la informacion de cada tabla usando CASCADE para evitar conflictos de llave foránea
    for (const entity of entities) {
      const repository = this.dataSource.getRepository(entity.name);
      await repository.query(`TRUNCATE TABLE "${entity.tableName}" CASCADE;`);
    }

    this.logger.log('Base de datos borrada con éxito');
    return {
      message: 'La base de datos ha sido borrada correctamente.',
    };
  }

  async run() {
    const email: string =
      this.configService.get<string>('SEED_ADMIN_EMAIL') || 'jorge@test.com';
    const password: string =
      this.configService.get<string>('SEED_ADMIN_PASSWORD') || 'Jorge123';
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

    const passwordHash = await bcrypt.hash(password, 10);
    const cuenta = this.cuentaRepository.create({
      email,
      password: passwordHash,
      personaId: personaGuardada.id,
    });
    await this.cuentaRepository.save(cuenta);

    const plantasSeeded = await this.seedPlantas(personaGuardada.id);

    return {
      message:
        'Seed ejecutado correctamente. Roles (admin, user), usuario administrador y plantas de prueba creados.',
      admin: {
        email,
        nombre: `${nombre} ${apellido}`,
        rol: ROL_ADMIN,
      },
      plantasInsertadas: plantasSeeded,
    };
  }

  private async seedPlantas(personaId: string): Promise<number> {
    const plantasExisten = await this.plantasService.findAll({});
    if (plantasExisten.length > 0) return 0;
    
    let insertCount = 0;

    // Crear primera sección por default para agrupar en caso de no crear una para la planta
    const defaultSeccion = await this.seccionesService.create({
      nombre: 'General',
      descripcion: 'Sección general para plantas sin clasificar'
    });

    for (const data of initialPlantasCompleta) {
      let seccionId = defaultSeccion.id;

      // Intentar crear la sección si la data la incluye
      if (data.seccion) {
        try {
          const nuevaSeccion = await this.seccionesService.create(data.seccion);
          seccionId = nuevaSeccion.id;
        } catch (error) {
          this.logger.warn(`No se pudo crear la seccion ${data.seccion.nombre}, usando general.`);
        }
      }

      // 1. Crear Planta
      const plantaCreated = await this.plantasService.create({
        ...data.planta,
        seccionId,
      });

      // 2. Crear Relaciones Hijas usando el plantaID recién generado
      if (data.taxonomia) {
        await this.taxonomiaService.create({
          ...data.taxonomia,
          plantaId: plantaCreated.id,
        });
      }

      if (data.datosGenerales) {
        await this.datosGeneralesService.create({
          ...data.datosGenerales,
          plantaId: plantaCreated.id,
        });
      }

      if (data.condicionCultivo) {
        await this.condicionCultivoService.create({
          ...data.condicionCultivo,
          plantaId: plantaCreated.id,
        });
      }

      if (data.morfologia) {
        await this.morfologiaService.create({ plantaId: plantaCreated.id });
        const morfologiaCreated = await this.morfologiaService.findByPlanta(plantaCreated.id);
        
        const morfo: any = data.morfologia;
        if (morfo.hojas) await this.morfologiaService.createOrUpdateHojas(morfologiaCreated.id, morfo.hojas);
        if (morfo.tallo) await this.morfologiaService.createOrUpdateTallo(morfologiaCreated.id, morfo.tallo);
        if (morfo.raiz) await this.morfologiaService.createOrUpdateRaiz(morfologiaCreated.id, morfo.raiz);
        if (morfo.flor) await this.morfologiaService.createOrUpdateFlor(morfologiaCreated.id, morfo.flor);
        if (morfo.inflorescencia) await this.morfologiaService.createOrUpdateInflorescencia(morfologiaCreated.id, morfo.inflorescencia);
        if (morfo.fruto) await this.morfologiaService.createOrUpdateFruto(morfologiaCreated.id, morfo.fruto);
      }

      if (data.registrosIngreso) {
        for (const registro of data.registrosIngreso) {
          await this.registroIngresoService.create({
            ...registro,
            plantaId: plantaCreated.id,
            personaId,
          });
        }
      }

      insertCount++;
    }

    return insertCount;
  }
}
