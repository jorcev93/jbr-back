import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Global prefix
  app.setGlobalPrefix('api');

  // CORS
  app.enableCors();

  // Validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Exception filter
  app.useGlobalFilters(new HttpExceptionFilter());

  // Static files for uploads (solo en modo local)
  const storageType = process.env.STORAGE_TYPE || 'local';
  if (storageType === 'local') {
    app.useStaticAssets(join(process.cwd(), 'uploads'), {
      prefix: '/uploads/',
    });
  }

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('Jardín Botánico API')
    .setDescription('API para el sistema de gestión del Jardín Botánico')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('Auth', 'Autenticación y autorización')
    .addTag('Usuarios', 'Gestión de usuarios, roles y personas')
    .addTag('Secciones', 'Secciones del jardín')
    .addTag('Plantas', 'Gestión de plantas')
    .addTag('Registro de Ingreso', 'Registros de ingreso de plantas')
    .addTag('Datos Generales', 'Datos generales de las plantas')
    .addTag('Taxonomía', 'Clasificación taxonómica')
    .addTag('Condiciones de Cultivo', 'Condiciones de cultivo de las plantas')
    .addTag('Morfología', 'Características morfológicas')
    .addTag('Fotos', 'Galería de fotos de plantas')
    .addTag('Seed', 'Datos iniciales (rol y usuario administrador)')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(`🌱 Jardín Botánico API running on: http://localhost:${port}`);
  console.log(`📚 Swagger documentation: http://localhost:${port}/api/docs`);
}

bootstrap().catch((err: unknown) => {
  console.error('Failed to start application:', err);
  process.exit(1);
});
