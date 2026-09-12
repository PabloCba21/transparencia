# Identidad visual (relevada de www.unlar.edu.ar el 11/09/2026)

El sitio principal usa **Joomla** con el tema **RocketTheme Photon** (Gantry 5). Los valores salen de su CSS compilado (`photon_30.css`).

## Colores

| Uso en el sitio | Hex | Contraste sobre blanco |
|---|---|---|
| Primario (barra superior, links) | `#1e5b96` | 7.0:1 ✅ AAA |
| Acento | `#bd1e52` | 6.0:1 ✅ AA |
| Bordó oscuro | `#260b17` | (fondo, con texto blanco encima) |
| Navegación oscura | `#343434` | — |
| Texto general | `#686868` | 5.6:1 ✅ AA |
| Grises de fondo y bordes | `#ebebeb`, `#e6e6e6`, `#d9d9d9` | — |

> Umbral WCAG AA para texto normal: 4.5:1.

**Corrección al relevamiento (11/09/2026):** el `#260b17` no es el footer de www.unlar.edu.ar, es el fondo del menú lateral en celular. El footer del sitio oficial es azul y solo muestra el copyright. En nuestro portal el bordó se usa igual como fondo del pie, según el layout aprobado: blanco sobre `#260b17` da ~17:1 de contraste.

**Texto del cuerpo:** para párrafos largos usamos `#4d4d4d` (8.6:1) en lugar del `#686868` institucional, que queda para texto secundario. Los dos pasan AA; el más oscuro se lee mejor en textos extensos.

## Tipografías

- **Open Sans**: texto general.
- **Dosis**: títulos.

Ambas tienen licencia libre (OFL). **Se sirven desde el propio servidor**, no desde Google Fonts, por tres motivos: la CSP estricta, la privacidad de quienes visitan el sitio y no depender de un tercero.

## Logo

- La web usa el **logo de línea simplificado** (azul + gris "UNLaR"). Copia en `public/img/logo-unlar.png`.
- En `SSI/Img institucional/Identidad Institucional.png` está la versión con el **escudo tradicional**.
- ✅ **Decisión (11/09/2026, Pablo):** se usa el **logo de línea**, por coherencia con www.unlar.edu.ar.
- ✅ **Decisión (11/09/2026, Pablo):** el logo va **sobre franja blanca**, con la barra azul del menú debajo. El logo es azul `#1e5b96` + gris: sobre la barra azul el isotipo desaparecería. Es además la solución del sitio oficial. Se descartó teñir el logo de blanco para no alterar la marca sin aval de Comunicación.
