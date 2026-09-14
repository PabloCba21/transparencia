# Checklist VM — transparencia.unlar.edu.ar

Reemplazá los valores entre `<...>`. Los pasos 1–5 son para el viernes 11, los 6–10 para el lunes y martes, el 11 se usa cada vez que se publica, y el 12 es para el miércoles.

---

## 1. Crear la VM en Proxmox

| Parámetro | Valor |
|---|---|
| SO | Ubuntu Server 26.04 LTS (instalación mínima) |
| vCPU / RAM / Disco | 1–2 vCPU · 2 GB · 20 GB (sobra: solo sirve archivos estáticos) |
| Red | Bridge/VLAN de la **DMZ** |
| Opciones | QEMU Guest Agent activado · incluir en el job de backup de Proxmox |

Durante la instalación: marcar **OpenSSH server** y crear el usuario administrador `<admin>` (no uses root).

## 2. Base del sistema

```bash
sudo apt update && sudo apt full-upgrade -y 
sudo apt install -y qemu-guest-agent unattended-upgrades fail2ban
    # qemu permite que el sistema operativo invitado se comunique con el hipervisor QEMU/Proxmox.
    # unattended-upgrades actualizaciones automáticas de seguridad (y otras).
    # fail2ban protección contra determinados ataques automatizados
sudo systemctl start qemu-guest-agent
systemctl status qemu-guest-agent   # tiene que decir "active (running)"
    # El agente NO se habilita con "enable": es una unidad estática que arranca sola
    # cuando existe /dev/virtio-ports/org.qemu.guest_agent.0 (lo crea Proxmox).
    # Si no arranca: VM → Options → QEMU Guest Agent → Enabled, y apagar/encender
    # la VM desde Proxmox (un reboot desde Ubuntu no agrega el dispositivo).
    # Verificación desde el host: la IP aparece en el Summary, o `qm agent <VMID> ping`.
sudo hostnamectl set-hostname transparencia
    # Cambia el nombre del servidor a transparencia
sudo timedatectl set-timezone America/Argentina/La_Rioja
    #Zona horarioa
sudo dpkg-reconfigure -plow unattended-upgrades   # responder "Sí"
```

## 3. SSH solo con clave

Desde tu PC (PowerShell o Git Bash):

```bash
ssh-keygen -t ed25519 -C "<admin>@ssi-unlar"   # si todavía no tenés clave
```

Cargar la clave pública en la VM (todavía entra con contraseña). En PowerShell, `ssh-copy-id` no existe; el equivalente es:

```powershell
type $env:USERPROFILE\.ssh\id_ed25519.pub | ssh <admin>@<IP_VM> "mkdir -p ~/.ssh && chmod 700 ~/.ssh && cat >> ~/.ssh/authorized_keys && chmod 600 ~/.ssh/authorized_keys"
```

Probar que entra **sin pedir contraseña** antes de seguir:

```powershell
ssh <admin>@<IP_VM>
```

En la VM, crear `/etc/ssh/sshd_config.d/00-hardening.conf` con este contenido:

> ⚠️ **El nombre empieza con `00-` a propósito.** En sshd vale la *primera* definición de cada opción, y los archivos se leen en orden alfabético. Ubuntu suele traer `50-cloud-init.conf` con `PasswordAuthentication yes`: un `99-hardening.conf` quedaría ignorado sin ningún error.

```
PermitRootLogin no
PasswordAuthentication no
KbdInteractiveAuthentication no
MaxAuthTries 3
```

Aplicar:

```bash
sudo sshd -t && sudo systemctl restart ssh
```

Verificar la configuración **efectiva** (no la del archivo):

```bash
sudo sshd -T | grep -Ei '^(permitrootlogin|passwordauthentication|kbdinteractiveauthentication|maxauthtries)'
```

Tiene que mostrar `permitrootlogin no`, `passwordauthentication no`, `kbdinteractiveauthentication no` y `maxauthtries 3`.

> ⚠️ **`sshd -T` lee los archivos, no el proceso que está corriendo.** Si el servicio no se recargó después del último cambio, el archivo dice `no` y el servidor sigue aceptando contraseñas (nos pasó el 12/09). Después de **cada** cambio: `sudo sshd -t && sudo systemctl reload ssh`, y hacer la prueba real desde la PC, que tiene que responder `Permission denied (publickey)`:
>
> ```powershell
> ssh -p <PUERTO_SSH> -o PubkeyAuthentication=no -o PreferredAuthentications=password <admin>@<IP_VM>
> ```

⚠️ **Antes de cerrar la sesión actual, abrí otra y comprobá que entrás con la clave.** Si algo falla, todavía tenés la primera abierta para corregirlo.

## 4. Firewall (UFW)

```bash
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow from <RED_ADMIN_INTERNA/24> to any port <PUERTO_SSH> proto tcp comment 'SSH desde SSI'
sudo ufw enable
sudo ufw status verbose
```

