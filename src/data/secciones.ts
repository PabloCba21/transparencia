/**
 * Fuente única de las secciones del portal.
 *
 * De acá salen el menú, las tarjetas de la home y las páginas de cada sección:
 * agregar o renombrar una sección se hace en un solo lugar.
 *
 * Referencia: Ley 27.275 (acceso a la información pública), art. 32.
 */

export interface Seccion {
	/** Parte final de la URL: /presupuesto */
	slug: string;
	/** Título completo, para el encabezado de la página */
	titulo: string;
	/** Versión corta, para el menú */
	tituloCorto: string;
	/** Una línea que explica qué va a encontrar la persona */
	descripcion: string;
}

// Los documentos de cada sección y su fecha de actualización están en
// src/content/documentos/<slug>.yaml. La fecha se calcula a partir del contenido,
// nunca de la fecha del build: esa cambiaría en cada deploy aunque nada cambie.

export const secciones: Seccion[] = [
	{
		slug: 'presupuesto',
		titulo: 'Presupuesto asignado',
		tituloCorto: 'Presupuesto',
		descripcion: 'Presupuesto anual asignado a la Universidad Nacional de La Rioja y su distribución por finalidad.',
	},
	{
		slug: 'ejecucion-presupuestaria',
		titulo: 'Ejecución presupuestaria',
		tituloCorto: 'Ejecución',
		descripcion: 'Estado de ejecución del presupuesto: qué se gastó, en qué y en qué período.',
	},
	{
		slug: 'compras-y-contrataciones',
		titulo: 'Compras y contrataciones',
		tituloCorto: 'Compras',
		descripcion: 'Licitaciones, concursos de precios y contrataciones directas, con sus adjudicaciones.',
	},
	{
		slug: 'transferencias-y-subsidios',
		titulo: 'Transferencias y subsidios',
		tituloCorto: 'Transferencias',
		descripcion: 'Transferencias de fondos, becas y subsidios otorgados, con su destino.',
	},
	{
		slug: 'autoridades-y-salarios',
		titulo: 'Autoridades y escalas salariales',
		tituloCorto: 'Autoridades',
		descripcion: 'Nómina de autoridades y escalas salariales vigentes del personal docente y no docente.',
	},
	{
		slug: 'convenios',
		titulo: 'Convenios',
		tituloCorto: 'Convenios',
		descripcion: 'Convenios firmados con organismos públicos, empresas e instituciones.',
	},
	{
		slug: 'auditorias',
		titulo: 'Informes de auditoría',
		tituloCorto: 'Auditoría',
		descripcion: 'Informes de la Unidad de Auditoría Interna (UAI), la SIGEN y la AGN.',
	},
	{
		slug: 'normativa',
		titulo: 'Normativa y resoluciones',
		tituloCorto: 'Normativa',
		descripcion: 'Resoluciones rectorales y del Consejo Superior vinculadas al manejo de fondos.',
	},
	{
		slug: 'acceso-a-la-informacion',
		titulo: 'Acceso a la información pública',
		tituloCorto: 'Cómo solicitar información',
		descripcion: 'Cómo pedir información que no esté publicada en este portal, según la Ley 27.275.',
	},
];
