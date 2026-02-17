import {
  Entity,
  Column,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Morfologia } from './morfologia.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity('raices')
export class Raiz {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  morfologiaId!: string;

  @ApiProperty({ example: 'Pivotante' })
  @Column({ nullable: true })
  tipo?: string;

  @OneToOne(() => Morfologia, (morfologia) => morfologia.raiz)
  @JoinColumn({ name: 'morfologiaId' })
  morfologia!: Morfologia;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
