<div align="center">
  <h1>📸 Klipper/Moonraker Time-Lapse Local App</h1>
  <p>Una aplicación web súper liviana y local para generar videos Time-Lapse a partir del stream (mjpg-streamer) de tu impresora 3D con Klipper.</p>
</div>

---

## 🚀 ¿Qué hace esto?

Si tenés una impresora 3D (como la **Artillery Sidewinder X4 Pro**) corriendo Klipper y Moonraker con una cámara web conectada, seguramente uses `mjpg-streamer` para ver la impresión en vivo.

Esta aplicación te permite conectarte a esa cámara desde tu red local, sacar fotos (snapshots) cada cierta cantidad de segundos (intervalo configurable) y, cuando termines, unirlas todas automáticamente en un video `.mp4` de alta calidad a 30 FPS usando FFmpeg. Todo esto **sin instalar plugins pesados en la impresora**, gestionando el procesamiento directamente desde tu PC.

---

## 🛠️ Requisitos Previos

Para que esta aplicación funcione en tu PC (Windows), necesitás dos herramientas esenciales instaladas:

1. **Node.js:** El entorno que ejecuta el servidor local.
2. **FFmpeg:** La herramienta mágica que convierte las cientos de fotos `.jpg` en un video `.mp4`.

*(Si corriste la instalación automatizada desde PowerShell, es probable que ya los tengas configurados de manera portable dentro de la carpeta).*

---

## 🎮 Pasos para arrancar la app (Windows)

1. **Abrir PowerShell:**
   Navegá hasta la carpeta donde descargaste este proyecto. Hacé clic derecho en una zona vacía de la carpeta (o en la barra de direcciones superior) y abrí PowerShell o la Terminal.

2. **Iniciar el Servidor:**
   Ejecutá el script de inicio tipeando el siguiente comando:
   ```powershell
   .\start.ps1
   ```
   *Nota: Si te da un error rojo diciendo que la ejecución de scripts está bloqueada, copiá, pegá y ejecutá esto primero:* `$env:Path = "C:\node\node-v20.17.0-win-x64;C:\ffmpeg\ffmpeg-master-latest-win64-gpl\bin;" + $env:Path; node server.js`

3. **¡A grabar!:**
   Una vez que la terminal te diga `Servidor corriendo en http://localhost:3000`, abrí tu navegador favorito (Chrome, Edge, Firefox) y entrá a esa dirección:
   👉 **[http://localhost:3000](http://localhost:3000)**

---

## 🖥️ Cómo usar la interfaz

- **Indicador LED (Arriba):** 
  - 🟢 **Verde:** La aplicación detectó tu cámara en la red (IP: `192.168.0.4`) y está lista para grabar.
  - 🔴 **Rojo:** No se pudo encontrar la cámara. Verificá que la impresora esté encendida, conectada al WiFi y que la dirección IP sea la correcta.
- **Intervalo:** Elegí cada cuántos segundos querés que la app "saque una foto" de la impresión. (Ej: `5` segundos es un buen valor para piezas grandes).
- **Iniciar Captura:** Empieza a guardar fotos en la carpeta temporal `frames/`.
- **Detener y Generar MP4:** Termina la captura y empieza a procesar el video. Vas a ver una barra de progreso; cuando llegue a 100%, ¡descargá tu video!

---

## 📁 Estructura del Proyecto

- `server.js`: El cerebro del backend. Maneja la descarga de imágenes vía `action=snapshot` y manda comandos a FFmpeg.
- `public/`: Contiene la interfaz gráfica (HTML, CSS con un lindo Dark Mode, y el JS del cliente).
- `start.ps1`: Script automatizado para arrancar todo fácil en Windows.
- `frames/`: Carpeta temporal (se crea sola y se autolimpia) donde se alojan las fotos JPG antes de hacer el renderizado del MP4.

---
*Desarrollado para la comunidad de impresión 3D.* 🖨️✨
