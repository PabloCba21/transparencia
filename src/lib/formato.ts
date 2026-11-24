/**
 * Formateos sin dependencias de Astro. Se pueden importar desde cualquier lado:
 * páginas, el navegador o la configuración del build (src/lib/busqueda.ts).
 */

/** 1234567 → "1,2 MB" · 85000 → "83 KB" */
export function formatearTamano(bytes: number): string {
	const formato = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 1 });
	if (bytes >= 1024 * 1024) return `${formato.format(bytes / (1024 * 1024))} MB`;
	return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}
