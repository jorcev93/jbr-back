# Plan de Implementacion - Jardin Botanico Backend

## Resumen de Tecnologias

| Tecnologia | Uso |
|------------|-----|
| NestJS | Framework backend |
| PostgreSQL | Base de datos |
| TypeORM | ORM |
| JWT | Autenticacion (access + refresh tokens) |
| UUID | Identificadores de tablas |
| Swagger | Documentacion API |
| class-validator | Validacion de DTOs |
| Multer | Subida de imagenes |

---

## Arquitectura del Proyecto

```
src/
├── common/                          # Recursos compartidos
│   ├── decorators/                  # Decoradores personalizados
│   │   └── get-user.decorator.ts
│   ├── filters/                     # Filtros de excepciones
│   │   └── http-exception.filter.ts
│   ├── guards/                      # Guards globales
│   │   └── jwt-auth.guard.ts
│   ├── interceptors/                # Interceptores
│   │   └── transform.interceptor.ts
│   └── pipes/                       # Pipes personalizados
│       └── uuid-validation.pipe.ts
│
├── config/                          # Configuraciones
│   ├── app.config.ts
│   ├── database.config.ts
│   └── jwt.config.ts
│
├── modules/                         # Modulos de la aplicacion
│   │
│   ├── auth/                        # Autenticacion
│   │   ├── dto/
│   │   │   ├── login.dto.ts
│   │   │   ├── register.dto.ts
│   │   │   └── refresh-token.dto.ts
│   │   ├── entities/
│   │   │   └── refresh-token.entity.ts
│   │   ├── strategies/
│   │   │   └── jwt.strategy.ts
│   │   ├── auth.controller.ts
│   │   ├── auth.module.ts
│   │   └── auth.service.ts
│   │
│   ├── usuarios/                    # Gestion de usuarios
│   │   ├── dto/
│   │   ├── entities/
│   │   │   ├── rol.entity.ts
│   │   │   ├── persona.entity.ts
│   │   │   └── cuenta.entity.ts
│   │   ├── usuarios.controller.ts
│   │   ├── usuarios.module.ts
│   │   └── usuarios.service.ts
│   │
│   ├── secciones/                   # Secciones del jardin
│   │   ├── dto/
│   │   ├── entities/
│   │   │   └── seccion.entity.ts
│   │   ├── secciones.controller.ts
│   │   ├── secciones.module.ts
│   │   └── secciones.service.ts
│   │
│   ├── plantas/                     # Plantas (entidad central)
│   │   ├── dto/
│   │   ├── entities/
│   │   │   └── planta.entity.ts
│   │   ├── plantas.controller.ts
│   │   ├── plantas.module.ts
│   │   └── plantas.service.ts
│   │
│   ├── registro-ingreso/            # Registro de ingresos
│   │   ├── dto/
│   │   ├── entities/
│   │   │   └── registro-ingreso.entity.ts
│   │   ├── registro-ingreso.controller.ts
│   │   ├── registro-ingreso.module.ts
│   │   └── registro-ingreso.service.ts
│   │
│   ├── datos-generales/             # Datos generales de plantas
│   │   ├── dto/
│   │   ├── entities/
│   │   │   └── datos-generales.entity.ts
│   │   ├── datos-generales.controller.ts
│   │   ├── datos-generales.module.ts
│   │   └── datos-generales.service.ts
│   │
│   ├── taxonomia/                   # Taxonomia de plantas
│   │   ├── dto/
│   │   ├── entities/
│   │   │   └── taxonomia.entity.ts
│   │   ├── taxonomia.controller.ts
│   │   ├── taxonomia.module.ts
│   │   └── taxonomia.service.ts
│   │
│   ├── condicion-cultivo/           # Condiciones de cultivo
│   │   ├── dto/
│   │   ├── entities/
│   │   │   └── condicion-cultivo.entity.ts
│   │   ├── condicion-cultivo.controller.ts
│   │   ├── condicion-cultivo.module.ts
│   │   └── condicion-cultivo.service.ts
│   │
│   ├── morfologia/                  # Morfologia y caracteristicas
│   │   ├── dto/
│   │   ├── entities/
│   │   │   ├── morfologia.entity.ts
│   │   │   ├── hojas.entity.ts
│   │   │   ├── tallo.entity.ts
│   │   │   ├── raiz.entity.ts
│   │   │   ├── flor.entity.ts
│   │   │   ├── inflorescencia.entity.ts
│   │   │   └── fruto.entity.ts
│   │   ├── morfologia.controller.ts
│   │   ├── morfologia.module.ts
│   │   └── morfologia.service.ts
│   │
│   └── fotos/                       # Galeria de fotos
│       ├── dto/
│       ├── entities/
│       │   └── foto.entity.ts
│       ├── fotos.controller.ts
│       ├── fotos.module.ts
│       └── fotos.service.ts
│
├── uploads/                         # Directorio de imagenes (gitignore)
│
├── app.module.ts
└── main.ts
```

---

## Fases de Implementacion

### Fase 1: Configuracion Base
- [ ] Instalar dependencias adicionales (JWT, Swagger, class-validator, Multer, bcrypt)
- [ ] Configurar variables de entorno (.env)
- [ ] Crear estructura de carpetas
- [ ] Configurar Swagger en main.ts
- [ ] Configurar ValidationPipe global
- [ ] Crear filtro de excepciones global

### Fase 2: Modulo de Usuarios y Autenticacion
- [ ] Crear entidades: Rol, Persona, Cuenta
- [ ] Crear entidad RefreshToken
- [ ] Implementar modulo Auth (login, register, refresh, logout)
- [ ] Implementar JWT Strategy y Guards
- [ ] Crear DTOs con validaciones
- [ ] Implementar modulo Usuarios (CRUD)