> ⚠️ **Antes de aplicar, en la sesión SSH corré `echo $SSH_CLIENT`.** Muestra `IP_origen puerto_origen puerto_servidor`. La regla de SSH tiene que incluir **esa IP de origen** (si el perimetral hace NAT puede no ser la de tu PC) y **ese puerto** (en esta VM SSH escucha en `55533`, no en 22). Si no coinciden, te quedás afuera.

> 💡 **La VM tiene IP pública en su interfaz (sin NAT delante), así que UFW es la barrera principal.** Desde la oficina de la SSI la conexión llega con la **IP pública de salida de la UNLaR**, no con una IP interna. Para averiguarla sin servicios externos: intentar conectarse y ver en la VM `sudo journalctl -k --since "10 min ago" | grep 'DPT=55533'` → campo `SRC=`. Si te quedaste afuera, entrá por la consola de Proxmox, que no pasa por UFW.

**Decisión (14/09/2026, Pablo):** SSH permitido solo desde la **IP pública de salida de la UNLaR**. La regla temporal de la IP de casa ya se quitó. Mejora a futuro: una IP de salida exclusiva de la SSI o una VPN, porque la IP de salida es compartida por toda la red de la universidad.

Para cambiar una regla, **primero agregar la nueva y probar que entra, después borrar la vieja**:

```bash
sudo ufw status numbered
sudo ufw delete <N>
```

Agregar la VM en el firewall perimetral (si corresponde), con 80 y 443 abiertos desde Internet y `<PUERTO_SSH>` solo desde la IP de la UNLaR. Actualizar `listado_DMZ.txt`.

## 5. Usuario de deploy (sin sudo)

```bash
sudo adduser --disabled-password --gecos "" deploy
sudo mkdir -p /home/deploy/.ssh
sudo cp ~/.ssh/authorized_keys /home/deploy/.ssh/   # o solo la clave pública de quien publica
sudo chown -R deploy:deploy /home/deploy/.ssh
sudo chmod 700 /home/deploy/.ssh
sudo chmod 600 /home/deploy/.ssh/authorized_keys

sudo mkdir -p /var/www/transparencia/releases
sudo chown -R deploy:www-data /var/www/transparencia
sudo chmod -R 755 /var/www/transparencia
```

> 💡 **Estructura de releases:** cada publicación va a `releases/<fecha-hora>/` y `current` es un symlink a la última. Cambiar el symlink es instantáneo (atómico): nadie ve el sitio a medio copiar. Para hacer rollback, se vuelve a apuntar `current` a la release anterior.

## 6. Nginx

```bash
sudo apt install -y nginx
sudo rm /etc/nginx/sites-enabled/default
```

Placeholder hasta el primer deploy real:

```bash
sudo -u deploy mkdir -p /var/www/transparencia/releases/inicial
echo '<!doctype html><title>Transparencia UNLaR</title><h1>Próximamente</h1>' | sudo -u deploy tee /var/www/transparencia/releases/inicial/index.html
sudo -u deploy cp /var/www/transparencia/releases/inicial/index.html /var/www/transparencia/releases/inicial/404.html
sudo -u deploy ln -sfn /var/www/transparencia/releases/inicial /var/www/transparencia/current
```

## 7. Certificado wildcard institucional

⚠️ **La clave privada viaja directo de la PC de administración a la VM por `scp`.** No la mandes por mail, Drive ni chat.

Desde tu PC, parado en la carpeta del certificado:

```bash
scp STAR_unlar_edu_ar.crt STAR_unlar_edu_ar.ca-bundle myserver.key <admin>@<IP_VM>:/tmp/
```

En la VM:

```bash
sudo mkdir -p /etc/ssl/unlar
cat /tmp/STAR_unlar_edu_ar.crt /tmp/STAR_unlar_edu_ar.ca-bundle | sudo tee /etc/ssl/unlar/fullchain.crt >/dev/null
sudo mv /tmp/myserver.key /etc/ssl/unlar/unlar.key
sudo chown root:root /etc/ssl/unlar/*
sudo chmod 644 /etc/ssl/unlar/fullchain.crt
sudo chmod 600 /etc/ssl/unlar/unlar.key
rm /tmp/STAR_unlar_edu_ar.*
```

Verificar que la clave corresponde al certificado (los dos hashes tienen que coincidir):

```bash
sudo openssl x509 -noout -pubkey -in /etc/ssl/unlar/fullchain.crt | sha256sum
sudo openssl pkey -pubout -in /etc/ssl/unlar/unlar.key | sha256sum
```

Ver el vencimiento (hoy es el 22/10/2026):

```bash
openssl x509 -noout -enddate -in /etc/ssl/unlar/fullchain.crt
```

> 📅 Cuando llegue el certificado renovado, repetir este paso y hacer `sudo systemctl reload nginx`.

## 8. Configuración del sitio

Desde tu PC, parado en la raíz del repo:

```bash
scp deploy/nginx/transparencia.unlar.edu.ar.conf <admin>@<IP_VM>:/tmp/
```

