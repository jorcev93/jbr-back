import {
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
  UpdateEvent,
  RemoveEvent,
  DataSource,
} from 'typeorm';
import { Injectable, Logger } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';

// Entidades a monitorear
import { Planta } from '../../plantas/entities/planta.entity';
import { Taxonomia } from '../../taxonomia/entities/taxonomia.entity';
import { DatosGenerales } from '../../datos-generales/entities/datos-generales.entity';
import { CondicionCultivo } from '../../condicion-cultivo/entities/condicion-cultivo.entity';
import { Morfologia } from '../../morfologia/entities/morfologia.entity';
import { Hojas } from '../../morfologia/entities/hojas.entity';
import { Tallo } from '../../morfologia/entities/tallo.entity';
import { Raiz } from '../../morfologia/entities/raiz.entity';
import { Flor } from '../../morfologia/entities/flor.entity';
import { Inflorescencia } from '../../morfologia/entities/inflorescencia.entity';
import { Fruto } from '../../morfologia/entities/fruto.entity';
import { Seccion } from '../../secciones/entities/seccion.entity';
import { Foto } from '../../fotos/entities/foto.entity';
import { RegistroIngreso } from '../../registro-ingreso/entities/registro-ingreso.entity';

// Lista de entidades que disparan sincronización
const MONITORED_ENTITIES = [
  Planta,
  Taxonomia,
  DatosGenerales,
  CondicionCultivo,
  Morfologia,
  Hojas,
  Tallo,
  Raiz,
  Flor,
  Inflorescencia,
  Fruto,
  Seccion,
  Foto,
  RegistroIngreso,
];

/**
 * Subscriber que detecta cambios en entidades relacionadas con plantas
 * y agenda la sincronización de embeddings
 */
@Injectable()
@EventSubscriber()
export class PlantSyncSubscriber implements EntitySubscriberInterface {
  private readonly logger = new Logger(PlantSyncSubscriber.name);

  // Cola de plantas a sincronizar (evita duplicados)
  private syncQueue: Set<string> = new Set();
  private syncTimeout: NodeJS.Timeout | null = null;

  // Tiempo de espera antes de procesar la cola (debounce)
  private readonly SYNC_DELAY_MS = 2000;

  // Callback para sincronizar (inyectado desde RAGModule)
  private syncCallback: ((plantaId: string) => Promise<void>) | null = null;

  // Flag para pausar sincronización (útil durante seed masivo)
  private isPaused = false;

  constructor(@InjectDataSource() dataSource: DataSource) {
    dataSource.subscribers.push(this);
    this.logger.log('PlantSyncSubscriber registrado');
  }

  /**
   * Registra el callback de sincronización
   */
  setSyncCallback(callback: (plantaId: string) => Promise<void>): void {
    this.syncCallback = callback;
    this.logger.log('Callback de sincronización configurado');
  }

  /**
   * Pausa la sincronización automática (útil durante seed masivo)
   */
  pause(): void {
    this.isPaused = true;
    this.syncQueue.clear();
    if (this.syncTimeout) {
      clearTimeout(this.syncTimeout);
      this.syncTimeout = null;
    }
    this.logger.log('Sincronización automática pausada');
  }

  /**
   * Reanuda la sincronización automática
   */
  resume(): void {
    this.isPaused = false;
    this.logger.log('Sincronización automática reanudada');
  }

  /**
   * Verifica si la entidad debe ser monitoreada
   */
  private isMonitoredEntity(entity: unknown): boolean {
    if (!entity) return false;
    return MONITORED_ENTITIES.some(
      (EntityClass) => entity instanceof EntityClass,
    );
  }

  /**
   * Después de insertar una entidad
   */
  afterInsert(event: InsertEvent<unknown>): void {
    if (this.isMonitoredEntity(event.entity)) {
      this.handleEntityChange(event.entity, 'insert');
    }
  }

  /**
   * Después de actualizar una entidad
   */
  afterUpdate(event: UpdateEvent<unknown>): void {
    if (this.isMonitoredEntity(event.entity)) {
      this.handleEntityChange(event.entity, 'update');
    }
  }

  /**
   * Después de eliminar una entidad
   */
  afterRemove(event: RemoveEvent<unknown>): void {
    if (this.isMonitoredEntity(event.entity)) {
      this.handleEntityChange(event.entity, 'remove');
    }
  }

  /**
   * Procesa el cambio de una entidad y agenda sincronización
   */
  private handleEntityChange(
    entity: unknown,
    operation: 'insert' | 'update' | 'remove',
  ): void {
    // No procesar si está pausado
    if (this.isPaused) return;

    const plantaId = this.extractPlantaId(entity);

    if (plantaId) {
      this.logger.debug(
        `Cambio detectado (${operation}): planta ${plantaId}`,
      );
      this.queueSync(plantaId);
    }
  }

  /**
   * Extrae el ID de planta de una entidad
   */
  private extractPlantaId(entity: unknown): string | null {
    if (!entity || typeof entity !== 'object') return null;

    // Es una Planta directamente
    if (entity instanceof Planta) {
      return entity.id;
    }

    // Taxonomia, DatosGenerales, CondicionCultivo, Morfologia tienen plantaId
    if (
      entity instanceof Taxonomia ||
      entity instanceof DatosGenerales ||
      entity instanceof CondicionCultivo ||
      entity instanceof Morfologia
    ) {
      return (entity as { plantaId?: string }).plantaId || null;
    }

    // Foto y RegistroIngreso tienen plantaId
    if (entity instanceof Foto || entity instanceof RegistroIngreso) {
      return (entity as { plantaId?: string }).plantaId || null;
    }

    // Hojas, Tallo, Raiz, Flor, Inflorescencia, Fruto tienen morfologiaId
    // Necesitaríamos buscar la planta a través de morfología
    // Por simplicidad, no sincronizamos automáticamente estos (se sincronizan con morfología)
    if (
      entity instanceof Hojas ||
      entity instanceof Tallo ||
      entity instanceof Raiz ||
      entity instanceof Flor ||
      entity instanceof Inflorescencia ||
      entity instanceof Fruto
    ) {
      // Estos se sincronizan cuando se actualiza la morfología padre
      return null;
    }

    // Seccion: necesitaríamos actualizar todas las plantas de esa sección
    // Por ahora no lo hacemos automáticamente
    if (entity instanceof Seccion) {
      return null;
    }

    return null;
  }

  /**
   * Agrega una planta a la cola de sincronización
   */
  private queueSync(plantaId: string): void {
    this.syncQueue.add(plantaId);

    // Cancelar timeout anterior si existe
    if (this.syncTimeout) {
      clearTimeout(this.syncTimeout);
    }

    // Programar procesamiento de la cola
    this.syncTimeout = setTimeout(() => {
      this.processQueue();
    }, this.SYNC_DELAY_MS);
  }

  /**
   * Procesa la cola de sincronización
   */
  private async processQueue(): Promise<void> {
    if (this.syncQueue.size === 0) return;

    const plantaIds = Array.from(this.syncQueue);
    this.syncQueue.clear();

    this.logger.log(`Sincronizando ${plantaIds.length} planta(s)...`);

    for (const plantaId of plantaIds) {
      try {
        if (this.syncCallback) {
          await this.syncCallback(plantaId);
        }
      } catch (error) {
        this.logger.error(`Error sincronizando planta ${plantaId}:`, error);
      }
    }
  }
}
