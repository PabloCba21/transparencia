/**
 * Datos de la vía para solicitar información pública (Ley 27.275).
 *
 * Los entrega y valida la Secretaría Legal y Técnica: no completarlos con
 * suposiciones. Mientras un dato valga `null` (o `false`), la página lo muestra
 * resaltado como pendiente y `npm run build` falla, salvo que se compile con
 * PERMITIR_PENDIENTES=1 (solo para revisión en staging).
 * Guía: docs/acceso-a-la-informacion.md
 */

export interface DatosAccesoInformacion {
	/** Correo que recibe las solicitudes. Ej.: 'accesoinformacion@unlar.edu.ar' */
	correo: string | null;
	/** Oficina y dirección para presentarla en persona */
	lugarPresencial: string | null;
	/** Días y horario de atención de ese lugar */
	horario: string | null;
	/** Nombre y cargo de quien fue designado responsable (art. 30) */
	responsable: string | null;
	/** Qué recibe la persona cuando presenta la solicitud (por ejemplo, un número de expediente) */
	confirmacion: string | null;
	/** Legal y Técnica aprobó los textos legales de la página (datos clave y consentimiento) */
	textosValidados: boolean;
}

// Datos entregados por Legal y Técnica el 15/09/2026
export const accesoInformacion: DatosAccesoInformacion = {
	correo: 'transparencia@unlar.edu.ar',
	lugarPresencial:
		'Mesa de Entradas y Salidas, Edificio Rectorado, planta baja. Ciudad Universitaria de la Ciencia y la Técnica, Luis M. de La Fuente S/N.',
	horario: 'lunes a viernes de 08:00 a 13:00 y de 15:00 a 20:00',
	responsable: 'Abog. Facundo Ruiz de Los Llanos',
	confirmacion:
		'Si la presentás en persona, recibís un número de expediente. Si la enviás por correo electrónico, recibís un número de trámite interno.',
	textosValidados: true,
};

/** Lista legible de lo que falta, para el aviso de la página y el error del build. */
export function datosPendientes(datos = accesoInformacion): string[] {
	const pendientes: string[] = [];
	if (!datos.correo) pendientes.push('correo que recibe las solicitudes');
	if (!datos.lugarPresencial) pendientes.push('oficina y dirección para presentarla en persona');
	if (!datos.horario) pendientes.push('horario de atención');
	if (!datos.responsable) pendientes.push('responsable de acceso a la información (art. 30)');
	if (!datos.confirmacion) pendientes.push('qué recibe la persona al presentar la solicitud');
	if (!datos.textosValidados) pendientes.push('validación de los textos legales');
	return pendientes;
}
