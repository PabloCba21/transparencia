/**
 * Nómina de autoridades de la UNLaR.
 *
 * Fuente: documento entregado por Secretaría General (16/09/2026).
 * Actualizar acá cuando cambie una designación: la página se regenera sola.
 * Las fotos están en src/assets/autoridades/ y se importan en la página.
 *
 * `actualizado` es la fecha en que se verificó esta nómina y se muestra al pie.
 */

export interface Autoridad {
	cargo: string;
	nombre: string;
}

export const actualizado = '2026-09-16';

export const rectora: Autoridad = {
	cargo: 'Rectora',
	nombre: 'Dra. Natalia Álbarez Gómez',
};

export const vicerrector: Autoridad = {
	cargo: 'Vicerrector',
	nombre: 'Ing. Luis Oscar Oviedo',
};

export const secretarias: Autoridad[] = [
	{ cargo: 'Secretaría General', nombre: 'Mart. Corr. Carlos Mediavilla' },
	{ cargo: 'Secretaría de Asuntos Académicos', nombre: 'Arq. Andrés Vera' },
	{ cargo: 'Secretaría de Relaciones Institucionales', nombre: 'Isaías Díaz' },
	{ cargo: 'Secretaría de Asuntos Nodocentes', nombre: 'Arq. Leonardo Forneris' },
	{ cargo: 'Secretaría de Extensión', nombre: 'Lic. Irma Núñez' },
	{ cargo: 'Secretaría de Asuntos Estudiantiles', nombre: 'Abril Díaz' },
	{ cargo: 'Secretaría de Ciencia y Tecnología', nombre: 'Ing. Astrid Mercado' },
	{ cargo: 'Secretaría de Posgrado y Graduados', nombre: 'Dra. Silvina Schab' },
	{ cargo: 'Secretaría Administrativa Financiera', nombre: 'Cr. Daniel Peralta' },
	{ cargo: 'Secretaría Legal y Técnica', nombre: 'Ab. Esp. Estelly Mary Díaz Fernández' },
	{ cargo: 'Secretaría de Relatoría Técnica del Consejo Superior', nombre: 'Dr. José Nicolás Azcurra' },
	{ cargo: 'Secretaría de Planificación y Autoevaluación', nombre: 'Lic. Nieves Llorente' },
];
