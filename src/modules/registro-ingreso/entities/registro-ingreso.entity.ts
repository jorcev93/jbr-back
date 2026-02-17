import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Persona } from '../../usuarios/entities/persona.entity';
import { Planta } from '../../plantas/entities/planta.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity('registros_ingreso')
export class RegistroIngreso {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ nullable: true })
  personaId?: string;

  @Column()
  plantaId!: string;

  @ApiProperty({ example: 5 })
  @Column({ default: 1 })
  cantidad!: number;

  @ApiProperty({ example: '2024-01-15' })
  @Column({ type: 'date' })
  fechaIngreso!: Date;

  @ApiProperty({ example: 'Plantas recibidas en buen estado' })
  @Column({ type: 'text', nullable: true })
  observaciones?: string;

  @ManyToOne(() => Persona, (persona) => persona.registrosIngreso)
  @JoinColumn({ name: 'personaId' })
  persona?: Persona;

  @ManyToOne(() => Planta, (planta) => planta.registrosIngreso)
  @JoinColumn({ name: 'plantaId' })
  planta!: Planta;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
