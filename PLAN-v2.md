# Plan v2 — Portal de Transparencia UNLaR

Continuación de [PLAN.md](PLAN.md), que cubre hasta la salida a producción del 16/09/2026.

**Estado al 24/11/2026:** portal en producción, 11 secciones, contenido cargándose a medida que las áreas lo entregan.

---

## Decisiones de la v2

| Tema | Decisión | Por qué |
|---|---|---|
| Tipo de sitio | **Sigue estático.** Sin base de datos, sin login, sin panel de administración | Solo Pablo carga la información. Un backend sumaría superficie de ataque en la DMZ, backups, parches y capacitaciones, sin resolver ningún problema real |
| Quién carga | Solo la SSI, con el flujo actual (editar YAML → commit → publicar) | Abrir la carga a las áreas obligaría a capacitar y a sostener perfiles de usuario |
| Novedad principal | **Buscador y filtros** por año, sección y tipo de documento | Con cientos de documentos, la grilla de secciones deja de alcanzar |
| Segunda novedad | **Ampliar el catálogo de secciones** según el Índice de Transparencia Activa de la AAIP | Es la grilla con la que la Agencia puntúa a los organismos |

> **Qué significaba "dinámica":** mostrar más datos y poder buscarlos y filtrarlos. Eso **no** requiere base de datos. Solo la haría falta si la carga tuviera que hacerse por pantalla, y esa posibilidad quedó descartada a propósito.

## Relevamiento: Portal de Transparencia de la UNQ

Referencia aportada por Pablo: <https://transparencia.unq.edu.ar/> (WordPress 6.6.1).

**Qué no tiene:** ni buscador ni filtros. La home es una grilla de tarjetas y cada sección es una página con enlaces — el mismo patrón que ya tiene el portal de la UNLaR. No hay nada que copiar en materia de interfaz.

**Qué sí vale copiar:**

1. **El catálogo de secciones.** Tienen 22 contra nuestras 11, alineadas al Índice de Transparencia Activa de la AAIP.
2. **Enlazar en vez de alojar.** En Presupuesto enlazan a *Presupuesto Abierto* y a la Oficina Nacional de Presupuesto en lugar de mantener planillas propias. Cumplen el requisito sin trabajo de mantenimiento y sin quedar desactualizados. Para un equipo chico es la estrategia correcta.

## Secciones a sumar (a validar con Legal y Técnica)

Actuales (11): misión institucional · presupuesto · ejecución presupuestaria · compras y contrataciones · transferencias y subsidios · autoridades y salarios · convenios · auditorías · normativa · indicadores académicos · acceso a la información.

| Nueva sección | Observación |
|---|---|
| Declaraciones juradas | Obligatoria por Ley 25.188. Pesa mucho en el índice de la AAIP |
| Obsequios y viajes | Obligatoria |
| Participación ciudadana | |
| Catálogo de datos abiertos | El art. 32 pide formatos reutilizables |
| Permisos y concesiones | |
| Política de integridad | |
| Metas y dotación óptima | |
| Gestión de la información | |

La lista sale del relevamiento de la UNQ y hay que contrastarla con el Índice de Transparencia Activa vigente antes de implementarla. **No inventar contenido:** lo entregan las áreas y lo valida Legal y Técnica.

## Buscador: cómo, sin base de datos

**Pagefind.** Indexa el HTML ya generado al final del build y produce un índice estático que el navegador descarga por partes, a medida que se escribe.

- No necesita servidor ni base de datos: son archivos más en `dist/`.
- Se sirve desde el propio sitio, así que cumple la CSP actual (`script-src 'self'`).
- Escala a miles de documentos sin cambiar la infraestructura.

Los filtros por **año, sección y tipo de documento** salen de los metadatos que ya existen en `src/content/documentos/<slug>.yaml`, validados por `src/content.config.ts`. El esquema de documentos ya resolvió la parte difícil.

> **Por qué el índice se arma en el build:** es el mismo principio del sitio estático. El trabajo pesado se hace una vez al compilar y el servidor solo entrega archivos. Un buscador con base de datos repetiría ese trabajo en cada consulta para devolver exactamente el mismo resultado.

## Orden de trabajo propuesto

1. Validar con Legal y Técnica el catálogo de secciones nuevas.
2. Sumar las secciones al `src/data/secciones.ts` y su YAML, con la leyenda de "en actualización" mientras no haya contenido.
3. Integrar Pagefind al build y agregar la página de búsqueda.
4. Filtros por año, sección y tipo.
5. Revisar accesibilidad del buscador (navegación por teclado, anuncio de resultados a lectores de pantalla).
6. Verificar que la CSP siga cubriendo todo y publicar.

## Certificado TLS

Renovado e instalado en octubre de 2026. Verificado en producción el 24/11/2026:

| | |
|---|---|
| Emitido | 21/10/2026 |
| **Vence** | **07/05/2027** |
| Cobertura | `unlar.edu.ar` + `*.unlar.edu.ar` (Sectigo) |

```bash
# Verificar contra el servidor en cualquier momento
openssl s_client -connect transparencia.unlar.edu.ar:443 -servername transparencia.unlar.edu.ar </dev/null 2>/dev/null | openssl x509 -noout -dates
```

> ⚠️ **La vigencia se está acortando.** El certificado anterior duró 11 meses; este dura 6,5. El CA/Browser Forum viene reduciendo la vida máxima de los certificados y va a seguir haciéndolo. La renovación manual deja de ser anual y pasa a ser cada pocos meses, por servidor. Conviene evaluar **ACME** (renovación automática) para los subdominios institucionales antes de que el calendario se vuelva inmanejable.

## Pendientes de la v1 que siguen abiertos

- Contenido faltante en varias secciones, a cargo de las áreas.
