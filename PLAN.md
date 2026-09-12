# Plan — Portal de Transparencia UNLaR

- **Dominio:** https://transparencia.unlar.edu.ar
- **Solicitante:** Secretaría Legal y Técnica
- **Responsable técnico:** Subsecretaría de Informática (SSI)
- **Salida a producción:** miércoles 16/09/2026, al menos con información básica

## Decisiones tomadas

| Tema | Decisión | Por qué |
|---|---|---|
| Tipo de sitio | Estático (HTML pre-generado) | Sin base de datos ni login: mínima superficie de ataque y casi nada de mantenimiento |
| Generador | Astro 7 | HTML puro, contenido validado por esquema, JS/TS moderno |
| Quién actualiza | Equipo SSI | Las áreas entregan el contenido y la SSI lo publica |
| Hosting | VM Proxmox, Ubuntu 26.04, Nginx, en la DMZ | Infraestructura propia, costo cero |
| TLS | Wildcard institucional `*.unlar.edu.ar` (Sectigo) | Ya cubre el subdominio. **Vence el 22/10/2026** |
| Repositorio | Git local (después, GitHub) | — |
| Identidad visual | La de www.unlar.edu.ar | Ver [docs/identidad-visual.md](docs/identidad-visual.md) |

## Layout institucional (aprobado 11/09/2026) — ✅ implementado

1. **`src/layouts/Base.astro`:** franja blanca con el logo de línea y "Portal de Transparencia", debajo la barra azul `#1e5b96` con el menú de secciones, y footer bordó `#260b17` con los datos institucionales.
   > Cambio sobre lo aprobado: el logo no podía ir sobre la barra azul porque es azul `#1e5b96` + gris y desaparecía. Va sobre blanco, igual que en www.unlar.edu.ar ([detalle](docs/identidad-visual.md)).
2. **Tipografías** Open Sans (texto) y Dosis (títulos) servidas desde el sitio. Colores como variables CSS en un único lugar.
3. **Home:** una introducción breve y una grilla de 9 tarjetas, una por sección. Motivo UX: la gente llega con una pregunta concreta y necesita ver las puertas de entrada de un vistazo.
4. **Una página por sección**, con la leyenda "Información en proceso de actualización" + fecha mientras no haya contenido.
5. **Accesibilidad:** `lang="es"`, link "Saltar al contenido", foco visible y contraste AA.

## Arquitectura

```
PC de desarrollo                               VM Ubuntu 26.04 (DMZ)
Astro + contenido ── npm run build ──► dist/ ── ssh ──► Nginx ──► https://transparencia.unlar.edu.ar
```

## Secciones (a validar con Legal y Técnica)

Referencia: Ley 27.275, art. 32 (transparencia activa).

1. Presupuesto asignado
2. Ejecución presupuestaria
3. Compras y contrataciones
4. Transferencias y subsidios
5. Autoridades y escalas salariales
6. Convenios
7. Informes de auditoría (UAI, SIGEN, AGN)
8. Normativa y resoluciones
9. Acceso a la información pública (cómo solicitarla)

Una sección sin contenido se publica igual con la leyenda *"Información en proceso de actualización"* y la fecha.

## Cronograma

| Día | Infraestructura (equipo SSI) | Sitio |
|---|---|---|
| **Vie 11** | Crear la VM y hacer el hardening base ([checklist](docs/checklist-vm.md), pasos 1–5) | ✅ Proyecto, git, plan, relevamiento de identidad · ✅ Layout institucional, home y 9 páginas de sección |
| **Lun 14** | Nginx y certificado (pasos 6–9) | Páginas de las 9 secciones y esquema de documentos; cargar el contenido recibido |
| **Mar 15** | Deploy de staging por IP interna (paso 10) | **Revisión con Legal y Técnica**; pruebas en celular y accesibilidad |
| **Mié 16** | DNS público → producción (paso 11) | Verificación final: SSL Labs, headers, links, PDFs |

## Riesgos

| Riesgo | Mitigación |
|---|---|
| El contenido no llega a tiempo | Salir con la estructura completa y leyenda de "en actualización" |
| El certificado vence el 22/10 | Seguir la renovación ya presupuestada; instalar el nuevo en la VM |
| La revisión de Legal y Técnica pide cambios grandes | Mostrarles avances desde el lunes, no recién el martes |

## Fase 2 (después del 16/09)

- Buscador y filtros por año y sección.
- Script en **Python** que convierta planillas Excel a tablas publicables.
- Script de deploy con releases y rollback.
- Subir el repo a GitHub y automatizar el build (CI).
