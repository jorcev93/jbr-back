import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_GUARD } from '@nestjs/core';

// Modules
import { AuthModule } from './modules/auth/auth.module';
import { UsuariosModule } from './modules/usuarios/usuarios.module';
import { SeccionesModule } from './modules/secciones/secciones.module';
import { PlantasModule } from './modules/plantas/plantas.module';
import { RegistroIngresoModule } from './modules/registro-ingreso/registro-ingreso.module';
import { DatosGeneralesModule } from './modules/datos-generales/datos-generales.module';
import { TaxonomiaModule } from './modules/taxonomia/taxonomia.module';
import { CondicionCultivoModule } from './modules/condicion-cultivo/condicion-cultivo.module';
import { MorfologiaModule } from './modules/morfologia/morfologia.module';
import { FotosModule } from './modules/fotos/fotos.module';
import { SeedModule } from './modules/seed/seed.module';
import { StorageModule } from './common/storage';

// Guards
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST', 'localhost'),
        port: configService.get<number>('DB_PORT', 5432),
        username: configService.get('DB_USERNAME', 'postgres'),
        password: configService.get('DB_PASSWORD', 'postgres'),
        database: configService.get('DB_NAME', 'jardin_botanico'),
        autoLoadEntities: true,
        synchronize: configService.get('NODE_ENV') !== 'production',
      }),
    }),
    AuthModule,
    UsuariosModule,
    SeccionesModule,
    PlantasModule,
    RegistroIngresoModule,
    DatosGeneralesModule,
    TaxonomiaModule,
    CondicionCultivoModule,
    MorfologiaModule,
    FotosModule,
    SeedModule,
    StorageModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
