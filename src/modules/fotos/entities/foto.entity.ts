import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Planta } from '../../plantas/entities/planta.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity('fotos')
export class Foto {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  plantaId!: string;

  @ApiProperty({ example: 'rosa-gallica-flor.jpg' })
  @Column()
  nombre!: string;

  @ApiProperty({ example: '/uploads/plantas/rosa-gallica-flor.jpg' })
  @Column()
  ruta!: string;

  @ApiProperty({ example: 'Flor en plena floración' })
  @Column({ nullable: true })
  descripcion?: string;

  @ApiProperty({
    example: 'flor',
    enum: ['flor', 'hoja', 'fruto', 'tallo', 'raiz', 'general'],
  })
  @Column({ nullable: true })
  tipo?: string;

  @ManyToOne(() => Planta, (planta) => planta.fotos, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'plantaId' })
  planta!: Planta;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
