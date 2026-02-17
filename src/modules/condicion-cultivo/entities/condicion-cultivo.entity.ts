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

@Entity('condiciones_cultivo')
export class CondicionCultivo {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  plantaId!: string;

  @ApiProperty({ example: 'Sombra parcial' })
  @Column({ nullable: true })
  exposicion?: string;

  @ApiProperty({ example: 'Primavera-Verano' })
  @Column({ nullable: true })
  floracion?: string;

  @ApiProperty({ example: 'Media-Alta' })
  @Column({ nullable: true })
  humedad?: string;

  @ApiProperty({ example: 'Moderado, cada 3 días' })
  @Column({ nullable: true })
  riego?: string;

  @ApiProperty({ example: 'Poda anual, abonado en primavera' })
  @Column({ type: 'text', nullable: true })
  laboresCulturales?: string;

  @ApiProperty({ example: 'Sensible a heladas' })
  @Column({ type: 'text', nullable: true })
  observaciones?: string;

  @OneToOne(() => Planta, (planta) => planta.condicionCultivo)
  @JoinColumn({ name: 'plantaId' })
  planta!: Planta;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
