/**
 * Comportamiento de la página /buscar/ (src/pages/buscar.astro).
 *
 * Usa la API de JavaScript de Pagefind, no su interfaz prearmada, para respetar la
 * identidad visual y controlar la accesibilidad. El índice (dist/pagefind/) se
 * genera en el build: en `npm run dev` no existe, hay que probar con `npm run preview`.
 *
 * Todo corre en el navegador. Lo único que se descarga son archivos del propio
 * sitio, así que cumple la CSP (con 'wasm-unsafe-eval': el motor es WebAssembly).
 */
import { FILTROS } from '../lib/busqueda';
import { abreEnPestanaNueva, ATRIBUTOS_PESTANA_NUEVA, AVISO_PESTANA_NUEVA } from '../lib/enlaces';
import { formatearFecha } from '../lib/fechas';

// --- Tipos mínimos de la API de Pagefind (solo lo que se usa) ---------------
type Conteos = Record<string, Record<string, number>>;

interface DatosResultado {
	url: string;
	/** Fragmento con las coincidencias marcadas con <mark>. Pagefind ya escapa el HTML. */
	excerpt: string;
	meta: Record<string, string | undefined>;
}

interface Pagefind {
	options(opciones: Record<string, unknown>): Promise<void>;
	init(): Promise<void>;
	filters(): Promise<Conteos>;
	search(
		texto: string | null,
		opciones?: { filters?: Record<string, { any: string[] }>; sort?: Record<string, 'asc' | 'desc'> },
	): Promise<{ results: Array<{ data(): Promise<DatosResultado> }>; filters: Conteos }>;
}

/** Cuántos resultados se dibujan de una vez. Pagefind descarga cada uno al pedir sus datos. */
const POR_PAGINA = 20;
/** Espera tras la última tecla antes de buscar (y de anunciar el resultado) */
const DEMORA_MS = 300;

const NOMBRES_FILTROS = Object.values(FILTROS);

export async function iniciarBuscador(): Promise<void> {
	const raiz = document.querySelector<HTMLElement>('[data-buscador]');
	if (!raiz) return;

	const $ = <T extends Element>(selector: string) => raiz.querySelector<T>(selector)!;
	const form = $<HTMLFormElement>('[data-form]');
	const campoTexto = $<HTMLInputElement>('#q');
	const estado = $<HTMLElement>('[data-estado]');
	const lista = $<HTMLUListElement>('[data-resultados]');
	const botonMas = $<HTMLButtonElement>('[data-mas]');
	const selects = new Map(
		NOMBRES_FILTROS.map((nombre) => [nombre, $<HTMLSelectElement>(`[data-filtro="${nombre}"]`)]),
	);

	raiz.hidden = false;

	let pagefind: Pagefind;
	try {
		// Ruta armada en tiempo de ejecución: el archivo no existe cuando Vite compila
		const ruta = '/pagefind/pagefind.js';
		pagefind = await import(/* @vite-ignore */ ruta);
		await pagefind.options({ excerptLength: 24 });
		await pagefind.init();
	} catch {
		form.hidden = true;
		estado.textContent = import.meta.env.DEV
			? 'El índice de búsqueda se genera en el build: probalo con npm run build y npm run preview.'
			: 'El buscador no está disponible en este momento. Podés recorrer los documentos desde las secciones del portal.';
		return;
	}

	const totales = await pagefind.filters();
	cargarOpciones(selects, totales);
	leerURL(campoTexto, selects);

	// --- Búsqueda ---------------------------------------------------------
	let pendientes: Array<{ data(): Promise<DatosResultado> }> = [];
	// Si la persona escribe rápido, una búsqueda vieja puede terminar después de
	// una nueva. Cada búsqueda lleva un número y solo dibuja la última.
	let ultimaBusqueda = 0;

	async function buscar(): Promise<void> {
		const numero = ++ultimaBusqueda;
		const texto = campoTexto.value.trim();
		const filtros: Record<string, { any: string[] }> = {};
		for (const [nombre, select] of selects) {
			if (select.value) filtros[nombre] = { any: [select.value] };
		}
		const hayFiltros = Object.keys(filtros).length > 0;

		escribirURL(texto, filtros);

		if (!texto && !hayFiltros) {
			lista.replaceChildren();
			botonMas.hidden = true;
			estado.textContent = '';
			actualizarConteos(selects, totales);
			return;
		}

		// Sin texto no hay "relevancia": se ordena por fecha, lo más nuevo primero
		const respuesta = await pagefind.search(texto || null, {
			filters: filtros,
			sort: texto ? undefined : { fecha: 'desc' },
		});
		if (numero !== ultimaBusqueda) return;

		actualizarConteos(selects, respuesta.filters);
		// Copia: mostrarMas() consume `pendientes` con splice y no debe vaciar la respuesta
		const n = respuesta.results.length;
		pendientes = [...respuesta.results];
		lista.replaceChildren();
		await mostrarMas();
		if (numero !== ultimaBusqueda) return;

		estado.textContent =
			n === 0
				? 'No se encontraron documentos. Probá con otras palabras o quitá algún filtro.'
				: `${n === 1 ? 'Se encontró 1 resultado' : `Se encontraron ${n} resultados`}${texto ? ` para «${texto}»` : ''}.`;
	}

	async function mostrarMas(): Promise<HTMLElement | undefined> {
		const tanda = pendientes.splice(0, POR_PAGINA);
		const datos = await Promise.all(tanda.map((resultado) => resultado.data()));
		const items = datos.map(dibujarResultado);
		lista.append(...items);
		botonMas.hidden = pendientes.length === 0;
		return items[0];
	}

	// --- Eventos ----------------------------------------------------------
	let temporizador: number | undefined;
	campoTexto.addEventListener('input', () => {
		window.clearTimeout(temporizador);
		temporizador = window.setTimeout(buscar, DEMORA_MS);
	});
	for (const select of selects.values()) select.addEventListener('change', buscar);
	form.addEventListener('submit', (evento) => {
		evento.preventDefault();
		window.clearTimeout(temporizador);
		buscar();
	});
	// El reset vacía los campos DESPUÉS del evento: se busca en el siguiente ciclo
	form.addEventListener('reset', () => setTimeout(() => (buscar(), campoTexto.focus())));

	botonMas.addEventListener('click', async () => {
		const primero = await mostrarMas();
		// Para quien navega con teclado: el foco va al primer resultado nuevo, no
		// queda en un botón que puede haber desaparecido
		primero?.querySelector('a')?.focus();
	});

	buscar();
}

