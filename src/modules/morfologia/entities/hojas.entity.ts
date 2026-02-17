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

@Entity('hojas')
export class Hojas {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  morfologiaId!: string;

  @ApiProperty({ example: 'Ovalada' })
  @Column({ nullable: true })
  forma?: string;

  @ApiProperty({ example: 'Cordada' })
  @Column({ nullable: true })
  base?: string;

  @ApiProperty({ example: 'Agudo' })
  @Column({ nullable: true })
  apice?: string;

  @ApiProperty({ example: 'Aserrado' })
  @Column({ nullable: true })
  borde?: string;

  @ApiProperty({ example: 'Pinnada' })
  @Column({ nullable: true })
  nervadura?: string;

  @ApiProperty({ example: 'Alterna' })
  @Column({ nullable: true })
  filotaxis?: string;

  @ApiProperty({ example: 'Simple' })
  @Column({ nullable: true })
  complejidad?: string;

  @ApiProperty({ example: 'Presente' })
  @Column({ nullable: true })
  peciolo?: string;

  @ApiProperty({ example: 'Presentes' })
  @Column({ nullable: true })
  estipulas?: string;

  @ApiProperty({ example: 'Tricomas' })
  @Column({ nullable: true })
  emergencia?: string;

  @ApiProperty({ example: 'Verde oscuro en haz, claro en envés' })
  @Column({ nullable: true })
  colores?: string;

  @OneToOne(() => Morfologia, (morfologia) => morfologia.hojas)
  @JoinColumn({ name: 'morfologiaId' })
  morfologia!: Morfologia;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
