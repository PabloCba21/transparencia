/**
 * Qué links se abren en una pestaña nueva.
 *
 * Decisión del proyecto (24/11/2026): SOLO los PDFs y los links externos
 * (otros sistemas o sitios). La navegación interna se abre en la misma pestaña
 * para no romper el botón "Atrás" ni llenar el navegador de pestañas.
 *
 * Sin dependencias de Astro: lo usan los componentes (en el build) y el
 * buscador (en el navegador, src/scripts/buscador.ts).
 */

/** Dominio del portal: todo lo que no esté acá se considera externo */
export const DOMINIO_PORTAL = "transparencia.unlar.edu.ar";

/**
 * Texto que se agrega dentro del link, solo para lectores de pantalla, cuando se
 * abre en otra pestaña. WCAG técnica G201: avisar antes de cambiar de contexto.
 */
export const AVISO_PESTANA_NUEVA = "(se abre en una pestaña nueva)";

/**
 * Atributos para un link que se abre en otra pestaña.
 * `noopener`: la página nueva no puede tocar esta vía window.opener.
 * `noreferrer`: no le avisa al otro sitio desde qué página se llegó.
 */
export const ATRIBUTOS_PESTANA_NUEVA = {
  target: "_blank",
  rel: "noopener noreferrer",
} as const;

/**
 * ¿Este href se abre en una pestaña nueva?
 *
 * Ejemplos de lo que llega: "/presupuesto/", "/documentos/presupuesto/2026/x.pdf",
 * "#contenido", "mailto:mesa@unlar.edu.ar", "https://www.unlar.edu.ar/",
 * "https://transparencia.unlar.edu.ar/buscar/".
 */
export function abreEnPestanaNueva(href: string): boolean {
  // `const` = variable `final` de Java. El tipo (URL) lo infiere TS solo.
  // La base hace que "/presupuesto/" se lea como https://transparencia.unlar.edu.ar/presupuesto/
  const url = new URL(href, `https://${DOMINIO_PORTAL}`);

  // mailto:, tel:, etc. no son páginas: nunca abren pestaña
  if (url.protocol !== "https:" && url.protocol !== "http:") return false;

  const esPdf = url.pathname.toLowerCase().endsWith(".pdf");
  const esExterno = url.hostname.toLowerCase() !== DOMINIO_PORTAL;

  return esPdf || esExterno;
}