### Fase 3: Modulo de Secciones
- [ ] Crear entidad Seccion
- [ ] Implementar CRUD completo
- [ ] Documentar con Swagger

### Fase 4: Modulo de Plantas (Entidad Central)
- [ ] Crear entidad Planta con relaciones
- [ ] Implementar CRUD completo
- [ ] Agregar filtros y busqueda

### Fase 5: Modulos Relacionados a Plantas
- [ ] RegistroIngreso (CRUD)
- [ ] DatosGenerales (CRUD)
- [ ] Taxonomia (CRUD)
- [ ] CondicionCultivo (CRUD)

### Fase 6: Modulo de Morfologia
- [ ] Crear entidad Morfologia (agregador)
- [ ] Crear entidades: Hojas, Tallo, Raiz, Flor, Inflorescencia, Fruto
- [ ] Implementar CRUD para cada caracteristica

### Fase 7: Modulo de Fotos
- [ ] Configurar Multer para subida de archivos
- [ ] Crear entidad Foto
- [ ] Implementar upload, listado, eliminacion
- [ ] Servir archivos estaticos

### Fase 8: Finalizacion
- [ ] Revisar relaciones y cascadas
- [ ] Agregar indices a la base de datos
- [ ] Pruebas de integracion
- [ ] Documentacion final de Swagger

---

## Dependencias a Instalar

```bash
# Autenticacion
yarn add @nestjs/jwt @nestjs/passport passport passport-jwt bcrypt
yarn add -D @types/passport-jwt @types/bcrypt

# Validacion
yarn add class-validator class-transformer

# Swagger
yarn add @nestjs/swagger

# Subida de archivos
yarn add @nestjs/platform-express multer
yarn add -D @types/multer

# UUID
yarn add uuid
yarn add -D @types/uuid
```

---

## Configuracion de Entidades con UUID

Todas las entidades seguiran este patron base:

```typescript
import {
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Column
} from 'typeorm';

export abstract class BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ default: true })
  estado: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

---

## Endpoints Principales

### Auth
| Metodo | Endpoint | Descripcion |
|--------|----------|-------------|
| POST | /auth/register | Registrar usuario |
| POST | /auth/login | Iniciar sesion |
| POST | /auth/refresh | Renovar tokens |
| POST | /auth/logout | Cerrar sesion |

### Usuarios
| Metodo | Endpoint | Descripcion |
|--------|----------|-------------|
| GET | /roles | Listar roles |
| POST | /roles | Crear rol |
| GET | /personas | Listar personas |
| POST | /personas | Crear persona |
| GET | /personas/:id | Obtener persona |
| PATCH | /personas/:id | Actualizar persona |
| DELETE | /personas/:id | Eliminar persona (soft delete) |

### Secciones
| Metodo | Endpoint | Descripcion |
|--------|----------|-------------|
| GET | /secciones | Listar secciones |
| POST | /secciones | Crear seccion |
| GET | /secciones/:id | Obtener seccion |
| PATCH | /secciones/:id | Actualizar seccion |
| DELETE | /secciones/:id | Eliminar seccion |

### Plantas
| Metodo | Endpoint | Descripcion |
|--------|----------|-------------|
| GET | /plantas | Listar plantas |
| POST | /plantas | Crear planta |
| GET | /plantas/:id | Obtener planta con relaciones |
| PATCH | /plantas/:id | Actualizar planta |
| DELETE | /plantas/:id | Eliminar planta |
| GET | /plantas/:id/completa | Obtener planta con toda su info |

### Morfologia (ejemplo de sub-recursos)
| Metodo | Endpoint | Descripcion |
|--------|----------|-------------|
| GET | /plantas/:plantaId/morfologia | Obtener morfologia |
| POST | /plantas/:plantaId/morfologia | Crear morfologia |
| PATCH | /morfologia/:id/hojas | Actualizar hojas |
| PATCH | /morfologia/:id/tallo | Actualizar tallo |
| ... | ... | ... |

### Fotos
| Metodo | Endpoint | Descripcion |
|--------|----------|-------------|
| GET | /plantas/:plantaId/fotos | Listar fotos de planta |
| POST | /plantas/:plantaId/fotos | Subir foto |
| DELETE | /fotos/:id | Eliminar foto |
| GET | /uploads/:filename | Obtener imagen |

---

## Modelo de Refresh Tokens

```typescript
@Entity('refresh_tokens')
export class RefreshToken {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  token: string;

  @Column()
  cuentaId: string;

  @ManyToOne(() => Cuenta)
  cuenta: Cuenta;

  @Column()
  expiresAt: Date;

  @Column({ default: false })
  revoked: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
```

Esto permite:
- Invalidar sesiones especificas
- Ver dispositivos conectados
- Forzar logout de todos los dispositivos

---

## Variables de Entorno Necesarias

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_NAME=jardin_botanico

# JWT
JWT_SECRET=your_super_secret_key
JWT_ACCESS_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d

# App
PORT=3000
NODE_ENV=development

# Uploads
UPLOAD_DEST=./uploads
MAX_FILE_SIZE=5242880
```

---

## Notas Importantes

1. **Soft Delete**: Todas las entidades usan campo `estado` para borrado logico
2. **Auditoría**: `createdAt` y `updatedAt` automaticos en todas las tablas
3. **UUID**: Todos los IDs son UUID v4
4. **Relaciones**: TypeORM manejara las FK automaticamente
5. **Validacion**: Todas las entradas se validan con class-validator
6. **Documentacion**: Swagger disponible en `/api/docs`
