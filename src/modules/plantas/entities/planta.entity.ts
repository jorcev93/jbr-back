import {
  Entity,
  Column,
  ManyToOne,
  OneToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Seccion } from '../../secciones/entities/seccion.entity';
import { RegistroIngreso } from '../../registro-ingreso/entities/registro-ingreso.entity';
import { DatosGenerales } from '../../datos-generales/entities/datos-generales.entity';
import { Taxonomia } from '../../taxonomia/entities/taxonomia.entity';
import { CondicionCultivo } from '../../condicion-cultivo/entities/condicion-cultivo.entity';
import { Morfologia } from '../../morfologia/entities/morfologia.entity';
import { Foto } from '../../fotos/entities/foto.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity('plantas')
export class Planta extends BaseEntity {
  @ApiProperty({ example: 'Rosa gallica' })
  @Column()
  nombreCientifico!: string;

  @ApiProperty({ example: 'Rosa silvestre' })
  @Column({ nullable: true })
  nombreComun?: string;

  @ApiProperty({ example: 'Rosa rubra, Rosa officinalis' })
  @Column({ nullable: true })
  sinonimos?: string;

  @ApiProperty({ example: 'Planta ornamental con flores de diversos colores' })
  @Column({ type: 'text', nullable: true })
  descripcion?: string;

  @ApiProperty({ example: 'Ornamental, medicinal, perfumería' })
  @Column({ type: 'text', nullable: true })
  usos?: string;

  @Column({ nullable: true })
  seccionId?: string;

  @ManyToOne(() => Seccion, (seccion) => seccion.plantas)
  @JoinColumn({ name: 'seccionId' })
  seccion?: Seccion;

  @OneToMany(() => RegistroIngreso, (registro) => registro.planta)
  registrosIngreso!: RegistroIngreso[];

  @OneToOne(() => DatosGenerales, (datos) => datos.planta)
  datosGenerales?: DatosGenerales;

  @OneToOne(() => Taxonomia, (taxonomia) => taxonomia.planta)
  taxonomia?: Taxonomia;

  @OneToOne(() => CondicionCultivo, (condicion) => condicion.planta)
  condicionCultivo?: CondicionCultivo;

  @OneToOne(() => Morfologia, (morfologia) => morfologia.planta)
  morfologia?: Morfologia;

  @OneToMany(() => Foto, (foto) => foto.planta)
  fotos!: Foto[];
}
