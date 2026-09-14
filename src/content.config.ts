/**
 * Esquema del contenido del portal.
 *
 * Cada sección tiene un archivo src/content/documentos/<slug>.yaml con la lista
 * de sus documentos. Astro valida cada archivo contra este esquema durante el
 * build: si falta un campo o un valor no tiene el formato esperado, el build
 * falla y no se publica nada roto.
 *
 * Guía para cargar documentos: docs/cargar-documentos.md
 */
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

/**
 * Fecha AAAA-MM-DD, normalizada a texto.
 *
 * YAML convierte `2026-03-15` (sin comillas) en un Date a medianoche UTC. Si se
 * formateara así en Argentina (UTC-3) mostraría el 14 de marzo. Por eso se
 * guarda como texto y se formatea en src/lib/fechas.ts.
 */
const fecha = z
	.union([z.date(), z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'la fecha tiene que tener el formato AAAA-MM-DD')])
	.transform((valor) => (valor instanceof Date ? valor.toISOString().slice(0, 10) : valor))
	.refine((iso) => !Number.isNaN(Date.parse(`${iso}T12:00:00`)), 'la fecha no existe');

export const TIPOS_DOCUMENTO = [
	'Resolución',
	'Ordenanza',
	'Disposición',
	'Informe',
	'Convenio',
	'Contrato',
	'Acta',
	'Otro',
] as const;

const documento = z
	.object({
		titulo: z.string().min(5, 'el título es demasiado corto'),
		/** Fecha del documento (la que figura en el documento) */
		fecha,
		/** Fecha en que se cargó en el portal */
		publicado: fecha,
		tipo: z.enum(TIPOS_DOCUMENTO, { error: `el tipo tiene que ser uno de: ${TIPOS_DOCUMENTO.join(', ')}` }),
		/**
		 * Ruta del PDF dentro de public/documentos/<sección>/, empezando por el año.
		 * Solo minúsculas, números y guiones: sin espacios ni tildes, que rompen las URLs.
		 */
		archivo: z
			.string()
			.regex(
				/^\d{4}\/[a-z0-9]+(?:-[a-z0-9]+)*\.pdf$/,
				'el archivo tiene que ser AAAA/nombre-en-minusculas.pdf (sin espacios, tildes ni mayúsculas)',
			),
		expediente: z.string().optional(),
		descripcion: z.string().optional(),
	})
	.refine((doc) => doc.archivo.startsWith(`${doc.fecha.slice(0, 4)}/`), {
		message: 'la carpeta del archivo tiene que ser el año de la fecha del documento',
		path: ['archivo'],
	});

const documentos = defineCollection({
	// Un archivo por sección; el nombre del archivo es el slug de la sección
	loader: glob({ pattern: '*.yaml', base: './src/content/documentos' }),
	schema: z.object({
		/** Última vez que la SSI revisó con el área si hay información nueva */
		revisado: fecha,
		documentos: z.array(documento).default([]),
	}),
});

export const collections = { documentos };
