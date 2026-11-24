/**
 * Genera el índice de búsqueda al final del build.
 *
 * Pagefind trabaja sobre el HTML ya generado: no hace falta servidor ni base de
 * datos, el resultado son archivos estáticos en dist/pagefind/ que el navegador
 * descarga por partes a medida que se escribe.
 *
 * Se indexan dos cosas:
 *   - las páginas del sitio (solo el <main> marcado con data-pagefind-body);
 *   - un registro por documento, armado en src/lib/busqueda.ts.
 *
 * Cualquier error de Pagefind hace fallar el build: mejor no publicar que
 * publicar un buscador que no encuentra lo que está cargado.
 */
import { readFile, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { AstroIntegration } from 'astro';
import * as pagefind from 'pagefind';
import { ARCHIVO_REGISTROS, type RegistroBusqueda } from '../lib/busqueda';

function verificar(paso: string, errores: string[]): void {
	if (errores.length > 0) {
		throw new Error(`Pagefind falló al ${paso}:\n  ${errores.join('\n  ')}`);
	}
}

export default function buscador(): AstroIntegration {
	return {
		name: 'buscador-pagefind',
		hooks: {
			'astro:build:done': async ({ dir, logger }) => {
				const dist = fileURLToPath(dir);
				const rutaRegistros = join(dist, ARCHIVO_REGISTROS);
				const registros: RegistroBusqueda[] = JSON.parse(await readFile(rutaRegistros, 'utf8'));
				// Es un archivo de paso: no tiene que quedar publicado
				await rm(rutaRegistros);

				try {
					// Todo el sitio está en español: se fija el idioma para que use un solo
					// índice y el "stemming" del castellano (presupuesto ≈ presupuestos).
					const { index, errors } = await pagefind.createIndex({ forceLanguage: 'es' });
					verificar('crear el índice', errors);

					const paginas = await index!.addDirectory({ path: dist });
					verificar('indexar las páginas', paginas.errors);

					for (const registro of registros) {
						const { errors } = await index!.addCustomRecord({ ...registro, language: 'es' });
						verificar(`indexar "${registro.meta.title ?? registro.url}"`, errors);
					}

					const escritura = await index!.writeFiles({ outputPath: join(dist, 'pagefind') });
					verificar('escribir el índice', escritura.errors);

					logger.info(`Índice listo: ${paginas.page_count} páginas y ${registros.length} documentos.`);
				} finally {
					// Pagefind corre como un proceso aparte: si no se cierra, el build no termina
					await pagefind.close();
				}
			},
		},
	};
}
