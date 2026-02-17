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

@Entity('tallos')
export class Tallo {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  morfologiaId!: string;

  @ApiProperty({ example: 'Herbáceo' })
  @Column({ nullable: true })
  tipo?: string;

  @ApiProperty({ example: 'Dicotómica' })
  @Column({ nullable: true })
  ramificacion?: string;

  @OneToOne(() => Morfologia, (morfologia) => morfologia.tallo)
  @JoinColumn({ name: 'morfologiaId' })
  morfologia!: Morfologia;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
