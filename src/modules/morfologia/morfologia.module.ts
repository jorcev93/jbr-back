import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MorfologiaService } from './morfologia.service';
import { MorfologiaController } from './morfologia.controller';
import {
  Morfologia,
  Hojas,
  Tallo,
  Raiz,
  Flor,
  Inflorescencia,
  Fruto,
} from './entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Morfologia,
      Hojas,
      Tallo,
      Raiz,
      Flor,
      Inflorescencia,
      Fruto,
    ]),
  ],
  controllers: [MorfologiaController],
  providers: [MorfologiaService],
  exports: [MorfologiaService],
})
export class MorfologiaModule {}
