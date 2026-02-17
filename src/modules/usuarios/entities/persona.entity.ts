import {
  Entity,
  Column,
  ManyToOne,
  OneToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Rol } from './rol.entity';
import { Cuenta } from './cuenta.entity';
import { RegistroIngreso } from '../../registro-ingreso/entities/registro-ingreso.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity('personas')
export class Persona extends BaseEntity {
  @ApiProperty({ example: 'Juan' })
  @Column()
  nombre!: string;

  @ApiProperty({ example: 'Pérez' })
  @Column()
  apellido!: string;

  @ApiProperty({ example: 'M', enum: ['M', 'F', 'O'] })
  @Column({ nullable: true })
  genero?: string;

  @ApiProperty({ example: '1990-01-15' })
  @Column({ type: 'date', nullable: true })
  fechaNacimiento?: Date;

  @ApiProperty({ example: false })
  @Column({ default: false })
  esAutor!: boolean;

  @ApiProperty({ example: false })
  @Column({ default: false })
  esColector!: boolean;

  @Column({ nullable: true })
  rolId?: string;

  @ManyToOne(() => Rol, (rol) => rol.personas)
  @JoinColumn({ name: 'rolId' })
  rol?: Rol;

  @OneToOne(() => Cuenta, (cuenta) => cuenta.persona)
  cuenta?: Cuenta;

  @OneToMany(() => RegistroIngreso, (registro) => registro.persona)
  registrosIngreso!: RegistroIngreso[];
}
