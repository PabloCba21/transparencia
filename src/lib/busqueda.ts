/**
 * Modelo de datos del buscador.
 *
 * Pagefind indexa páginas HTML, pero en el portal cada sección es UNA página con
 * muchos documentos. Para poder buscar y filtrar documento por documento, cada
 * uno entra al índice como un "registro propio" (custom record) que apunta
 * directo a su PDF.
 *
 * Flujo en el build:
 *   1. src/pages/indice-busqueda.json.ts arma la lista de registros con esta función.
 *   2. src/integrations/buscador.ts la lee, la suma al índice y borra el JSON.
 *
 * Si cambia lo que se indexa o los filtros, cambia acá y en ningún otro lado.
 */
import type { Seccion } from "../data/secciones";
// OJO: este archivo lo importan el config de Astro y el navegador. Solo puede
// importar valores de módulos sin dependencias de Astro (de ./documentos, solo tipos).
import type { Documento } from "./documentos";
import { formatearTamano } from "./formato";

/** Nombre del archivo intermedio que pasa los registros del build a la integración. */
export const ARCHIVO_REGISTROS = "indice-busqueda.json";

/**
 * Nombres de los filtros. La página /buscar/ los lee de acá, así que renombrar
 * uno no rompe la interfaz en silencio.
 */
export const FILTROS = {
  anio: "anio",
  seccion: "seccion",
  tipo: "tipo",
} as const;

/**
 * Lo que la página /buscar/ muestra de cada documento (src/scripts/buscador.ts).
 * Pagefind solo guarda texto, por eso todo es string. Los opcionales se omiten
 * si el documento no los tiene (Pagefind no acepta `undefined`).
 */
export interface MetaDocumento {
  title: string;
  /** Título de la sección, tal como se muestra */
  seccion: string;
  tipo: string;
  /** AAAA-MM-DD; el navegador la formatea */
  fecha: string;
  /** Ya formateado: "1,2 MB" */
  tamano: string;
  expediente?: string;
  descripcion?: string;
}

/** Lo mismo que espera `addCustomRecord` de Pagefind, sin el idioma (se fija en la integración). */
export interface RegistroBusqueda {
  /** URL del PDF. Pagefind la devuelve tal cual en el resultado. */
  url: string;
  /** Texto en el que se busca. Las palabras que no estén acá no encuentran el documento. */
  content: string;
  /** Datos que se muestran en el resultado (Pagefind no busca en ellos, salvo `title`). */
  meta: MetaDocumento;
  /**
   * Valores por los que se puede filtrar, con las claves de FILTROS. El valor
   * es lo que la persona ve en el desplegable, así que va legible ("Normativa",
   * no "normativa"). Cada filtro admite varios valores.
   */
  filters: Record<(typeof FILTROS)[keyof typeof FILTROS], string[]>;
  /**
   * Claves de orden. La búsqueda sin texto (solo filtros) ordena por `fecha`,
   * de la más reciente a la más antigua. AAAA-MM-DD ordena bien como texto.
   */
  sort: { fecha: string };
}

export function aRegistro(doc: Documento, seccion: Seccion): RegistroBusqueda {
	return {
		url: doc.url,

		// Texto donde busca Pagefind. filter(Boolean) saca los undefined
		// (descripción o expediente que no se cargaron) antes del join.
		content: [
			doc.titulo,
			doc.descripcion,
			doc.tipo,
			doc.expediente,
			seccion.titulo,
		]
			.filter(Boolean)
			.join(". "),

		meta: {
			title: doc.titulo,
			seccion: seccion.titulo,
			tipo: doc.tipo,
			fecha: doc.fecha,
			tamano: formatearTamano(doc.bytes),
			// Spread condicional: si hay expediente, agrega { expediente: '...' };
			// si no, no agrega nada (ni siquiera la clave).
			...(doc.expediente && { expediente: doc.expediente }),
			...(doc.descripcion && { descripcion: doc.descripcion }),
		},

		filters: {
			anio: [doc.fecha.slice(0, 4)], // "2026-06-24" → "2026"
			seccion: [seccion.titulo],
			tipo: [doc.tipo],
		},

		sort: { fecha: doc.fecha },
	};
}
