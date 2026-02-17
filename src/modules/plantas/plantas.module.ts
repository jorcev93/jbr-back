import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlantasService } from './plantas.service';
import { PlantasController } from './plantas.controller';
import { Planta } from './entities/planta.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Planta])],
  controllers: [PlantasController],
  providers: [PlantasService],
  exports: [PlantasService, TypeOrmModule],
})
export class PlantasModule {}
