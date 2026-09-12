# Portal de Transparencia UNLaR

Sitio estático con Astro 7 para https://transparencia.unlar.edu.ar. El plan, las decisiones y el cronograma están en [PLAN.md](PLAN.md). El contexto institucional está en `../CLAUDE.md`.

## Reglas del proyecto
- **Sitio 100% estático**: nada de SSR, APIs, formularios con backend ni login.
- **Sin recursos externos**: fuentes, imágenes y scripts se sirven desde el propio sitio. La CSP de Nginx (`deploy/nginx/`) bloquea todo lo demás.
- **Nunca commitear certificados ni claves** (`.key`, `.crt`, `.pem`, `.ca-bundle`).
- La identidad visual respeta la de www.unlar.edu.ar: ver [docs/identidad-visual.md](docs/identidad-visual.md).
- Accesibilidad: WCAG 2.x nivel AA como mínimo.
- Textos del sitio en español.

## Comandos
- `npm run dev`: servidor de desarrollo
- `npm run build`: genera `dist/`
- `npm run preview`: sirve `dist/` localmente
- `.\deploy\publicar.ps1 -Servidor deploy@<IP_VM>`: compila y publica en la VM (releases + symlink)
- `.\deploy\revertir.ps1 -Listar` / `.\deploy\revertir.ps1`: ver releases y volver a la anterior

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
