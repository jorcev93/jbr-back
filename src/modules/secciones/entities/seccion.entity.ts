import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Planta } from '../../plantas/entities/planta.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity('secciones')
export class Seccion extends BaseEntity {
  @ApiProperty({ example: 'Plantas Medicinales' })
  @Column()
  nombre!: string;

  @ApiProperty({
    example: 'Sección dedicada a plantas con propiedades medicinales',
  })
  @Column({ type: 'text', nullable: true })
  descripcion?: string;

  @OneToMany(() => Planta, (planta) => planta.seccion)
  plantas!: Planta[];
}
