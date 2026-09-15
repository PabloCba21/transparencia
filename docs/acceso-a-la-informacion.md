# Página de acceso a la información pública

Página: `src/pages/acceso-a-la-informacion.astro` · Formulario: `src/components/FormularioSolicitud.astro`

## Cómo funciona el formulario

El sitio es estático, así que el formulario **no envía datos a ningún servidor** ni guarda nada. En el navegador de la persona:

1. Completa sus datos y lo que pide. El formulario valida los campos.
2. Se arma el texto de la solicitud, y la persona elige cómo presentarla:
   - **por correo**: se abre su programa de correo con el texto listo, o copia el texto y lo pega en un correo;
   - **en persona**: la imprime, la firma y la lleva.

La Universidad recibe la solicitud por el correo o por la vía presencial, igual que si la hubieran escrito a mano.

## Datos que entrega Legal y Técnica

Se cargan en un solo archivo: `src/data/acceso-informacion.ts`.

| Campo | Qué va | Ejemplo de formato |
|---|---|---|
| `correo` | Correo que recibe las solicitudes | `'accesoinformacion@unlar.edu.ar'` |
| `lugarPresencial` | Oficina y dirección | `'Mesa de Entradas, edificio ..., Av. ...'` |
| `horario` | Días y horario de atención | `'Lunes a viernes de 8 a 13'` |
| `responsable` | Nombre y cargo del responsable designado (art. 30, Ley 27.275) | `'Nombre Apellido, cargo'` |
| `confirmacion` | Qué recibe la persona al presentar la solicitud | `'Te enviamos por correo el número de expediente.'` |
| `textosValidados` | `true` cuando Legal y Técnica aprobó los textos legales de la página | `true` |

Los valores de texto van entre comillas simples. Mientras un dato valga `null`, la página lo muestra resaltado en amarillo como **Pendiente**.

## Build con datos pendientes

`npm run build` **falla** si queda algún dato pendiente, para que nunca se publique la página a medias. El error lista qué falta.

Para compilar igual, por ejemplo para revisar en staging con Legal y Técnica:

```powershell
$env:PERMITIR_PENDIENTES = '1'; npm run build; Remove-Item Env:PERMITIR_PENDIENTES
```

Con el script de publicación es igual: definir la variable antes de correr `.\deploy\publicar.ps1`. **No usar esto para producción.**
