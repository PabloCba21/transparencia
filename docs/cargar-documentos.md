# Cómo cargar documentos en el portal

Guía para el equipo de la SSI. No hace falta saber programar: se copia un PDF y se completan unas líneas de texto.

## Antes de publicar: revisar el PDF

- [ ] **Lo validó Legal y Técnica.** Nada se publica sin su visto bueno.
- [ ] **No tiene datos personales que no correspondan** (DNI, CUIL, domicilios, datos de salud). Ante la duda, consultar a Legal y Técnica (Ley 25.326).
- [ ] **No es un escaneo.** Un PDF escaneado es una foto: un lector de pantalla no lo puede leer y no se puede buscar texto. Pedirle al área el PDF generado desde el original (Word, Excel o el sistema de expedientes).
- [ ] **Pesa menos de 10 MB.** Si pesa más, pedir una versión optimizada.

## 1. Nombrar y ubicar el archivo

Carpeta: `public/documentos/<sección>/<año del documento>/`

| Sección | Carpeta |
|---|---|
| Presupuesto asignado | `presupuesto` |
| Ejecución presupuestaria | `ejecucion-presupuestaria` |
| Compras y contrataciones | `compras-y-contrataciones` |
| Transferencias y subsidios | `transferencias-y-subsidios` |
| Autoridades y escalas salariales | `autoridades-y-salarios` |
| Convenios | `convenios` |
| Informes de auditoría | `auditorias` |
| Normativa y resoluciones | `normativa` |
| Acceso a la información pública | `acceso-a-la-informacion` |

Nombre del archivo: **minúsculas, números y guiones**. Sin espacios, tildes, ñ ni mayúsculas, que rompen las direcciones web.

| ❌ Mal | ✅ Bien |
|---|---|
| `Resolución 123-2026 (final).pdf` | `resolucion-123-2026.pdf` |

Ejemplo completo: `public/documentos/presupuesto/2026/resolucion-123-2026.pdf`

## 2. Agregarlo a la lista de la sección

Abrir `src/content/documentos/<sección>.yaml`. Si la lista está vacía (`documentos: []`), reemplazar esa línea por:

```yaml
documentos:
  - titulo: Resolución 123/2026 — Distribución del presupuesto por finalidad
    fecha: 2026-03-15
    publicado: 2026-09-16
    tipo: Resolución
    archivo: 2026/resolucion-123-2026.pdf
    expediente: 00-01234-2026
    descripcion: Distribución del crédito asignado por la Ley de Presupuesto 2026.
```

Si ya hay documentos, agregar otro bloque que empiece con `  - titulo:` debajo de los existentes. **La sangría importa**: dos espacios antes del guion y cuatro antes de cada campo, igual que en el ejemplo. El orden en el archivo no importa: el sitio los ordena por fecha.

| Campo | Qué poner | Obligatorio |
|---|---|---|
| `titulo` | Cómo se va a mostrar. Claro para cualquier persona, no solo para quien conoce el expediente. | Sí |
| `fecha` | La fecha **que figura en el documento**, en formato `AAAA-MM-DD` | Sí |
| `publicado` | La fecha **de carga en el portal**, en formato `AAAA-MM-DD` | Sí |
| `tipo` | Uno de: `Resolución`, `Ordenanza`, `Disposición`, `Informe`, `Convenio`, `Contrato`, `Acta`, `Otro` (con mayúscula y tilde) | Sí |
| `archivo` | La ruta desde la carpeta de la sección: `año/nombre.pdf`. El año tiene que coincidir con el de `fecha`. | Sí |
| `expediente` | Número de expediente | No |
| `descripcion` | Una línea que explique el contenido | No |

Si **no hay documentos nuevos** pero se consultó al área, actualizar igual `revisado:` con la fecha de hoy. Así la página muestra que la sección se revisó.

## 3. Verificar

```powershell
npm run build
```

Si algo está mal, **el build falla y dice qué corregir**. No se puede publicar un error.

| El mensaje dice | Qué pasó |
|---|---|
| `el archivo tiene que ser AAAA/nombre-en-minusculas.pdf` | El nombre tiene espacios, tildes o mayúsculas |
| `apunta a un archivo que no existe` | El PDF no está en la carpeta, o el nombre no coincide exactamente |
| `la fecha tiene que tener el formato AAAA-MM-DD` | Se escribió `15/03/2026` en lugar de `2026-03-15` |
| `la carpeta del archivo tiene que ser el año de la fecha` | El documento es de 2025 pero se guardó en la carpeta `2026` |
| `el tipo tiene que ser uno de: ...` | El tipo está mal escrito (por ejemplo, `resolucion` sin tilde) |
| `no corresponden a ninguna sección` | Se creó un `.yaml` con un nombre que no existe (por ejemplo, `convenio.yaml`) |
| `Missing` o `Expected` cerca de una línea del `.yaml` | Casi siempre, la sangría: revisar los espacios |

Para verlo en el navegador antes de publicar: `npm run dev` y abrir http://localhost:4321.

## 4. Guardar y publicar

```powershell
git add public/documentos src/content/documentos
git commit -m "Publica <qué documento> en <sección>"
.\deploy\publicar.ps1 -Servidor transparencia
```

Si después de publicar algo se ve mal: `.\deploy\revertir.ps1 -Servidor transparencia` vuelve a la versión anterior en un segundo.

## Corregir o quitar un documento ya publicado

En un portal de transparencia, **un documento publicado no se borra en silencio**. Si hay que reemplazarlo (por ejemplo, una versión corregida), consultarlo con Legal y Técnica: lo habitual es publicar la versión nueva y aclarar en `descripcion` qué reemplaza.
