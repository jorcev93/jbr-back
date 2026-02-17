import {
  Entity,
  Column,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Planta } from '../../plantas/entities/planta.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity('taxonomias')
export class Taxonomia {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  plantaId!: string;

  @ApiProperty({ example: 'Plantae' })
  @Column({ nullable: true })
  reino?: string;

  @ApiProperty({ example: 'Tracheophyta' })
  @Column({ nullable: true })
  phylum?: string;

  @ApiProperty({ example: 'Magnoliophyta' })
  @Column({ nullable: true })
  division?: string;

  @ApiProperty({ example: 'Magnoliopsida' })
  @Column({ nullable: true })
  clase?: string;

  @ApiProperty({ example: 'Rosidae' })
  @Column({ nullable: true })
  subclase?: string;

  @ApiProperty({ example: 'Rosales' })
  @Column({ nullable: true })
  orden?: string;

  @ApiProperty({ example: 'Rosaceae' })
  @Column({ nullable: true })
  familia?: string;

  @ApiProperty({ example: 'Rosoideae' })
  @Column({ nullable: true })
  subfamilia?: string;

  @ApiProperty({ example: 'Roseae' })
  @Column({ nullable: true })
  tribu?: string;

  @ApiProperty({ example: null })
  @Column({ nullable: true })
  subtribu?: string;

  @ApiProperty({ example: 'Rosa' })
  @Column({ nullable: true })
  genero?: string;

  @ApiProperty({ example: 'gallica' })
  @Column({ nullable: true })
  especie?: string;

  @ApiProperty({ example: null })
  @Column({ nullable: true })
  subespecie?: string;

  @ApiProperty({ example: null })
  @Column({ nullable: true })
  variedad?: string;

  @ApiProperty({ example: null })
  @Column({ nullable: true })
  cultivar?: string;

  @ApiProperty({ example: 'L.' })
  @Column({ nullable: true })
  autor?: string;

  @OneToOne(() => Planta, (planta) => planta.taxonomia)
  @JoinColumn({ name: 'plantaId' })
  planta!: Planta;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
