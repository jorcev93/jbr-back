# Diagrama de Clases Corregido - Jardín Botánico

## Cambios realizados respecto al diagrama original

### Nomenclatura
- `historial` → `CondicionCultivo` (describe mejor el propósito)
- `PP` → `RegistroIngreso` (más descriptivo)
- `Inflorescensia` → `Inflorescencia` (corrección ortográfica)
- `Datos generales` → `DatosGenerales` (sin espacios)

### Tipos de datos corregidos
- `Planta.Descripcion`: int → text
- `Hojas.idhojas`: char → int
- `Morfologia.idraiz`: char → int
- `Morfologia.idtallo`: char → int
- `RegistroIngreso.fec_ing`: char → date

### Nuevas tablas
- `Seccion`: Para clasificar plantas por sección del jardín

### Cardinalidades ajustadas
- `Morfologia` → características: 1:1 → 1:0..1 (opcional)

---

```mermaid
erDiagram
    %% ==================== USUARIOS Y AUTENTICACIÓN ====================

    Rol {
        int id PK
        string nombre
        boolean estado
        datetime createdAt
        datetime updatedAt
    }

    Persona {
        int id PK
        string nombre
        string apellido
        string genero
        date fechaNacimiento
        boolean esAutor
        boolean esColector
        boolean estado
        int rolId FK
        datetime createdAt
        datetime updatedAt
    }

    Cuenta {
        int id PK
        string email UK
        string contrasena
        boolean estado
        int personaId FK
        datetime createdAt
        datetime updatedAt
    }

    %% ==================== ESTRUCTURA DEL JARDÍN ====================

    Seccion {
        int id PK
        string nombre
        string descripcion
        boolean estado
        datetime createdAt
        datetime updatedAt
    }

    %% ==================== PLANTA (ENTIDAD CENTRAL) ====================

    Planta {
        int id PK
        string nombreCientifico
        string nombreComun
        string sinonimos
        text descripcion
        text usos
        int seccionId FK
        boolean estado
        datetime createdAt
        datetime updatedAt
    }

    %% ==================== REGISTRO DE INGRESOS ====================

    RegistroIngreso {
        int id PK
        int personaId FK
        int plantaId FK
        int cantidad
        date fechaIngreso
        string observaciones
        datetime createdAt
        datetime updatedAt
    }

    %% ==================== DATOS GENERALES ====================

    DatosGenerales {
        int id PK
        int plantaId FK
        string endemismo
        string estadoConservacion
        string fuenteInformacion
        string habitoCrecimiento
        string historialRecibido
        string materialRecibido
        int numeroIndividuos
        string procedencia
        string comoSeReconoce
        string ubicacionGeografica
        string zonaVida
        datetime createdAt
        datetime updatedAt
    }

    %% ==================== TAXONOMÍA ====================

    Taxonomia {
        int id PK
        int plantaId FK
        string reino
        string phylum
        string division
        string clase
        string subclase
        string orden
        string familia
        string subfamilia
        string tribu
        string subtribu
        string genero
        string especie
        string subespecie
        string variedad
        string cultivar
        string autor
        datetime createdAt
        datetime updatedAt
    }

    %% ==================== CONDICIONES DE CULTIVO ====================

    CondicionCultivo {
        int id PK
        int plantaId FK
        string exposicion
        string floracion
        string humedad
        string riego
        text laboresCulturales
        text observaciones
        datetime createdAt
        datetime updatedAt
    }

    %% ==================== MORFOLOGÍA ====================

    Morfologia {
        int id PK
        int plantaId FK
        datetime createdAt
        datetime updatedAt
    }

    Hojas {
        int id PK
        int morfologiaId FK
        string forma
        string base
        string apice
        string borde
        string nervadura
        string filotaxis
        string complejidad
        string peciolo
        string estipulas
        string emergencia
        string colores
        datetime createdAt
        datetime updatedAt
    }

    Tallo {
        int id PK
        int morfologiaId FK
        string tipo
        string ramificacion
        datetime createdAt
        datetime updatedAt
    }

    Raiz {
        int id PK
        int morfologiaId FK
        string tipo
        datetime createdAt
        datetime updatedAt
    }

    Flor {
        int id PK
        int morfologiaId FK
        string tipo
        string simetria
        string perianto
        string caliz
        string corola
        string estambre
        string antera
        string ovario
        string prefloracion
        datetime createdAt
        datetime updatedAt
    }

    Inflorescencia {
        int id PK
        int morfologiaId FK
        string tipo
        datetime createdAt
        datetime updatedAt
    }

    Fruto {
        int id PK
        int morfologiaId FK
        string carnoso
        string secoDehiscente
        string secoIndehiscente
        string compuesto
        datetime createdAt
        datetime updatedAt
    }

    %% ==================== GALERÍA ====================

    Foto {
        int id PK
        int plantaId FK
        string nombre
        string ruta
        string descripcion
        string tipo
        datetime createdAt
        datetime updatedAt
    }

    %% ==================== RELACIONES ====================

    Rol ||--o{ Persona : "tiene"
    Persona ||--o| Cuenta : "tiene"
    Persona ||--o{ RegistroIngreso : "registra"

    Seccion ||--o{ Planta : "contiene"

    Planta ||--o{ RegistroIngreso : "tiene"
    Planta ||--o| DatosGenerales : "tiene"
    Planta ||--o| Taxonomia : "tiene"
    Planta ||--o| CondicionCultivo : "tiene"
    Planta ||--o| Morfologia : "tiene"
    Planta ||--o{ Foto : "tiene"

    Morfologia ||--o| Hojas : "tiene"
    Morfologia ||--o| Tallo : "tiene"
    Morfologia ||--o| Raiz : "tiene"
    Morfologia ||--o| Flor : "tiene"
    Morfologia ||--o| Inflorescencia : "tiene"
    Morfologia ||--o| Fruto : "tiene"
```

## Leyenda de Cardinalidades

| Símbolo | Significado |
|---------|-------------|
| `\|\|--o{` | Uno a muchos (0..*) |
| `\|\|--o\|` | Uno a uno opcional (0..1) |
| `\|\|--\|\|` | Uno a uno obligatorio |

## Notas de Diseño

### 1. Campos de Auditoría
Todas las tablas incluyen `createdAt` y `updatedAt` para trazabilidad.

### 2. Soft Delete
Se utiliza campo `estado` (boolean) en lugar de eliminar registros físicamente.

### 3. Morfología como Agregador
La tabla `Morfologia` actúa como punto de unión para todas las características morfológicas, facilitando:
- Consultas de "toda la morfología" de una planta
- Características opcionales (una planta sin flores no tendrá registro en `Flor`)

### 4. Secciones del Jardín
Nueva tabla `Seccion` para organizar plantas por área (Ornamentales, Medicinales, etc.)

### 5. Registro de Ingresos
Renombrado de `PP` a `RegistroIngreso` para mayor claridad. Registra quién ingresó qué planta y cuándo.
