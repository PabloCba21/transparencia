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

export const accesoInformacion: DatosAccesoInformacion = {
	correo: null,
	lugarPresencial: null,
	horario: null,
	responsable: null,
	confirmacion: null,
	textosValidados: false,
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
