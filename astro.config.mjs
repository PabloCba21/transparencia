// @ts-check
import { defineConfig, fontProviders } from 'astro/config';
import buscador from './src/integrations/buscador';

// Las fuentes viven en este repositorio (src/assets/fonts/), no se descargan de
// ningún CDN. Dos motivos:
//   1. El build funciona sin internet: si la red falla, igual se puede publicar.
//   2. La CSP de Nginx (`font-src 'self'`) exige servirlas desde el propio sitio.
// Astro las copia a /_astro/ con un hash en el nombre, así se pueden cachear para
// siempre. Solo se incluye el subconjunto "latin", que alcanza para el español:
// si aparece un glifo que no está, el navegador usa la fuente de respaldo.
const fuenteLocal = fontProviders.local();

// https://astro.build/config
export default defineConfig({
	site: 'https://transparencia.unlar.edu.ar',
	// Índice de búsqueda generado al final del build (ver src/integrations/buscador.ts)
	integrations: [buscador()],
	fonts: [
		{
			provider: fuenteLocal,
			name: 'Open Sans',
			cssVariable: '--fuente-texto',
			fallbacks: ['system-ui', 'sans-serif'],
			// `options` son los ajustes propios del proveedor elegido
			options: {
				variants: [
					{
						src: ['./src/assets/fonts/open-sans-latin-wght-normal.woff2'],
						// Es una fuente variable: un solo archivo cubre todo el rango de
						// pesos, y el navegador interpola el que se le pida.
						weight: '300 800',
						style: 'normal',
					},
				],
			},
		},
		{
			provider: fuenteLocal,
			name: 'Dosis',
			// La usan los h1, h2 y h3 (ver src/styles/global.css)
			cssVariable: '--fuente-titulos',
			fallbacks: ['system-ui', 'sans-serif'],
			options: {
				variants: [
					{
						src: ['./src/assets/fonts/dosis-latin-wght-normal.woff2'],
						// Rango real del archivo, no solo los pesos que usamos hoy: si
						// mañana el CSS pide otro, el navegador lo interpola de verdad
						// en lugar de simularlo engordando los trazos.
						weight: '200 800',
						style: 'normal',
					},
				],
			},
		},
	],
});
