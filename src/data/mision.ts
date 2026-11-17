/**
 * Misión y fines permanentes de la UNLaR.
 *
 * Texto institucional: se transcribe tal como figura en la norma, sin reescribirlo.
 * Si cambia el Estatuto o el Plan Estratégico, se actualiza acá y se cita la norma
 * nueva en `fuente`.
 *
 * Origen: Recursos/02. Misión y objetivos.docx (Secretaría Legal y Técnica).
 */

export interface BloqueMision {
	/** Título de la subsección */
	titulo: string;
	/** Párrafos introductorios */
	parrafos: string[];
	/** Ítems enumerados, si el bloque los tiene */
	items?: string[];
	/** Norma de la que surge el texto, citada al pie del bloque */
	fuente: string;
}

export const mision: BloqueMision[] = [
	{
		titulo: 'Misión',
		parrafos: [
			'La Universidad Nacional de La Rioja tiene por misión formar profesionales con pensamiento crítico, compromiso ético y sentido social, generando y transfiriendo conocimientos científicos, tecnológicos, humanísticos y artísticos que contribuyan al desarrollo sostenible, equitativo y soberano de la provincia, la región y el país.',
			'En ejercicio de su autonomía y cogobierno, garantiza el derecho a la educación superior pública, gratuita y de calidad; promueve la democratización del conocimiento y la inclusión educativa; y articula docencia, investigación, extensión y vinculación en respuesta a las necesidades de la sociedad y del territorio riojano.',
		],
		fuente: 'Ord. CS 290/2026 — Plan Estratégico Institucional 2026-2030',
	},
	{
		titulo: 'Fines',
		parrafos: ['Son fines permanentes de la Universidad Nacional de La Rioja:'],
		items: [
			'Construir, promover, desarrollar y difundir la cultura, el arte, la ciencia y la innovación tecnológica como un bien público social orientado de acuerdo con las necesidades locales, regionales, nacionales e internacionales, extendiendo su acción al pueblo.',
			'Reivindicar el carácter humanista de la educación superior, orientada a la formación integral de personas, ciudadanos y profesionales capaces de abordar con responsabilidad ética, social y ambiental los múltiples retos implicados en el desarrollo y la integración de las comunidades.',
			'Educar en el respeto y la defensa de los derechos humanos, de la diversidad cultural, de las libertades democráticas, de la soberanía e independencia de la nación, contribuyendo a la confraternidad humana y a la paz entre los pueblos, con perspectiva regional, y propendiendo a que sus conocimientos sean puestos al servicio de éstos para el mejoramiento de su calidad de vida.',
			'Desarrollar la enseñanza superior con carácter científico, tecnológico, humanístico y cultural para la formación de profesionales capaces y conscientes de su responsabilidad de contribuir en favor de la inclusión social, la reducción de las desigualdades y la búsqueda de la equidad.',
			'Favorecer el desarrollo de los valores primordiales como la realización de la persona en libertad, el respeto a la diversidad ideológica, cultural, de credos y religiones, el pluralismo político, la participación solidaria, el comportamiento ético, la transparencia con justicia y equidad.',
			'Mantener la apertura a toda expresión del saber y a toda corriente cultural e ideológica, favoreciendo el desarrollo de la cultura en la diversidad y contribuyendo al conocimiento recíproco de los pueblos.',
			'Construir un modelo educativo integrador, innovador e inclusivo que contribuya a la definición, comprensión, estudio y resolución de las problemáticas sociales; regionales, nacionales y universales, y que se oriente al desarrollo de un modelo superador de sociedad implementando diferentes modalidades educativas.',
			'Fomentar la enseñanza de la ética profesional, proclamar y garantizar la más amplia libertad de juicio y criterios, doctrinas y orientaciones filosóficas en el desarrollo de la cátedra universitaria en todas sus formas.',
			'Propiciar la enseñanza, con fines de experimentación, de innovación pedagógica y de práctica profesional docente desde los niveles preuniversitarios.',
			'Promover el ejercicio de una ciudadanía crítica, con conciencia social y responsabilidad ética fundada en valores de solidaridad, pluralismo, autonomía intelectual y firme defensa de los derechos humanos y de las formas democráticas de gobierno.',
			'Estudiar e intervenir en los esfuerzos que hace la comunidad para evitar la discriminación en cualquiera de sus formas y acciones que deterioren el ambiente y todo aquello que afecte la calidad de vida de los seres humanos.',
			'Preservar las tradiciones y el acervo histórico de las regiones y de los pueblos.',
			'Propender a la interacción entre las disciplinas, los centros productores de conocimiento, las instituciones y los actores sociales mediante la convocatoria multisectorial.',
			'Fortalecer los espacios públicos adecuados para la apropiación social del conocimiento en todas sus manifestaciones.',
			'Propiciar la proyección internacional de la Universidad en el marco de una integración global solidaria.',
			'Propender desde todos los espacios académicos, de investigación y de vinculación territorial a la defensa de los recursos naturales y a la protección del ambiente.',
			'Garantizar la enseñanza gratuita de grado y pregrado de todos aquellos que aspiren a ella.',
			'Aportar desde el ámbito universitario, estrategias de desarrollo local, territorial y económico-social de la provincia en toda su extensión, especialmente en los pueblos y generar condiciones que garanticen el desarrollo integral del territorio provincial.',
			'Promover la valoración de la multiculturalidad a partir de propuestas de enseñanzas inclusivas que atiendan a las personas de diferentes culturas y contextos.',
			'Desarrollar estrategias sistemáticas de evaluación de la educación superior en la Universidad Nacional de la Rioja a los efectos de generar propuestas de mejora en la calidad integral de la enseñanza.',
			'Promover la inclusión de personas con discapacidad, con los apoyos que se requieran para su formación integral, continua y permanente.',
		],
		fuente: 'Estatuto — Res. Asamblea Universitaria UNLaR N° 033/2026',
	},
];
