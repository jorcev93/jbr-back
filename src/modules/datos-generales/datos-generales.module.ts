import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatosGeneralesService } from './datos-generales.service';
import { DatosGeneralesController } from './datos-generales.controller';
import { DatosGenerales } from './entities/datos-generales.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DatosGenerales])],
  controllers: [DatosGeneralesController],
  providers: [DatosGeneralesService],
  exports: [DatosGeneralesService],
})
export class DatosGeneralesModule {}
