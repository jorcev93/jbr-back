import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { UsuariosService } from './usuarios.service';
import { CreateRolDto, CreatePersonaDto, UpdatePersonaDto } from './dto';
import { UuidValidationPipe } from '../../common/pipes/uuid-validation.pipe';

@ApiTags('Usuarios')
@ApiBearerAuth()
@Controller()
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  // Roles
  @Post('roles')
  @ApiOperation({ summary: 'Crear rol' })
  @ApiResponse({ status: 201, description: 'Rol creado' })
  createRol(@Body() createRolDto: CreateRolDto) {
    return this.usuariosService.createRol(createRolDto);
  }

  @Get('roles')
  @ApiOperation({ summary: 'Listar roles' })
  findAllRoles() {
    return this.usuariosService.findAllRoles();
  }

  @Get('roles/:id')
  @ApiOperation({ summary: 'Obtener rol por ID' })
  findRolById(@Param('id', UuidValidationPipe) id: string) {
    return this.usuariosService.findRolById(id);
  }

  // Personas
  @Post('personas')
  @ApiOperation({ summary: 'Crear persona' })
  @ApiResponse({ status: 201, description: 'Persona creada' })
  createPersona(@Body() createPersonaDto: CreatePersonaDto) {
    return this.usuariosService.createPersona(createPersonaDto);
  }

  @Get('personas')
  @ApiOperation({ summary: 'Listar personas' })
  findAllPersonas() {
    return this.usuariosService.findAllPersonas();
  }

  @Get('personas/autores')
  @ApiOperation({ summary: 'Listar autores' })
  findAutores() {
    return this.usuariosService.findAutores();
  }

  @Get('personas/colectores')
  @ApiOperation({ summary: 'Listar colectores' })
  findColectores() {
    return this.usuariosService.findColectores();
  }

  @Get('personas/:id')
  @ApiOperation({ summary: 'Obtener persona por ID' })
  findPersonaById(@Param('id', UuidValidationPipe) id: string) {
    return this.usuariosService.findPersonaById(id);
  }

  @Patch('personas/:id')
  @ApiOperation({ summary: 'Actualizar persona' })
  updatePersona(
    @Param('id', UuidValidationPipe) id: string,
    @Body() updatePersonaDto: UpdatePersonaDto,
  ) {
    return this.usuariosService.updatePersona(id, updatePersonaDto);
  }

  @Delete('personas/:id')
  @ApiOperation({ summary: 'Eliminar persona (soft delete)' })
  removePersona(@Param('id', UuidValidationPipe) id: string) {
    return this.usuariosService.removePersona(id);
  }
}
