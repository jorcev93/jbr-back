import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Persona } from './persona.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity('roles')
export class Rol extends BaseEntity {
  @ApiProperty({ example: 'Administrador' })
  @Column()
  nombre!: string;

  @OneToMany(() => Persona, (persona) => persona.rol)
  personas!: Persona[];
}
