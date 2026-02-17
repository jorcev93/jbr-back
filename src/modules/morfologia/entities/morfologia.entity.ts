import {
  Entity,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
  Column,
} from 'typeorm';
import { Planta } from '../../plantas/entities/planta.entity';
import { Hojas } from './hojas.entity';
import { Tallo } from './tallo.entity';
import { Raiz } from './raiz.entity';
import { Flor } from './flor.entity';
import { Inflorescencia } from './inflorescencia.entity';
import { Fruto } from './fruto.entity';

@Entity('morfologias')
export class Morfologia {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  plantaId!: string;

  @OneToOne(() => Planta, (planta) => planta.morfologia)
  @JoinColumn({ name: 'plantaId' })
  planta!: Planta;

  @OneToOne(() => Hojas, (hojas) => hojas.morfologia)
  hojas?: Hojas;

  @OneToOne(() => Tallo, (tallo) => tallo.morfologia)
  tallo?: Tallo;

  @OneToOne(() => Raiz, (raiz) => raiz.morfologia)
  raiz?: Raiz;

  @OneToOne(() => Flor, (flor) => flor.morfologia)
  flor?: Flor;

  @OneToOne(() => Inflorescencia, (inflorescencia) => inflorescencia.morfologia)
  inflorescencia?: Inflorescencia;

  @OneToOne(() => Fruto, (fruto) => fruto.morfologia)
  fruto?: Fruto;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
