import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CondicionCultivoService } from './condicion-cultivo.service';
import { CondicionCultivoController } from './condicion-cultivo.controller';
import { CondicionCultivo } from './entities/condicion-cultivo.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CondicionCultivo])],
  controllers: [CondicionCultivoController],
  providers: [CondicionCultivoService],
  exports: [CondicionCultivoService],
})
export class CondicionCultivoModule {}
