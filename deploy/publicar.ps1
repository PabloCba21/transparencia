<#
.SYNOPSIS
    Publica el Portal de Transparencia en la VM.

.DESCRIPTION
    Compila el sitio en esta PC, lo empaqueta y lo copia a la VM como una
    release nueva. Recién cuando la copia terminó, mueve el symlink "current"
    que lee Nginx. Ese último paso es instantáneo: nadie ve el sitio a medio
    copiar y volver atrás es apuntar el symlink a la release anterior
    (ver revertir.ps1).

    La VM no necesita Node ni el repositorio: solo recibe HTML, CSS y fuentes.

.PARAMETER Servidor
    Usuario y host, en formato usuario@ip (por ejemplo deploy@10.0.0.25).
    Si no se pasa, se usa la variable de entorno TRANSPARENCIA_SERVIDOR.

.PARAMETER SinBuild
    Publica el contenido actual de dist/ sin volver a compilar.

.EXAMPLE
    .\deploy\publicar.ps1 -Servidor deploy@10.0.0.25

.EXAMPLE
    # Para no repetir la IP en cada publicación (dura lo que dura la ventana):
    $env:TRANSPARENCIA_SERVIDOR = 'deploy@10.0.0.25'
    .\deploy\publicar.ps1
#>
[CmdletBinding()]
param(
	[string]$Servidor = $env:TRANSPARENCIA_SERVIDOR,
	[string]$Destino = '/var/www/transparencia',
	[string]$Dominio = 'transparencia.unlar.edu.ar',
	[int]$ReleasesAConservar = 5,
	[switch]$SinBuild
)

$ErrorActionPreference = 'Stop'

function Paso($texto) { Write-Host "==> $texto" -ForegroundColor Cyan }
function Ok($texto) { Write-Host "    $texto" -ForegroundColor Green }

if (-not $Servidor) {
	throw "Falta el servidor. Usá -Servidor deploy@<IP_VM> o definí `$env:TRANSPARENCIA_SERVIDOR."
}

$raiz = Split-Path $PSScriptRoot -Parent
Push-Location $raiz
try {
	# --- 1. Compilar --------------------------------------------------------
	if (-not $SinBuild) {
		Paso 'Compilando el sitio (npm run build)'
		npm run build
		if ($LASTEXITCODE -ne 0) { throw 'El build falló. No se publica nada.' }
	}

	$dist = Join-Path $raiz 'dist'
	if (-not (Test-Path (Join-Path $dist 'index.html'))) {
		throw "No existe dist\index.html. Corré npm run build antes de publicar."
	}

	$archivos = (Get-ChildItem $dist -Recurse -File).Count
	Ok "$archivos archivos listos en dist\"

	# --- 2. Empaquetar ------------------------------------------------------
	# Un solo .tar.gz en lugar de scp -r: una transferencia, permisos parejos
	# y la descompresión del otro lado es mucho más rápida que 28 copias.
	$release = Get-Date -Format 'yyyy-MM-dd-HHmm'
	$nombrePaquete = "transparencia-$release.tar.gz"
	$paquete = Join-Path $env:TEMP $nombrePaquete

	Paso "Empaquetando la release $release"
	tar -czf $paquete -C $dist .
	if ($LASTEXITCODE -ne 0) { throw 'No se pudo generar el paquete.' }
	Ok ('{0:N1} KB' -f ((Get-Item $paquete).Length / 1KB))

	# --- 3. Copiar a la VM --------------------------------------------------
	Paso "Copiando a $Servidor"
	scp -q $paquete "${Servidor}:/tmp/$nombrePaquete"
	if ($LASTEXITCODE -ne 0) { throw 'Falló la copia por scp. ¿La VM responde y la clave SSH está cargada?' }
	Ok 'Copiado'

	# --- 4. Instalar la release y mover el symlink --------------------------
	# set -eu: el script remoto corta al primer error y ante variables sin definir.
	$remoto = @'
set -eu
DESTINO="{DESTINO}"
RELEASE="{RELEASE}"
PAQUETE="/tmp/{PAQUETE}"
CONSERVAR={CONSERVAR}

mkdir -p "$DESTINO/releases/$RELEASE"
tar -xzf "$PAQUETE" -C "$DESTINO/releases/$RELEASE"
rm -f "$PAQUETE"

# El tar de Windows guarda permisos 666/777 y deja la raíz en 555 (sin escritura).
# Se normalizan a carpetas 755 y archivos 644: Nginx lee todo, nadie más escribe,
# y deploy puede borrar la release cuando rote (con 555 fallaría el rm).
chmod -R u=rwX,go=rX "$DESTINO/releases/$RELEASE"

test -f "$DESTINO/releases/$RELEASE/index.html"

# -n evita que el symlink se cree ADENTRO de la carpeta vieja
ln -sfn "$DESTINO/releases/$RELEASE" "$DESTINO/current"

# Conservar solo las últimas N releases (las más viejas se borran)
cd "$DESTINO/releases"
ls -1dt */ | tail -n +$((CONSERVAR + 1)) | xargs -r rm -rf

echo "release instalada: $(readlink -f "$DESTINO/current")"
'@
	$remoto = $remoto.Replace('{DESTINO}', $Destino).Replace('{RELEASE}', $release).Replace('{PAQUETE}', $nombrePaquete).Replace('{CONSERVAR}', $ReleasesAConservar)

	Paso 'Instalando la release en la VM'
	$salida = $remoto | ssh $Servidor 'bash -s'
	if ($LASTEXITCODE -ne 0) { throw 'Falló la instalación en la VM. El sitio anterior sigue publicado.' }
	Ok $salida

	# --- 5. Verificar -------------------------------------------------------
	# --resolve fuerza a resolver el dominio contra la propia VM: así se valida
	# el certificado con el nombre real aunque el DNS público todavía no exista.
	Paso 'Verificando que el sitio responda'
	$codigo = ssh $Servidor "curl -s -o /dev/null -w '%{http_code}' --resolve ${Dominio}:443:127.0.0.1 https://${Dominio}/"
	if ($codigo -eq '200') {
		Ok "HTTP $codigo · publicado en https://$Dominio/"
	}
	else {
		Write-Warning "El sitio respondió HTTP $codigo (se esperaba 200). Revisá: sudo nginx -t && sudo systemctl status nginx"
	}

	Remove-Item $paquete -ErrorAction SilentlyContinue
}
finally {
	Pop-Location
}
