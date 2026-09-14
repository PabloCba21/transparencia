/**
 * Formatea una fecha AAAA-MM-DD como "11 de septiembre de 2026".
 *
 * El mediodía fijo evita el clásico problema de zona horaria: `new Date('2026-09-11')`
 * se interpreta como UTC medianoche y en Argentina (UTC-3) mostraría el día anterior.
 */
export function formatearFecha(iso: string): string {
	return new Date(`${iso}T12:00:00`).toLocaleDateString('es-AR', {
		day: 'numeric',
		month: 'long',
		year: 'numeric',
	});
}

/** Formatea una fecha AAAA-MM-DD como "11/09/2026". */
export function formatearFechaCorta(iso: string): string {
	const [anio, mes, dia] = iso.split('-');
	return `${dia}/${mes}/${anio}`;
}
