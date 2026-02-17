import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TaxonomiaService } from './taxonomia.service';
import { TaxonomiaController } from './taxonomia.controller';
import { Taxonomia } from './entities/taxonomia.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Taxonomia])],
  controllers: [TaxonomiaController],
  providers: [TaxonomiaService],
  exports: [TaxonomiaService],
})
export class TaxonomiaModule {}