// --- Filtros ----------------------------------------------------------------

function cargarOpciones(selects: Map<string, HTMLSelectElement>, totales: Conteos): void {
	for (const [nombre, select] of selects) {
		const valores = Object.keys(totales[nombre] ?? {});
		// Años: del más reciente al más antiguo. El resto, alfabético en castellano.
		valores.sort((a, b) => (nombre === FILTROS.anio ? b.localeCompare(a) : a.localeCompare(b, 'es')));
		for (const valor of valores) select.add(new Option(valor, valor));
	}
}

/**
 * Muestra cuántos resultados quedarían al elegir cada opción: "2026 (3)".
 * Las opciones con 0 se deshabilitan para no llevar a una búsqueda vacía.
 */
function actualizarConteos(selects: Map<string, HTMLSelectElement>, conteos: Conteos): void {
	for (const [nombre, select] of selects) {
		for (const opcion of select.options) {
			if (!opcion.value) continue;
			const n = conteos[nombre]?.[opcion.value] ?? 0;
			opcion.text = `${opcion.value} (${n})`;
			opcion.disabled = n === 0 && !opcion.selected;
		}
	}
}

// --- URL: la búsqueda se puede compartir y sobrevive al botón "atrás" -------

function leerURL(campoTexto: HTMLInputElement, selects: Map<string, HTMLSelectElement>): void {
	const parametros = new URLSearchParams(location.search);
	campoTexto.value = parametros.get('q') ?? '';
	for (const [nombre, select] of selects) {
		const valor = parametros.get(nombre);
		// Solo si la opción existe: una URL vieja con un año que ya no está no rompe nada
		if (valor && [...select.options].some((opcion) => opcion.value === valor)) select.value = valor;
	}
}

function escribirURL(texto: string, filtros: Record<string, { any: string[] }>): void {
	const parametros = new URLSearchParams();
	if (texto) parametros.set('q', texto);
	for (const [nombre, { any }] of Object.entries(filtros)) parametros.set(nombre, any[0]);
	const consulta = parametros.toString();
	// replaceState y no pushState: cada tecla no debe sumar una entrada al historial
	history.replaceState(null, '', consulta ? `?${consulta}` : location.pathname);
}

// --- Resultados ---------------------------------------------------------------

/**
 * Mismo formato que src/components/ListaDocumentos.astro, para que un documento
 * se vea igual en su sección y en el buscador. Se arma con textContent (no
 * innerHTML) para que ningún título pueda inyectar HTML.
 */
function dibujarResultado(datos: DatosResultado): HTMLLIElement {
	const { meta } = datos;
	const item = elemento('li', 'documento');
	const enlace = elemento('a', 'documento__titulo', meta.title ?? datos.url);
	enlace.href = datos.url;
	item.append(enlace);
	// Misma regla que el componente Enlace.astro (src/lib/enlaces.ts)
	const nueva = abreEnPestanaNueva(datos.url);
	if (nueva) Object.assign(enlace, ATRIBUTOS_PESTANA_NUEVA);

	const esDocumento = Boolean(meta.tipo);
	if (esDocumento) {
		// Formato y tamaño DENTRO del link, como en las secciones (WCAG 2.4.4)
		enlace.append(' ', elemento('span', 'documento__archivo', `(PDF, ${meta.tamano})`));
		if (meta.descripcion) item.append(elemento('p', 'documento__descripcion', meta.descripcion));
	} else {
		// Páginas del portal: el fragmento de Pagefind con las palabras marcadas
		const fragmento = elemento('p', 'documento__descripcion');
		fragmento.innerHTML = datos.excerpt;
		item.append(fragmento);
	}

	if (nueva) enlace.append(elemento('span', 'solo-lectores', ` ${AVISO_PESTANA_NUEVA}`));

	const detalles = elemento('p', 'documento__meta');
	if (esDocumento) {
		detalles.append(elemento('span', '', meta.tipo!));
		if (meta.fecha) {
			const fecha = elemento('time', '', formatearFecha(meta.fecha));
			fecha.dateTime = meta.fecha;
			detalles.append(elemento('span', '', '', fecha));
		}
		if (meta.seccion) detalles.append(elemento('span', '', meta.seccion));
		if (meta.expediente) detalles.append(elemento('span', '', `Expte. ${meta.expediente}`));
	} else {
		detalles.append(elemento('span', '', 'Página del portal'));
	}
	item.append(detalles);
	return item;
}

function elemento<K extends keyof HTMLElementTagNameMap>(
	etiqueta: K,
	clase: string,
	texto = '',
	...hijos: Node[]
): HTMLElementTagNameMap[K] {
	const nodo = document.createElement(etiqueta);
	if (clase) nodo.className = clase;
	if (texto) nodo.textContent = texto;
	nodo.append(...hijos);
	return nodo;
}
