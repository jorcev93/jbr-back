import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

/**
 * Entidad para almacenar embeddings de plantas
 * Usa pgvector para búsquedas de similitud semántica
 */
@Entity('plant_embeddings')
@Index('idx_plant_embeddings_planta_id', ['plantaId'])
export class PlantEmbedding {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * ID de la planta asociada
   */
  @Column({ type: 'uuid', unique: true })
  plantaId: string;

  /**
   * Nombre científico para referencia rápida
   */
  @Column({ nullable: true })
  nombreCientifico: string;

  /**
   * Contenido textual que se convirtió en embedding
   * Incluye toda la información concatenada de la planta
   */
  @Column({ type: 'text' })
  content: string;

  /**
   * Vector de embeddings (768 dimensiones para nomic-embed-text)
   * Se almacena usando el tipo vector de pgvector
   */
  @Column({ type: 'vector', length: 768, nullable: true })
  embedding: string; // TypeORM requiere string para columnas vector, de lo contrario da error de compatibilidad de arrays

  /**
   * Hash del contenido para detectar cambios
   */
  @Column({ nullable: true })
  contentHash: string;

  /**
   * Versión del modelo de embeddings usado
   */
  @Column({ default: 'nomic-embed-text' })
  modelVersion: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