En la VM:

```bash
sudo mv /tmp/transparencia.unlar.edu.ar.conf /etc/nginx/sites-available/
sudo ln -s /etc/nginx/sites-available/transparencia.unlar.edu.ar.conf /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

## 9. fail2ban para SSH

Crear `/etc/fail2ban/jail.d/sshd.local`:

```
[sshd]
enabled = true
port = 55533
maxretry = 5
bantime = 1h
```

> `port` tiene que coincidir con el puerto real de SSH. Por defecto el jail bloquea el 22: con SSH en otro puerto detectaría los ataques pero bloquearía el puerto equivocado.

Aplicar y verificar:

```bash
sudo systemctl restart fail2ban
sudo fail2ban-client status sshd
```

## 10. Prueba interna (staging)

En una PC de la red interna, agregar al archivo hosts (`C:\Windows\System32\drivers\etc\hosts`):

```
<IP_VM>  transparencia.unlar.edu.ar
```

Verificar:

```bash
curl -I http://transparencia.unlar.edu.ar            # 301 hacia https
curl -I https://transparencia.unlar.edu.ar           # 200 + headers de seguridad
curl -X POST -I https://transparencia.unlar.edu.ar   # 405
```

Revisar también en el navegador que el candado no muestre advertencias.

## 11. Publicar el sitio desde la PC

El build se hace en la PC de desarrollo; a la VM viaja solamente el resultado (`dist/`). Así la VM no necesita Node, npm ni el repositorio: menos software instalado en la DMZ, menos superficie de ataque.

### Preparación (una sola vez por PC)

SSH escucha en el puerto `55533`. Para que `ssh`, `scp` y los scripts lo usen sin tener que indicarlo cada vez, crear o editar `%USERPROFILE%\.ssh\config` en la PC que publica:

```
Host transparencia
    HostName <IP_VM>
    Port 55533
    User deploy
    IdentityFile ~/.ssh/id_ed25519
```

Probar con `ssh transparencia`. Desde ahí, en todos los comandos de abajo `deploy@<IP_VM>` se reemplaza por `transparencia`.

### Con el script (lo habitual)

Desde la raíz del repo, en PowerShell:

```powershell
.\deploy\publicar.ps1 -Servidor deploy@<IP_VM>
```

Para no repetir la IP en cada publicación de la jornada:

```powershell
$env:TRANSPARENCIA_SERVIDOR = 'deploy@<IP_VM>'
.\deploy\publicar.ps1
```

Otras opciones útiles:

| Comando | Para qué |
|---|---|
| `.\deploy\publicar.ps1 -SinBuild` | Publicar el `dist/` actual sin recompilar |
| `.\deploy\revertir.ps1 -Listar` | Ver las releases que hay en la VM y cuál está publicada |
| `.\deploy\revertir.ps1` | Volver a la release anterior |
| `.\deploy\revertir.ps1 -Release 2026-09-15-1030` | Volver a una release puntual |

El script corta ante el primer error: si el build falla o la copia no llega, **el sitio que está publicado no se toca**.

### A mano (si el script falla o no hay PowerShell)

```powershell
npm run build
$release = Get-Date -Format 'yyyy-MM-dd-HHmm'
tar -czf "$env:TEMP\sitio.tar.gz" -C dist .
scp "$env:TEMP\sitio.tar.gz" deploy@<IP_VM>:/tmp/
ssh deploy@<IP_VM>
```

Ya en la VM:

```bash
RELEASE=$(date +%Y-%m-%d-%H%M)
mkdir -p /var/www/transparencia/releases/$RELEASE
tar -xzf /tmp/sitio.tar.gz -C /var/www/transparencia/releases/$RELEASE
ln -sfn /var/www/transparencia/releases/$RELEASE /var/www/transparencia/current
rm /tmp/sitio.tar.gz
```

Rollback:

```bash
ls -1dt /var/www/transparencia/releases/*/          # ver las releases
ln -sfn /var/www/transparencia/releases/<anterior> /var/www/transparencia/current
```

> 💡 **Por qué el symlink.** Descomprimir arriba del sitio en vivo deja unos segundos en los que alguien puede recibir el HTML nuevo con el CSS viejo. Copiar a una carpeta nueva y recién después mover `current` hace que el cambio sea instantáneo. Nginx no necesita reload: `root` apunta al symlink y lo resuelve en cada pedido.

## 12. Producción (miércoles 16)

- [ ] Registro DNS `A transparencia.unlar.edu.ar → <IP_PUBLICA>` (+ NAT en el perimetral si corresponde)
- [ ] Quitar la entrada del archivo hosts en las PCs de prueba
- [ ] https://www.ssllabs.com/ssltest/ → objetivo: **A** o superior
- [ ] https://securityheaders.com/ → objetivo: **A** o superior
- [ ] Probar desde el celular con datos móviles (fuera de la red de la UNLaR)
- [ ] Confirmar que el backup de la VM en Proxmox corrió al menos una vez
