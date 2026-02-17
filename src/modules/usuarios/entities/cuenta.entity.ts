import { Entity, Column, OneToOne, JoinColumn, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Persona } from './persona.entity';
import { RefreshToken } from '../../auth/entities/refresh-token.entity';
import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';

@Entity('cuentas')
export class Cuenta extends BaseEntity {
  @ApiProperty({ example: 'usuario@email.com' })
  @Column({ unique: true })
  email!: string;

  @Exclude()
  @Column()
  contrasena!: string;

  @Column()
  personaId!: string;

  @OneToOne(() => Persona, (persona) => persona.cuenta)
  @JoinColumn({ name: 'personaId' })
  persona!: Persona;

  @OneToMany(() => RefreshToken, (token) => token.cuenta)
  refreshTokens!: RefreshToken[];
}
