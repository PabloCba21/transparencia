/**
 * Archivo intermedio del buscador: NO se publica.
 *
 * Astro lo genera en dist/indice-busqueda.json durante el build, con un registro
 * por documento. La integración src/integrations/buscador.ts lo lee, lo pasa a
 * Pagefind y lo borra. Se arma acá (y no en la integración) porque solo dentro
 * de Astro están disponibles las colecciones de contenido y sus validaciones.
 */
import type { APIRoute } from 'astro';
import { secciones } from '../data/secciones';
import { contenidoDeSeccion } from '../lib/documentos';
import { aRegistro, type RegistroBusqueda } from '../lib/busqueda';

export const GET: APIRoute = async () => {
	const registros: RegistroBusqueda[] = [];
	for (const seccion of secciones) {
		const { documentos } = await contenidoDeSeccion(seccion.slug);
		registros.push(...documentos.map((doc) => aRegistro(doc, seccion)));
	}
	return new Response(JSON.stringify(registros), {
		headers: { 'Content-Type': 'application/json' },
	});
};
