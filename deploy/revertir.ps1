<#
.SYNOPSIS
    Vuelve el sitio a una release anterior (rollback).

.DESCRIPTION
    No recompila ni copia nada: solo mueve el symlink "current" a una release
    que ya está en la VM. Por eso tarda milisegundos.

.PARAMETER Listar
    Muestra las releases disponibles y cuál está publicada, sin tocar nada.

.PARAMETER Release
    Nombre de la release a publicar (por ejemplo 2026-09-15-1030).
    Si no se indica, vuelve a la inmediatamente anterior a la actual.

.EXAMPLE
    .\deploy\revertir.ps1 -Servidor deploy@10.0.0.25 -Listar

.EXAMPLE
    .\deploy\revertir.ps1 -Servidor deploy@10.0.0.25
#>
[CmdletBinding()]
param(
	[string]$Servidor = $env:TRANSPARENCIA_SERVIDOR,
	[string]$Destino = '/var/www/transparencia',
	[string]$Release,
	[switch]$Listar
)

$ErrorActionPreference = 'Stop'

if (-not $Servidor) {
	throw "Falta el servidor. Usá -Servidor deploy@<IP_VM> o definí `$env:TRANSPARENCIA_SERVIDOR."
}

if ($Listar) {
	$remoto = @'
set -eu
DESTINO="{DESTINO}"
ACTUAL=$(basename "$(readlink -f "$DESTINO/current")")
cd "$DESTINO/releases"
for r in $(ls -1dt */); do
  r=${r%/}
  if [ "$r" = "$ACTUAL" ]; then echo "  $r   <-- publicada"; else echo "  $r"; fi
done
'@
	$remoto.Replace('{DESTINO}', $Destino) | ssh $Servidor 'bash -s'
	return
}

$remoto = @'
set -eu
DESTINO="{DESTINO}"
ELEGIDA="{RELEASE}"

ACTUAL=$(basename "$(readlink -f "$DESTINO/current")")

if [ -z "$ELEGIDA" ]; then
  # La más reciente que no sea la que está publicada
  ELEGIDA=$(cd "$DESTINO/releases" && ls -1dt */ | sed 's#/$##' | grep -v "^$ACTUAL$" | head -n 1)
fi

if [ -z "$ELEGIDA" ]; then
  echo "No hay una release anterior a la que volver." >&2
  exit 1
fi

test -f "$DESTINO/releases/$ELEGIDA/index.html"
ln -sfn "$DESTINO/releases/$ELEGIDA" "$DESTINO/current"
echo "revertido: $ACTUAL -> $ELEGIDA"
'@
$remoto = $remoto.Replace('{DESTINO}', $Destino).Replace('{RELEASE}', $Release)

$salida = $remoto | ssh $Servidor 'bash -s'
if ($LASTEXITCODE -ne 0) { throw 'No se pudo revertir.' }
Write-Host $salida -ForegroundColor Green
