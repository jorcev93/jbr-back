import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';
import { Cuenta } from '../../usuarios/entities/cuenta.entity';

@Entity('refresh_tokens')
export class RefreshToken {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  token!: string;

  @Column()
  cuentaId!: string;

  @ManyToOne(() => Cuenta, (cuenta) => cuenta.refreshTokens, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'cuentaId' })
  cuenta!: Cuenta;

  @Column()
  expiresAt!: Date;

  @Column({ default: false })
  revoked!: boolean;

  @CreateDateColumn()
  createdAt!: Date;
}
