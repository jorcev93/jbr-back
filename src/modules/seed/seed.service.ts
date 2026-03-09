import { Injectable, ConflictException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as fs from 'fs';
import * as path from 'path';
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
import { RAGService, PlantSyncSubscriber } from '../rag';
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
    private readonly ragService: RAGService,
    private readonly plantSyncSubscriber: PlantSyncSubscriber,
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
    // Pausar sincronización automática durante el seed
    this.plantSyncSubscriber.pause();

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

    // Sincronizar embeddings para RAG
    this.logger.log('Sincronizando embeddings para RAG...');
    const ragResult = await this.ragService.syncAllPlantEmbeddings();

    // Reanudar sincronización automática
    this.plantSyncSubscriber.resume();

    return {
      message:
        'Seed ejecutado correctamente. Roles (admin, user), usuario administrador y plantas de prueba creados.',
      admin: {
        email,
        nombre: `${nombre} ${apellido}`,
        rol: ROL_ADMIN,
      },
      plantasInsertadas: plantasSeeded,
      embeddingsSincronizados: ragResult.synced,
      embeddingsErrores: ragResult.errors,
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

  /**
   * Seed con datos del Jardín Botánico Reinaldo Espinosa (JBRE)
   * Carga plantas usando dataset normalizado
   */
  async runJBRE() {
    // Pausar sincronización automática durante el seed
    this.plantSyncSubscriber.pause();

    this.logger.log('Iniciando seed del Jardín Botánico Reinaldo Espinosa desde JSON unificado...');

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

    // Verificar si ya existe el admin
    let adminPersonaId: string;
    const cuentaExistente = await this.cuentaRepository.findOne({
      where: { email },
      relations: ['persona'],
    });

    if (cuentaExistente) {
      adminPersonaId = cuentaExistente.personaId;
      this.logger.log('Usuario administrador ya existe, usando existente como fallback.');
    } else {
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
      adminPersonaId = personaGuardada.id;

      const passwordHash = await bcrypt.hash(password, 10);
      const cuenta = this.cuentaRepository.create({
        email,
        password: passwordHash,
        personaId: personaGuardada.id,
      });
      await this.cuentaRepository.save(cuenta);
      this.logger.log('Usuario administrador creado.');
    }

    // Leer archivo JSON asincronamente
    const seedFilePath = path.join(process.cwd(), 'jbre', 'data_normalizada', 'plantas_seed.json');
    if (!fs.existsSync(seedFilePath)) {
      throw new Error(`Archivo ${seedFilePath} no encontrado. Ejecuta parse_jbre.py primero.`);
    }

    const fileRawData = fs.readFileSync(seedFilePath, 'utf8');
    const seedPlantasData = JSON.parse(fileRawData);

    const result = await this.seedPlantasJBRE(seedPlantasData, adminPersonaId);

    // Sincronizar embeddings para RAG
    this.logger.log('Sincronizando embeddings para RAG...');
    const ragResult = await this.ragService.syncAllPlantEmbeddings();

    // Reanudar sincronización automática
    this.plantSyncSubscriber.resume();

    return {
      message: 'Seed JBRE ejecutado correctamente.',
      plantasInsertadas: result.insertCount,
      erroresProcesando: result.errores,
      colectoresCreados: result.colectoresCount,
      embeddingsSincronizados: ragResult.synced,
      embeddingsErrores: ragResult.errors,
    };
  }

  private cleanObject(obj: any): any | undefined {
    if (!obj) return undefined;
    const cleaned = { ...obj };
    let hasValue = false;
    for (const key of Object.keys(cleaned)) {
      if (cleaned[key] === undefined || cleaned[key] === null || cleaned[key] === '') {
        delete cleaned[key];
      } else {
        hasValue = true;
      }
    }
    return hasValue ? cleaned : undefined;
  }

  private async seedPlantasJBRE(seedData: any[], adminPersonaId: string) {
    // Mapa para almacenar las secciones creadas y evitar duplicados
    const seccionesCreadas = new Map<string, string>();
    // Mapa para almacenar los colectores (personas) para no ir repetidamente a bd si podemos evitarlo
    const colectoresCreados = new Map<string, string>();

    let insertCount = 0;
    let errores = 0;
    let colectoresCount = 0;

    // Crear sección por default
    const defaultSeccion = await this.seccionesService.create({
      nombre: 'Sin Clasificar',
      descripcion: 'Plantas sin sección asignada',
    });
    seccionesCreadas.set('Sin Clasificar', defaultSeccion.id);

    this.logger.log(`Procesando ${seedData.length} plantas...`);

    for (let i = 0; i < seedData.length; i++) {
      const data = seedData[i];

      try {
        let seccionId = defaultSeccion.id;

        // Crear o reutilizar sección
        if (data.seccion) {
          if (seccionesCreadas.has(data.seccion)) {
            seccionId = seccionesCreadas.get(data.seccion)!;
          } else {
            try {
              const nuevaSeccion = await this.seccionesService.create({
                nombre: data.seccion,
                descripcion: `Sección ${data.seccion} del Jardín Botánico Reinaldo Espinosa`
              });
              seccionId = nuevaSeccion.id;
              seccionesCreadas.set(data.seccion, seccionId);
            } catch {
              // La sección ya existe, buscarla
              const existente = await this.seccionesService.findByName(data.seccion);
              if (existente) {
                seccionId = existente.id;
                seccionesCreadas.set(data.seccion, seccionId);
              }
            }
          }
        }

        // 1. Crear Planta
        const plantaCreated = await this.plantasService.create({
          nombreCientifico: data.nombreCientifico,
          nombreComun: data.nombreComun || undefined,
          sinonimos: data.sinonimos || undefined,
          descripcion: data.descripcion || undefined,
          usos: data.usos || undefined,
          seccionId,
        });

        // 2. Crear Taxonomía
        const taxonomiaClean = this.cleanObject(data.taxonomia);
        if (taxonomiaClean) {
          await this.taxonomiaService.create({
            ...taxonomiaClean,
            plantaId: plantaCreated.id,
          });
        }

        // 3. Crear Datos Generales
        const datosGenClean = this.cleanObject(data.datosGenerales);
        if (datosGenClean) {
          await this.datosGeneralesService.create({
            ...datosGenClean,
            plantaId: plantaCreated.id,
          });
        }

        // 4. Crear Condición de Cultivo
        const condicionCultClean = this.cleanObject(data.condicionCultivo);
        if (condicionCultClean) {
          await this.condicionCultivoService.create({
            ...condicionCultClean,
            plantaId: plantaCreated.id,
          });
        }

        // 5. Crear Morfología y sus sub-entidades
        if (data.morfologia && Object.keys(data.morfologia).length > 0) {
          await this.morfologiaService.create({ plantaId: plantaCreated.id });
          const morfologiaCreated = await this.morfologiaService.findByPlanta(plantaCreated.id);

          const morfo = data.morfologia;
          if (morfo.hojas && Object.keys(morfo.hojas).length > 0) {
            await this.morfologiaService.createOrUpdateHojas(morfologiaCreated.id, morfo.hojas);
          }
          if (morfo.tallo && Object.keys(morfo.tallo).length > 0) {
            await this.morfologiaService.createOrUpdateTallo(morfologiaCreated.id, morfo.tallo);
          }
          if (morfo.raiz && Object.keys(morfo.raiz).length > 0) {
            await this.morfologiaService.createOrUpdateRaiz(morfologiaCreated.id, morfo.raiz);
          }
          if (morfo.flor && Object.keys(morfo.flor).length > 0) {
            await this.morfologiaService.createOrUpdateFlor(morfologiaCreated.id, morfo.flor);
          }
          if (morfo.inflorescencia && Object.keys(morfo.inflorescencia).length > 0) {
            await this.morfologiaService.createOrUpdateInflorescencia(morfologiaCreated.id, morfo.inflorescencia);
          }
          if (morfo.fruto && Object.keys(morfo.fruto).length > 0) {
            await this.morfologiaService.createOrUpdateFruto(morfologiaCreated.id, morfo.fruto);
          }
        }

        // 6. Gestionar Colector y RegistroIngreso
        let personaColectorId = adminPersonaId; // Fallback al admin
        if (data.colector && data.colector.nombreCompleto) {
          const nombreColec = data.colector.nombreCompleto.trim();
          if (colectoresCreados.has(nombreColec)) {
            personaColectorId = colectoresCreados.get(nombreColec)!;
          } else {
            // Check Si existe en la BD realmente
            let personaModel = await this.personaRepository.findOne({
              where: { nombre: nombreColec, esColector: true }
            });
            
            if (!personaModel) {
              // Crear colector (Persona sin cuenta)
              personaModel = this.personaRepository.create({
                nombre: nombreColec,
                apellido: '.', // Requisito no nulo al crear en BD temporal o si viene con 1 solo campo
                esColector: true
              });
              personaModel = await this.personaRepository.save(personaModel);
              colectoresCount++;
            }
            personaColectorId = personaModel.id;
            colectoresCreados.set(nombreColec, personaColectorId);
          }
        }

        // 7. Registro Ingreso
        if (data.registroIngreso) {
          let fecha = new Date().toISOString().split('T')[0];
          if (data.registroIngreso.fechaIngreso && data.registroIngreso.fechaIngreso.length > 5) {
             // '2022-02-24 00:00:00' -> '2022-02-24'
             fecha = data.registroIngreso.fechaIngreso.split(' ')[0];
          }

          await this.registroIngresoService.create({
            cantidad: data.registroIngreso.cantidad || 1,
            fechaIngreso: fecha,
            plantaId: plantaCreated.id,
            personaId: personaColectorId,
          });
        }

        insertCount++;

        if (insertCount % 100 === 0) {
          this.logger.log(`Progreso: ${insertCount}/${seedData.length} plantas insertadas`);
        }
      } catch (error: any) {
        errores++;
        this.logger.error(`Error en planta ${i + 1} (${data.nombreCientifico}): ${error.message}`);
      }
    }

    this.logger.log(`Seed JBRE completado: ${insertCount} plantas insertadas, ${errores} errores`);
    this.logger.log(`Secciones creadas: ${seccionesCreadas.size}. Colectores encontrados/creados: ${colectoresCount}`);

    return { insertCount, errores, colectoresCount };
  }
}

