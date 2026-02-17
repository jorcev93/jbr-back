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

@Entity('flores')
export class Flor {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  morfologiaId!: string;

  @ApiProperty({ example: 'Hermafrodita' })
  @Column({ nullable: true })
  tipo?: string;

  @ApiProperty({ example: 'Actinomorfa' })
  @Column({ nullable: true })
  simetria?: string;

  @ApiProperty({ example: 'Heteroclamídeo' })
  @Column({ nullable: true })
  perianto?: string;

  @ApiProperty({ example: 'Dialisépalo' })
  @Column({ nullable: true })
  caliz?: string;

  @ApiProperty({ example: 'Dialipétala' })
  @Column({ nullable: true })
  corola?: string;

  @ApiProperty({ example: 'Numerosos' })
  @Column({ nullable: true })
  estambre?: string;

  @ApiProperty({ example: 'Basifija' })
  @Column({ nullable: true })
  antera?: string;

  @ApiProperty({ example: 'Súpero' })
  @Column({ nullable: true })
  ovario?: string;

  @ApiProperty({ example: 'Imbricada' })
  @Column({ nullable: true })
  prefloracion?: string;

  @OneToOne(() => Morfologia, (morfologia) => morfologia.flor)
  @JoinColumn({ name: 'morfologiaId' })
  morfologia!: Morfologia;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
