import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeccionesService } from './secciones.service';
import { SeccionesController } from './secciones.controller';
import { Seccion } from './entities/seccion.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Seccion])],
  controllers: [SeccionesController],
  providers: [SeccionesService],
  exports: [SeccionesService],
})
export class SeccionesModule {}
