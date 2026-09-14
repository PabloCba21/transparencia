/**
 * Lectura de los documentos de cada sección, con las validaciones que el
 * esquema de src/content.config.ts no puede hacer por sí solo: que el PDF
 * exista en disco y que cada archivo YAML corresponda a una sección real.
 */
import { existsSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { getCollection, getEntry } from 'astro:content';
import { secciones } from '../data/secciones';

// process.cwd() es la raíz del proyecto durante `npm run build`.
// (import.meta.url no sirve: en el build el código se mueve a otra carpeta.)
const CARPETA_DOCUMENTOS = join(process.cwd(), 'public', 'documentos');

export interface Documento {
	titulo: string;
	fecha: string;
	publicado: string;
	tipo: string;
	archivo: string;
	expediente?: string;
	descripcion?: string;
	/** URL pública del PDF */
	url: string;
	/** Tamaño en bytes, para mostrarlo antes de descargar */
	bytes: number;
}

export interface ContenidoSeccion {
	revisado: string;
	/** Ordenados del más reciente al más antiguo */
	documentos: Documento[];
	/** La fecha más reciente entre la revisión y las publicaciones */
	ultimaActualizacion: string;
}

export async function contenidoDeSeccion(slug: string): Promise<ContenidoSeccion> {
	const entrada = await getEntry('documentos', slug);
	if (!entrada) {
		throw new Error(`Falta el archivo src/content/documentos/${slug}.yaml para la sección "${slug}".`);
	}

	const documentos = entrada.data.documentos
		.map((doc): Documento => {
			const ruta = join(CARPETA_DOCUMENTOS, slug, doc.archivo);
			if (!existsSync(ruta)) {
				throw new Error(
					`El documento "${doc.titulo}" (sección ${slug}) apunta a un archivo que no existe: public/documentos/${slug}/${doc.archivo}`,
				);
			}
			return { ...doc, url: `/documentos/${slug}/${doc.archivo}`, bytes: statSync(ruta).size };
		})
		.sort((a, b) => b.fecha.localeCompare(a.fecha));

	// Las fechas AAAA-MM-DD se pueden comparar como texto
	const fechas = [entrada.data.revisado, ...documentos.map((doc) => doc.publicado)];
	const ultimaActualizacion = fechas.sort().at(-1)!;

	return { revisado: entrada.data.revisado, documentos, ultimaActualizacion };
}

/** Falla el build si hay un YAML que no corresponde a ninguna sección (por ejemplo, un nombre mal escrito). */
export async function validarArchivosDeSecciones(): Promise<void> {
	const slugs = new Set(secciones.map((seccion) => seccion.slug));
	const sobrantes = (await getCollection('documentos')).map((entrada) => entrada.id).filter((id) => !slugs.has(id));
	if (sobrantes.length > 0) {
		throw new Error(
			`Estos archivos no corresponden a ninguna sección: ${sobrantes.map((id) => `src/content/documentos/${id}.yaml`).join(', ')}`,
		);
	}
}

/** Agrupa por año de la fecha del documento, del más reciente al más antiguo. */
export function agruparPorAnio(documentos: Documento[]): Array<[anio: string, documentos: Documento[]]> {
	const grupos = new Map<string, Documento[]>();
	for (const doc of documentos) {
		const anio = doc.fecha.slice(0, 4);
		grupos.set(anio, [...(grupos.get(anio) ?? []), doc]);
	}
	return [...grupos.entries()].sort(([a], [b]) => b.localeCompare(a));
}

/** 1234567 → "1,2 MB" · 85000 → "83 KB" */
export function formatearTamano(bytes: number): string {
	const formato = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 1 });
	if (bytes >= 1024 * 1024) return `${formato.format(bytes / (1024 * 1024))} MB`;
	return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}
