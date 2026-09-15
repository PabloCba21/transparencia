/**
 * Comportamiento del formulario de solicitud (src/components/FormularioSolicitud.astro).
 *
 * Todo ocurre en el navegador: nada se envía a un servidor. Astro compila este
 * archivo a /_astro/*.js, así que cumple la CSP `script-src 'self'`.
 */

type Regla = [id: string, esValido: (campo: HTMLInputElement) => boolean, mensaje: string];

const soloNumeros = (texto: string) => texto.replace(/\D/g, '');

export function iniciarSolicitud(): void {
	const raiz = document.querySelector<HTMLElement>('[data-solicitud]');
	if (!raiz) return;

	const $ = <T extends Element>(selector: string) => raiz.querySelector<T>(selector)!;
	const form = $<HTMLFormElement>('[data-formulario]');
	const resumen = $<HTMLElement>('[data-resumen]');
	const detalle = $<HTMLTextAreaElement>('#detalle');
	const contador = $<HTMLElement>('[data-contador]');
	const vistaPrevia = $<HTMLElement>('[data-vista-previa]');
	const estadoCopia = $<HTMLElement>('[data-copiado]');
	const correoDestino = raiz.dataset.correo || 'CORREO-PENDIENTE';

	// Sin JavaScript el formulario queda oculto y se ve el <noscript>. Si se
	// mostrara, al tocar "Continuar" el navegador mandaría los datos personales
	// en la URL (y quedarían en los logs del servidor).
	raiz.hidden = false;

	const tipo = () => (form.elements.namedItem('tipo') as RadioNodeList).value;
	const valor = (nombre: string) => ((form.elements.namedItem(nombre) as HTMLInputElement | null)?.value ?? '').trim();

	// Persona u organización: muestra solo los campos que corresponden
	form.querySelectorAll<HTMLInputElement>('input[name="tipo"]').forEach((radio) =>
		radio.addEventListener('change', () => {
			form.querySelectorAll<HTMLElement>('[data-tipo]').forEach((grupo) => {
				grupo.hidden = grupo.dataset.tipo !== tipo();
			});
		}),
	);

	detalle.addEventListener('input', () => {
		contador.textContent = `Quedan ${detalle.maxLength - detalle.value.length} caracteres`;
	});

	function reglas(): Regla[] {
		const identidad: Regla[] =
			tipo() === 'fisica'
				? [
						['nombre', (c) => c.value.trim().length >= 3, 'Escribí tu nombre y apellido.'],
						['dni', (c) => /^\d{7,8}$/.test(soloNumeros(c.value)), 'El DNI tiene que tener 7 u 8 números.'],
					]
				: [
						['razon', (c) => c.value.trim().length >= 2, 'Escribí la razón social.'],
						['cuit', (c) => /^\d{11}$/.test(soloNumeros(c.value)), 'El CUIT tiene que tener 11 números.'],
						['representante', (c) => c.value.trim().length >= 3, 'Escribí el nombre de quien presenta la solicitud.'],
					];
		return [
			...identidad,
			['correo', (c) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c.value.trim()), 'Escribí un correo válido, por ejemplo nombre@dominio.com.'],
			['detalle', (c) => c.value.trim().length >= 15, 'Contanos qué información necesitás (al menos 15 caracteres).'],
			['acepto', (c) => c.checked, 'Tenés que aceptar el uso de tus datos para tramitar la solicitud.'],
		];
	}

	/** Marca cada campo con error y arma el resumen con links a cada uno. Devuelve true si está todo bien. */
	function validar(): boolean {
		form.querySelectorAll('[aria-invalid]').forEach((campo) => campo.removeAttribute('aria-invalid'));
		form.querySelectorAll('.campo__error').forEach((error) => (error.textContent = ''));

		const lista = resumen.querySelector('ul')!;
		lista.replaceChildren();

		for (const [id, esValido, mensaje] of reglas()) {
			const campo = form.querySelector<HTMLInputElement>(`#${id}`)!;
			if (esValido(campo)) continue;

			campo.setAttribute('aria-invalid', 'true');
			form.querySelector(`#${id}-error`)!.textContent = mensaje;

			const link = document.createElement('a');
			link.href = `#${id}`;
			link.textContent = mensaje;
			link.addEventListener('click', (evento) => {
				evento.preventDefault();
				campo.focus();
			});
			const item = document.createElement('li');
			item.append(link);
			lista.append(item);
		}

		const hayErrores = lista.children.length > 0;
		resumen.hidden = !hayErrores;
		if (hayErrores) resumen.focus();
		return !hayErrores;
	}

	function nombreSolicitante(): string {
		return tipo() === 'fisica' ? valor('nombre') : valor('razon');
	}

	function armarTexto(): string {
		const fecha = new Date().toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' });
		const solicitante =
			tipo() === 'fisica'
				? `${valor('nombre')}, DNI ${soloNumeros(valor('dni'))}`
				: `${valor('representante')}, en representación de ${valor('razon')} (CUIT ${soloNumeros(valor('cuit'))})`;
		const formato = (form.elements.namedItem('formato') as RadioNodeList).value;

		const renglones: Array<string | false> = [
			`La Rioja, ${fecha}`,
			'',
			'A la Universidad Nacional de La Rioja',
			'Responsable de Acceso a la Información Pública',
			'',
			`Quien suscribe, ${solicitante}, solicita en los términos de la Ley 27.275 de Acceso a la Información Pública la siguiente información:`,
			'',
			valor('tema') !== '' && `Tema: ${valor('tema')}`,
			valor('detalle'),
			'',
			`Formato preferido: ${formato}.`,
			'',
			'Datos de contacto:',
			`Correo electrónico: ${valor('correo')}`,
			valor('telefono') !== '' && `Teléfono: ${valor('telefono')}`,
			'',
			'',
			'Firma: ______________________',
		];
		return renglones.filter((renglon) => renglon !== false).join('\n');
	}

	function irAlPaso(numero: 1 | 2): void {
		raiz.querySelectorAll<HTMLElement>('[data-paso-contenido]').forEach((seccion) => {
			seccion.hidden = seccion.dataset.pasoContenido !== String(numero);
		});
		raiz.querySelectorAll<HTMLElement>('.pasos__item').forEach((item) => {
			const paso = Number(item.dataset.paso);
			if (paso === numero) item.setAttribute('aria-current', 'step');
			else item.removeAttribute('aria-current');
			item.classList.toggle('pasos__item--hecho', paso < numero);
		});
		$<HTMLElement>('.pasos').scrollIntoView({ behavior: 'smooth', block: 'start' });
	}

	form.addEventListener('submit', (evento) => {
		evento.preventDefault();
		if (!validar()) return;

		const texto = armarTexto();
		vistaPrevia.textContent = texto;
		estadoCopia.textContent = '';

		// En un link mailto: los saltos de línea tienen que ser \r\n (RFC 6068)
		const asunto = `Solicitud de acceso a la información pública - ${nombreSolicitante()}`;
		$<HTMLAnchorElement>('[data-abrir-correo]').href =
			`mailto:${correoDestino}?subject=${encodeURIComponent(asunto)}&body=${encodeURIComponent(texto.replaceAll('\n', '\r\n'))}`;

		irAlPaso(2);
		// Mover el foco al título: quien usa lector de pantalla se entera de que cambió el paso
		$<HTMLElement>('#titulo-envio').focus({ preventScroll: true });
	});

	$('[data-copiar]').addEventListener('click', async () => {
		try {
			await navigator.clipboard.writeText(vistaPrevia.textContent ?? '');
			estadoCopia.textContent = `✓ Texto copiado. Pegalo en un correo nuevo a ${correoDestino}.`;
		} catch {
			estadoCopia.textContent = 'No se pudo copiar automáticamente: seleccioná el texto de arriba y copialo.';
		}
	});

	$('[data-imprimir]').addEventListener('click', () => window.print());

	$('[data-editar]').addEventListener('click', () => {
		irAlPaso(1);
		$<HTMLInputElement>('#titulo-formulario ~ form input').focus({ preventScroll: true });
	});
}
