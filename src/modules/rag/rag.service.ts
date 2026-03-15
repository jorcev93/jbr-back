import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { createHash } from 'crypto';
import { PlantEmbedding } from './entities/plant-embedding.entity';
import { AIProviderService } from '../ai-provider/ai-provider.service';
import { Planta } from '../plantas/entities/planta.entity';

/**
 * Resultado de búsqueda RAG
 */
export interface RAGSearchResult {
  plantaId: string;
  nombreCientifico: string;
  content: string;
  similarity: number;
}

/**
 * Servicio RAG (Retrieval-Augmented Generation)
 * Gestiona embeddings y búsquedas semánticas de plantas
 */
@Injectable()
export class RAGService implements OnModuleInit {
  private readonly logger = new Logger(RAGService.name);
  private pgvectorEnabled = false;

  constructor(
    @InjectRepository(PlantEmbedding)
    private embeddingRepository: Repository<PlantEmbedding>,
    @InjectRepository(Planta)
    private plantaRepository: Repository<Planta>,
    private aiProvider: AIProviderService,
    private dataSource: DataSource,
  ) {}

  async onModuleInit() {
    await this.checkPgVectorExtension();
  }

  /**
   * Verifica si pgvector está instalado
   */
  private async checkPgVectorExtension(): Promise<void> {
    try {
      await this.dataSource.query('CREATE EXTENSION IF NOT EXISTS vector');
      this.pgvectorEnabled = true;
      this.logger.log('Extensión pgvector habilitada');
    } catch (error) {
      this.logger.warn(
        'pgvector no disponible. Las búsquedas semánticas usarán búsqueda por texto.',
        error,
      );
      this.pgvectorEnabled = false;
    }
  }

  /**
   * Busca plantas similares a una consulta
   */
  async search(query: string, limit = 5): Promise<RAGSearchResult[]> {
    if (!this.aiProvider.isEmbeddingsConfigured()) {
      this.logger.warn('Embeddings no configurado, usando búsqueda por texto');
      return this.searchByText(query, limit);
    }

    try {
      // Generar embedding de la consulta
      const queryEmbedding = await this.aiProvider.generateEmbedding(query);

      if (this.pgvectorEnabled) {
        return this.searchByVector(queryEmbedding, limit);
      } else {
        return this.searchByCosineSimilarity(queryEmbedding, limit);
      }
    } catch (error) {
      this.logger.error('Error en búsqueda RAG:', error);
      return this.searchByText(query, limit);
    }
  }

  /**
   * Búsqueda usando pgvector (más eficiente)
   */
  private async searchByVector(
    queryEmbedding: number[],
    limit: number,
  ): Promise<RAGSearchResult[]> {
    const embeddingStr = `[${queryEmbedding.join(',')}]`;

    const results = await this.dataSource.query(
      `
      SELECT
        "plantaId",
        "nombreCientifico",
        content,
        1 - (embedding::vector <=> $1::vector) as similarity
      FROM plant_embeddings
      WHERE embedding IS NOT NULL
      ORDER BY embedding::vector <=> $1::vector
      LIMIT $2
    `,
      [embeddingStr, limit],
    );

    return results.map((r: { plantaId: string; nombreCientifico: string; content: string; similarity: number }) => ({
      plantaId: r.plantaId,
      nombreCientifico: r.nombreCientifico,
      content: r.content,
      similarity: r.similarity,
    }));
  }

  /**
   * Búsqueda por similitud coseno en memoria (fallback)
   */
  private async searchByCosineSimilarity(
    queryEmbedding: number[],
    limit: number,
  ): Promise<RAGSearchResult[]> {
    const embeddings = await this.embeddingRepository.find({
      where: {},
      select: ['plantaId', 'nombreCientifico', 'content', 'embedding'],
    });

    const results = embeddings
      .filter((e) => e.embedding && typeof e.embedding === 'string' && e.embedding.length > 0)
      .map((e) => ({
        plantaId: e.plantaId,
        nombreCientifico: e.nombreCientifico,
        content: e.content,
        similarity: this.cosineSimilarity(
          queryEmbedding,
          JSON.parse(e.embedding as unknown as string) as number[]
        ),
      }))
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit);

