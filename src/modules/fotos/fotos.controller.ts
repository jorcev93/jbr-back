import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { FotosService } from './fotos.service';
import { CreateFotoDto } from './dto';
import { UuidValidationPipe } from '../../common/pipes/uuid-validation.pipe';

@ApiTags('Fotos')
@ApiBearerAuth()
@Controller('fotos')
export class FotosController {
  constructor(private readonly fotosService: FotosService) {}

  @Post('planta/:plantaId')
  @ApiOperation({ summary: 'Subir foto para una planta' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        descripcion: {
          type: 'string',
        },
        tipo: {
          type: 'string',
          enum: ['flor', 'hoja', 'fruto', 'tallo', 'raiz', 'general'],
        },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, callback) => {
          const uniqueName = `${uuidv4()}${extname(file.originalname)}`;
          callback(null, uniqueName);
        },
      }),
    }),
  )
  create(
    @Param('plantaId', UuidValidationPipe) plantaId: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // 5MB
          new FileTypeValidator({ fileType: /(jpg|jpeg|png|gif|webp)$/ }),
        ],
      }),
    )
    file: Express.Multer.File,
    @Body() createFotoDto: CreateFotoDto,
  ) {
    return this.fotosService.create(plantaId, file, createFotoDto);
  }

  @Get('planta/:plantaId')
  @ApiOperation({ summary: 'Obtener fotos de una planta' })
  findByPlanta(@Param('plantaId', UuidValidationPipe) plantaId: string) {
    return this.fotosService.findByPlanta(plantaId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener foto por ID' })
  findOne(@Param('id', UuidValidationPipe) id: string) {
    return this.fotosService.findOne(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar foto' })
  remove(@Param('id', UuidValidationPipe) id: string) {
    return this.fotosService.remove(id);
  }

  @Delete('planta/:plantaId')
  @ApiOperation({ summary: 'Eliminar todas las fotos de una planta' })
  removeByPlanta(@Param('plantaId', UuidValidationPipe) plantaId: string) {
    return this.fotosService.removeByPlanta(plantaId);
  }
}
