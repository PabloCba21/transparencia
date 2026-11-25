# Portal de Transparencia UNLaR

Sitio estático con Astro 7 para https://transparencia.unlar.edu.ar, **en producción desde el 16/09/2026**. El plan y las decisiones de la v1 están en [PLAN.md](PLAN.md); los de la v2 en curso, en [PLAN-v2.md](PLAN-v2.md). El contexto institucional está en `../CLAUDE.md`.

**v2 (en curso):** sigue estático — se suman buscador y filtros (Pagefind, índice generado en el build) y más secciones según el Índice de Transparencia Activa de la AAIP. Se descartó a propósito la base de datos: solo la SSI carga contenido.

## Reglas del proyecto
- **Sitio 100% estático**: nada de SSR, APIs, formularios con backend ni login. Vale también para la v2: el buscador se resuelve con un índice generado en el build, no con un servidor.
- **Sin recursos externos**: fuentes, imágenes y scripts se sirven desde el propio sitio. La CSP de Nginx (`deploy/nginx/`) bloquea todo lo demás.
- **Nunca commitear certificados ni claves** (`.key`, `.crt`, `.pem`, `.ca-bundle`).
- La identidad visual respeta la de www.unlar.edu.ar: ver [docs/identidad-visual.md](docs/identidad-visual.md).
- Accesibilidad: WCAG 2.x nivel AA como mínimo.
- **Pestaña nueva solo para PDFs y links externos** (otros sistemas o sitios). La navegación interna (menú, secciones, migas, logo, buscador) se abre en la misma pestaña. La regla vive en `src/lib/enlaces.ts`: para links con destino variable usar `src/components/Enlace.astro`, que agrega `target`/`rel` y el aviso para lectores de pantalla (WCAG G201); el ícono lo pone el CSS. Decidido por Pablo el 24/11/2026.
- Textos del sitio en español.

## Comandos
- `npm run dev`: servidor de desarrollo
- `npm run build`: genera `dist/`
- `npm run preview`: sirve `dist/` localmente
- `.\deploy\publicar.ps1 -Servidor deploy@<IP_VM>`: compila y publica en la VM (releases + symlink)
- `.\deploy\revertir.ps1 -Listar` / `.\deploy\revertir.ps1`: ver releases y volver a la anterior

## Contenido
- Documentos por sección en `src/content/documentos/<slug>.yaml`, validados por `src/content.config.ts`. Los PDFs van en `public/documentos/<slug>/<año>/`.
- Guía para el equipo: [docs/cargar-documentos.md](docs/cargar-documentos.md).
- Acceso a la información: página propia con formulario sin backend (arma la solicitud en el navegador). Sus datos institucionales están en `src/data/acceso-informacion.ts`; el build falla si falta alguno, salvo con `PERMITIR_PENDIENTES=1`. Ver [docs/acceso-a-la-informacion.md](docs/acceso-a-la-informacion.md).
- Nunca inventar contenido institucional (documentos, contactos, procedimientos): lo entregan las áreas y lo valida Legal y Técnica. Para pruebas, usar ejemplos marcados como tales y no commitearlos.

## Development

When starting the dev server, use background mode:

```
astro dev --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and `astro dev logs`.

## Documentation

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)
