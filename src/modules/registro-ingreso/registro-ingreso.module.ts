import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RegistroIngresoService } from './registro-ingreso.service';
import { RegistroIngresoController } from './registro-ingreso.controller';
import { RegistroIngreso } from './entities/registro-ingreso.entity';

@Module({
  imports: [TypeOrmModule.forFeature([RegistroIngreso])],
  controllers: [RegistroIngresoController],
  providers: [RegistroIngresoService],
  exports: [RegistroIngresoService],
})
export class RegistroIngresoModule {}
