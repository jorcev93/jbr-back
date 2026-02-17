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

@Entity('datos_generales')
export class DatosGenerales {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  plantaId!: string;

  @ApiProperty({ example: 'Endémica' })
  @Column({ nullable: true })
  endemismo?: string;

  @ApiProperty({ example: 'Vulnerable' })
  @Column({ nullable: true })
  estadoConservacion?: string;

  @ApiProperty({ example: 'Herbario Nacional' })
  @Column({ nullable: true })
  fuenteInformacion?: string;

  @ApiProperty({ example: 'Arbustivo' })
  @Column({ nullable: true })
  habitoCrecimiento?: string;

  @ApiProperty({ example: 'Donación del Jardín Botánico de Bogotá' })
  @Column({ nullable: true })
  historialRecibido?: string;

  @ApiProperty({ example: 'Semillas' })
  @Column({ nullable: true })
  materialRecibido?: string;

  @ApiProperty({ example: 10 })
  @Column({ nullable: true })
  numeroIndividuos?: number;

  @ApiProperty({ example: 'Colombia, Cundinamarca' })
  @Column({ nullable: true })
  procedencia?: string;

  @ApiProperty({ example: 'Por sus hojas aserradas y flores amarillas' })
  @Column({ type: 'text', nullable: true })
  comoSeReconoce?: string;

  @ApiProperty({ example: 'Andes colombianos, 2500-3000 msnm' })
  @Column({ nullable: true })
  ubicacionGeografica?: string;

  @ApiProperty({ example: 'Bosque húmedo montano' })
  @Column({ nullable: true })
  zonaVida?: string;

  @OneToOne(() => Planta, (planta) => planta.datosGenerales)
  @JoinColumn({ name: 'plantaId' })
  planta!: Planta;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