    return results;
  }

  /**
   * Búsqueda por texto simple (fallback cuando no hay embeddings)
   */
  private async searchByText(
    query: string,
    limit: number,
  ): Promise<RAGSearchResult[]> {
    const results = await this.embeddingRepository
      .createQueryBuilder('e')
      .where('e.content ILIKE :query', { query: `%${query}%` })
      .orWhere('e."nombreCientifico" ILIKE :query', { query: `%${query}%` })
      .orderBy('e."updatedAt"', 'DESC')
      .limit(limit)
      .getMany();

    return results.map((r) => ({
      plantaId: r.plantaId,
      nombreCientifico: r.nombreCientifico,
      content: r.content,
      similarity: 0.5, // Score arbitrario para búsqueda de texto
    }));
  }

  /**
   * Calcula similitud coseno entre dos vectores
   */
  private cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) return 0;

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }

    const denominator = Math.sqrt(normA) * Math.sqrt(normB);
    return denominator === 0 ? 0 : dotProduct / denominator;
  }

  /**
   * Genera o actualiza embedding para una planta
   */
  async syncPlantEmbedding(plantaId: string): Promise<void> {
    if (!this.aiProvider.isEmbeddingsConfigured()) {
      this.logger.debug('Embeddings no configurado, omitiendo sync');
      return;
    }

    try {
      // Obtener planta con todas sus relaciones
      const planta = await this.getPlantaWithRelations(plantaId);
      if (!planta) {
        this.logger.warn(`Planta ${plantaId} no encontrada para sync`);
        return;
      }

      // Generar contenido textual
      const content = this.generatePlantContent(planta);
      const contentHash = this.hashContent(content);

      // Verificar si ya existe y no ha cambiado
      const existing = await this.embeddingRepository.findOne({
        where: { plantaId },
      });

      if (existing && existing.contentHash === contentHash) {
        this.logger.debug(`Embedding de ${planta.nombreCientifico} ya está actualizado`);
        return;
      }

      // Generar embedding
      const embedding = await this.aiProvider.generateEmbedding(content);

      // Guardar o actualizar
      if (existing) {
        existing.content = content;
        existing.contentHash = contentHash;
        existing.embedding = `[${embedding.join(',')}]`;
        existing.nombreCientifico = planta.nombreCientifico;
        await this.embeddingRepository.save(existing);
      } else {
        const newEmbedding = this.embeddingRepository.create({
          plantaId,
          nombreCientifico: planta.nombreCientifico,
          content,
          contentHash,
          embedding: `[${embedding.join(',')}]`,
        });
        await this.embeddingRepository.save(newEmbedding);
      }

      this.logger.log(`Embedding sincronizado: ${planta.nombreCientifico}`);
    } catch (error) {
      this.logger.error(`Error sincronizando embedding de planta ${plantaId}:`, error);
    }
  }

  /**
   * Sincroniza embeddings de todas las plantas
   */
  async syncAllPlantEmbeddings(): Promise<{ synced: number; errors: number }> {
    const plantas = await this.plantaRepository.find({
      where: { estado: true },
      select: ['id'],
    });

    let synced = 0;
    let errors = 0;

    for (const planta of plantas) {
      try {
        await this.syncPlantEmbedding(planta.id);
        synced++;
      } catch {
        errors++;
      }
    }

    this.logger.log(`Sync completado: ${synced} éxitos, ${errors} errores`);
    return { synced, errors };
  }

  /**
   * Elimina embedding de una planta
   */
  async deletePlantEmbedding(plantaId: string): Promise<void> {
    await this.embeddingRepository.delete({ plantaId });
    this.logger.debug(`Embedding eliminado: ${plantaId}`);
  }

  /**
   * Obtiene planta con todas sus relaciones para generar el contenido
   */
  private async getPlantaWithRelations(plantaId: string): Promise<Planta | null> {
    return this.plantaRepository.findOne({
      where: { id: plantaId, estado: true },
      relations: [
        'seccion',
        'datosGenerales',
        'taxonomia',
        'condicionCultivo',
        'morfologia',
        'morfologia.hojas',
        'morfologia.tallo',
        'morfologia.raiz',
        'morfologia.flor',
        'morfologia.inflorescencia',
        'morfologia.fruto',
        'fotos',
        'registrosIngreso',
        'registrosIngreso.persona',
      ],
    });
  }

  /**
   * Genera contenido textual de una planta para embedding
   * Incluye toda la información relevante concatenada
   */
  private generatePlantContent(planta: Planta): string {
    const parts: string[] = [];

    // Información básica
    parts.push(`Nombre científico: ${planta.nombreCientifico}`);
    if (planta.nombreComun) parts.push(`Nombre común: ${planta.nombreComun}`);
    if (planta.sinonimos) parts.push(`Sinónimos: ${planta.sinonimos}`);
    if (planta.descripcion) parts.push(`Descripción: ${planta.descripcion}`);
    if (planta.usos) parts.push(`Usos: ${planta.usos}`);

    // Sección
    if (planta.seccion) {
      parts.push(`Sección del jardín: ${planta.seccion.nombre}`);
      if (planta.seccion.descripcion) {
        parts.push(`Descripción de sección: ${planta.seccion.descripcion}`);
      }
    }

    // Taxonomía
    if (planta.taxonomia) {
      const tax = planta.taxonomia;
      const taxParts: string[] = [];
      if (tax.reino) taxParts.push(`Reino: ${tax.reino}`);
      if (tax.phylum) taxParts.push(`Phylum: ${tax.phylum}`);
      if (tax.division) taxParts.push(`División: ${tax.division}`);
      if (tax.clase) taxParts.push(`Clase: ${tax.clase}`);
      if (tax.orden) taxParts.push(`Orden: ${tax.orden}`);
      if (tax.familia) taxParts.push(`Familia: ${tax.familia}`);
      if (tax.genero) taxParts.push(`Género: ${tax.genero}`);
      if (tax.especie) taxParts.push(`Especie: ${tax.especie}`);
      if (tax.autor) taxParts.push(`Autor: ${tax.autor}`);
      if (taxParts.length > 0) {
        parts.push(`Taxonomía: ${taxParts.join(', ')}`);
      }
    }

    // Datos generales
    if (planta.datosGenerales) {
      const dg = planta.datosGenerales;
      if (dg.endemismo) parts.push(`Endemismo: ${dg.endemismo}`);
      if (dg.estadoConservacion) parts.push(`Estado de conservación: ${dg.estadoConservacion}`);
      if (dg.habitoCrecimiento) parts.push(`Hábito de crecimiento: ${dg.habitoCrecimiento}`);
      if (dg.procedencia) parts.push(`Procedencia: ${dg.procedencia}`);
      if (dg.ubicacionGeografica) parts.push(`Ubicación geográfica: ${dg.ubicacionGeografica}`);
      if (dg.zonaVida) parts.push(`Zona de vida: ${dg.zonaVida}`);
      if (dg.comoSeReconoce) parts.push(`Cómo se reconoce: ${dg.comoSeReconoce}`);
      if (dg.materialRecibido) parts.push(`Material recibido: ${dg.materialRecibido}`);
      if (dg.numeroIndividuos) parts.push(`Número de individuos: ${dg.numeroIndividuos}`);
    }

    // Condiciones de cultivo
    if (planta.condicionCultivo) {
      const cc = planta.condicionCultivo;
      if (cc.exposicion) parts.push(`Exposición solar: ${cc.exposicion}`);
      if (cc.floracion) parts.push(`Época de floración: ${cc.floracion}`);
      if (cc.humedad) parts.push(`Humedad: ${cc.humedad}`);
      if (cc.riego) parts.push(`Riego: ${cc.riego}`);
      if (cc.laboresCulturales) parts.push(`Labores culturales: ${cc.laboresCulturales}`);
      if (cc.observaciones) parts.push(`Observaciones de cultivo: ${cc.observaciones}`);
    }

    // Morfología
    if (planta.morfologia) {
      const morf = planta.morfologia;

      // Hojas
      if (morf.hojas) {
        const h = morf.hojas;
        const hojaParts: string[] = [];
        if (h.forma) hojaParts.push(`forma ${h.forma}`);
        if (h.borde) hojaParts.push(`borde ${h.borde}`);
        if (h.nervadura) hojaParts.push(`nervadura ${h.nervadura}`);
        if (h.filotaxis) hojaParts.push(`filotaxis ${h.filotaxis}`);
        if (h.colores) hojaParts.push(`colores: ${h.colores}`);
        if (hojaParts.length > 0) {
          parts.push(`Hojas: ${hojaParts.join(', ')}`);
        }
      }

      // Tallo
      if (morf.tallo) {
        const t = morf.tallo;
        if (t.tipo) parts.push(`Tallo: tipo ${t.tipo}`);
        if (t.ramificacion) parts.push(`Ramificación del tallo: ${t.ramificacion}`);
      }

      // Raíz
      if (morf.raiz && morf.raiz.tipo) {
        parts.push(`Raíz: ${morf.raiz.tipo}`);
      }

      // Flor
      if (morf.flor) {
        const f = morf.flor;
        const florParts: string[] = [];
        if (f.tipo) florParts.push(`tipo ${f.tipo}`);
        if (f.simetria) florParts.push(`simetría ${f.simetria}`);
        if (f.corola) florParts.push(`corola ${f.corola}`);
        if (f.caliz) florParts.push(`cáliz ${f.caliz}`);
        if (florParts.length > 0) {
          parts.push(`Flor: ${florParts.join(', ')}`);
        }
      }

      // Inflorescencia
      if (morf.inflorescencia && morf.inflorescencia.tipo) {
        parts.push(`Inflorescencia: ${morf.inflorescencia.tipo}`);
      }

      // Fruto
      if (morf.fruto) {
        const fr = morf.fruto;
        if (fr.carnoso) parts.push(`Fruto carnoso: ${fr.carnoso}`);
        if (fr.secoDehiscente) parts.push(`Fruto seco dehiscente: ${fr.secoDehiscente}`);
        if (fr.secoIndehiscente) parts.push(`Fruto seco indehiscente: ${fr.secoIndehiscente}`);
      }
    }

    // Fotos (solo metadata)
    if (planta.fotos && planta.fotos.length > 0) {
      const fotoDescriptions = planta.fotos
        .filter((f) => f.descripcion)
        .map((f) => f.descripcion);
      if (fotoDescriptions.length > 0) {
        parts.push(`Fotos disponibles: ${fotoDescriptions.join('; ')}`);
      }
    }

    // Registros de ingreso (donantes)
    if (planta.registrosIngreso && planta.registrosIngreso.length > 0) {
      for (const ri of planta.registrosIngreso) {
        if (ri.persona) {
          const donanteInfo: string[] = [];
          donanteInfo.push(`${ri.persona.nombre} ${ri.persona.apellido}`);
          if (ri.fechaIngreso) {
            const fecha = new Date(ri.fechaIngreso).toLocaleDateString('es-EC');
            donanteInfo.push(`fecha: ${fecha}`);
          }
          if (ri.cantidad && ri.cantidad > 1) {
            donanteInfo.push(`cantidad: ${ri.cantidad}`);
          }
          if (ri.observaciones) {
            donanteInfo.push(`observaciones: ${ri.observaciones}`);
          }
          parts.push(`Donante: ${donanteInfo.join(', ')}`);
        }
      }
    }

    return parts.join('\n');
  }

  /**
   * Genera hash MD5 del contenido para detectar cambios
   */
  private hashContent(content: string): string {
    return createHash('md5').update(content).digest('hex');
  }

  /**
   * Construye el contexto RAG para el prompt del chat
   */
  async buildContext(query: string, maxResults = 3): Promise<string> {
    const results = await this.search(query, maxResults);

    if (results.length === 0) {
      return '';
    }

    const contextParts = results.map(
      (r, i) =>
        `--- Planta ${i + 1}: ${r.nombreCientifico} (relevancia: ${(r.similarity * 100).toFixed(1)}%) ---\n${r.content}`,
    );

    return `INFORMACIÓN DE LA BASE DE DATOS DEL JARDÍN BOTÁNICO:\n\n${contextParts.join('\n\n')}`;
  }

  /**
   * Consulta información pública de donantes y las plantas que donaron.
   * Solo expone: nombre, apellido, esAutor, esColector y datos del registro.
   */
  async getDonorInfo(): Promise<string> {
    const rows = await this.dataSource.query(`
      SELECT
        p.nombre,
        p.apellido,
        pl."nombreCientifico",
        pl."nombreComun",
        ri.cantidad,
        ri."fechaIngreso",
        ri.observaciones
      FROM registros_ingreso ri
      INNER JOIN personas p ON ri."personaId" = p.id
      INNER JOIN plantas pl ON ri."plantaId" = pl.id
      WHERE pl.estado = true
        AND p."esColector" = false
        AND p."esAutor" = false
      ORDER BY p.apellido, p.nombre, ri."fechaIngreso"
    `);

    if (!rows || rows.length === 0) {
      return 'No hay registros de donaciones en la base de datos.';
    }

    // Agrupar por persona
    const byPerson = new Map<string, { meta: string; plantas: string[] }>();
    for (const r of rows as {
      nombre: string;
      apellido: string;
      nombreCientifico: string;
      nombreComun: string | null;
      cantidad: number;
      fechaIngreso: string;
      observaciones: string | null;
    }[]) {
      const key = `${r.apellido}, ${r.nombre}`;
      if (!byPerson.has(key)) {
        byPerson.set(key, { meta: `${r.nombre} ${r.apellido}`, plantas: [] });
      }
      const fecha = r.fechaIngreso
        ? new Date(r.fechaIngreso).toLocaleDateString('es-EC')
        : 'fecha desconocida';
      const plantaNombre = r.nombreComun
        ? `${r.nombreCientifico} (${r.nombreComun})`
        : r.nombreCientifico;
      let detalle = `${plantaNombre}, cantidad: ${r.cantidad}, fecha: ${fecha}`;
      if (r.observaciones) detalle += `, observaciones: ${r.observaciones}`;
      byPerson.get(key)!.plantas.push(detalle);
    }

    const lines: string[] = ['DONANTES REGISTRADOS EN EL JARDÍN BOTÁNICO:'];
    for (const { meta, plantas } of byPerson.values()) {
      lines.push(`\nPersona: ${meta}`);
      lines.push(`  Plantas donadas:`);
      for (const p of plantas) {
        lines.push(`    - ${p}`);
      }
    }

    return lines.join('\n');
  }

  /**
   * Consulta estadísticas agregadas reales de la BD:
   * total de plantas, plantas por sección, total de individuos.
   */
  async getAggregateStats(): Promise<string> {
    const [totalPlantas, porSeccion, totIndividuos] = await Promise.all([
      this.plantaRepository.count({ where: { estado: true } }),

      this.dataSource.query(`
        SELECT
          COALESCE(s.nombre, 'Sin sección') AS seccion,
          COUNT(p.id)::int                  AS total
        FROM plantas p
        LEFT JOIN secciones s ON p."seccionId" = s.id
        WHERE p.estado = true
        GROUP BY s.nombre
        ORDER BY total DESC
      `),

      this.dataSource.query(`
        SELECT COALESCE(SUM(dg."numeroIndividuos"), 0)::int AS total
        FROM datos_generales dg
        INNER JOIN plantas p ON dg."plantaId" = p.id
        WHERE p.estado = true
      `),
    ]);

    const seccionesLines = (porSeccion as { seccion: string; total: number }[])
      .map((r) => `  - ${r.seccion}: ${r.total} plantas`)
      .join('\n');

    const totalIndividuos = (totIndividuos as { total: number }[])[0]?.total ?? 0;

    return [
      `ESTADÍSTICAS REALES DE LA BASE DE DATOS DEL JARDÍN BOTÁNICO:`,
      `- Total de especies/registros de plantas: ${totalPlantas}`,
      `- Total de individuos registrados: ${totalIndividuos}`,
      `- Distribución por sección:\n${seccionesLines}`,
    ].join('\n');
  }
}
