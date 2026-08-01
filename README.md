# Time-Lapse Local App

¡Hola! Esta es una aplicación web local para capturar un stream de video MJPEG de una cámara IP y generar un video Time-Lapse (MP4) de alta calidad.

## Pasos para arrancar la app

1. **Requisitos Previos:**
   - Tenés que tener instalado **Node.js** (podés bajarlo de nodejs.org).
   - Necesitás **FFmpeg** instalado y agregado al PATH de tu sistema. (Si estás en Windows 10/11, podés abrir una terminal como Administrador y correr `winget install ffmpeg`).

2. **Ejecutar el script de inicio:**
   - Abrí PowerShell en esta carpeta.
   - Corré el script `start.ps1` tipeando:
     ```powershell
     .\start.ps1
     ```
   - *Nota: Si te tira error de ejecución de scripts, primero corré `Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process` y probá de nuevo.*

3. **Usar la aplicación:**
   - Una vez que la terminal diga que el servidor está corriendo, abrí tu navegador y andá a [http://localhost:3000](http://localhost:3000).
   - Vas a ver la vista previa en vivo de la cámara.
   - Elegí el "Intervalo entre capturas" en segundos.
   - Hacé clic en **"Iniciar Captura"**. La app va a empezar a guardar fotos.
   - Cuando quieras terminar, hacé clic en **"Detener y Generar MP4"**.
   - Esperá a que termine la barra de progreso y hacé clic en **"¡Listo che, descargar video!"** para guardar tu time-lapse.

## Estructura de carpetas
- `server.js`: El corazón del backend, maneja la captura y llama a FFmpeg.
- `public/`: Acá está todo el frontend (HTML, CSS y JS).
- `frames/`: (Se crea sola) Carpeta temporal donde se guardan las fotos antes de hacer el video. No te preocupes, se limpia automáticamente cada vez que empezás a grabar de nuevo.
