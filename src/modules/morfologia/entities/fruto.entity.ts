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

@Entity('frutos')
export class Fruto {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  morfologiaId!: string;

  @ApiProperty({ example: 'Baya' })
  @Column({ nullable: true })
  carnoso?: string;

  @ApiProperty({ example: null })
  @Column({ nullable: true })
  secoDehiscente?: string;

  @ApiProperty({ example: null })
  @Column({ nullable: true })
  secoIndehiscente?: string;

  @ApiProperty({ example: null })
  @Column({ nullable: true })
  compuesto?: string;

  @OneToOne(() => Morfologia, (morfologia) => morfologia.fruto)
  @JoinColumn({ name: 'morfologiaId' })
  morfologia!: Morfologia;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
