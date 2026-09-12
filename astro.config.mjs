// @ts-check
import { defineConfig, fontProviders } from 'astro/config';

// Las fuentes salen de los paquetes @fontsource-variable instalados en node_modules
// (remote: false = nunca se consulta un CDN, ni en el build ni en producción).
// Astro las copia a /_astro/ con hash, así la CSP `font-src 'self'` se cumple sola.
const fuenteLocal = fontProviders.npm({ remote: false });

// https://astro.build/config
export default defineConfig({
	site: 'https://transparencia.unlar.edu.ar',
	fonts: [
		{
			provider: fuenteLocal,
			// "Variable" es como se llama la familia dentro del paquete @fontsource-variable
			name: 'Open Sans Variable',
			cssVariable: '--fuente-texto',
			weights: ['400 700'],
			subsets: ['latin'],
			fallbacks: ['system-ui', 'sans-serif'],
		},
		{
			provider: fuenteLocal,
			name: 'Dosis Variable',
			cssVariable: '--fuente-titulos',
			weights: ['500 700'],
			subsets: ['latin'],
			fallbacks: ['system-ui', 'sans-serif'],
		},
	],
});
