import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Rol } from '../usuarios/entities/rol.entity';
import { Persona } from '../usuarios/entities/persona.entity';
import { Cuenta } from '../usuarios/entities/cuenta.entity';
import { SeedService } from './seed.service';
import { SeedController } from './seed.controller';
import { PlantasModule } from '../plantas/plantas.module';
import { SeccionesModule } from '../secciones/secciones.module';
import { TaxonomiaModule } from '../taxonomia/taxonomia.module';
import { DatosGeneralesModule } from '../datos-generales/datos-generales.module';
import { CondicionCultivoModule } from '../condicion-cultivo/condicion-cultivo.module';
import { MorfologiaModule } from '../morfologia/morfologia.module';
import { RegistroIngresoModule } from '../registro-ingreso/registro-ingreso.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Rol, Persona, Cuenta]), 
    PlantasModule,
    SeccionesModule,
    TaxonomiaModule,
    DatosGeneralesModule,
    CondicionCultivoModule,
    MorfologiaModule,
    RegistroIngresoModule
  ],
  controllers: [SeedController],
  providers: [SeedService],
})
export class SeedModule {}
