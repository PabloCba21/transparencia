# Checklist VM — transparencia.unlar.edu.ar

Reemplazá los valores entre `<...>`. Los pasos 1–5 son para el viernes 11, los 6–10 para el lunes y martes, y el 11 para el miércoles.

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
sudo systemctl enable --now qemu-guest-agent
sudo hostnamectl set-hostname transparencia
sudo timedatectl set-timezone America/Argentina/La_Rioja
sudo dpkg-reconfigure -plow unattended-upgrades   # responder "Sí"
```

## 3. SSH solo con clave

Desde tu PC (PowerShell o Git Bash):

```bash
ssh-keygen -t ed25519 -C "<admin>@ssi-unlar"   # si todavía no tenés clave
```

Copiar el contenido de `~/.ssh/id_ed25519.pub` al archivo `~/.ssh/authorized_keys` del usuario `<admin>` en la VM (en Linux/Git Bash alcanza con `ssh-copy-id <admin>@<IP_VM>`).

En la VM, crear `/etc/ssh/sshd_config.d/99-hardening.conf` con este contenido:

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

⚠️ **Antes de cerrar la sesión actual, abrí otra y comprobá que entrás con la clave.** Si algo falla, todavía tenés la primera abierta para corregirlo.

## 4. Firewall (UFW)

```bash
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow from <RED_ADMIN_INTERNA/24> to any port 22 proto tcp   # SSH solo desde la red de la SSI
sudo ufw enable
sudo ufw status verbose
```

Agregar la VM en el firewall perimetral de la DMZ, con 80 y 443 abiertos desde Internet y 22 solo desde la red interna. Actualizar `listado_DMZ.txt`.

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
maxretry = 5
bantime = 1h
```

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

## 11. Producción (miércoles 16)

- [ ] Registro DNS `A transparencia.unlar.edu.ar → <IP_PUBLICA>` (+ NAT en el perimetral si corresponde)
- [ ] Quitar la entrada del archivo hosts en las PCs de prueba
- [ ] https://www.ssllabs.com/ssltest/ → objetivo: **A** o superior
- [ ] https://securityheaders.com/ → objetivo: **A** o superior
- [ ] Probar desde el celular con datos móviles (fuera de la red de la UNLaR)
- [ ] Confirmar que el backup de la VM en Proxmox corrió al menos una vez
