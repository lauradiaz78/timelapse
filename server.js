const express = require('express');
const axios = require('axios');
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;
const CAMERA_STREAM_URL = 'http://192.168.0.4/webcam/?action=stream';
const CAMERA_SNAPSHOT_URL = 'http://192.168.0.4/webcam/?action=snapshot';
const FRAMES_DIR = path.join(__dirname, 'frames');
const OUTPUT_FILE = path.join(__dirname, 'output.mp4');

// Asegurar que el directorio de frames existe
if (!fs.existsSync(FRAMES_DIR)) {
    fs.mkdirSync(FRAMES_DIR, { recursive: true });
}

app.use(express.json());
app.use(express.static('public'));

let captureIntervalId = null;
let frameCount = 0;
let isCapturing = false;

// Limpiar la carpeta de frames
function cleanFramesDirectory() {
    const files = fs.readdirSync(FRAMES_DIR);
    for (const file of files) {
        fs.unlinkSync(path.join(FRAMES_DIR, file));
    }
    if (fs.existsSync(OUTPUT_FILE)) {
        fs.unlinkSync(OUTPUT_FILE);
    }
}

// Endpoint de Status (para el LED)
app.get('/api/status', async (req, res) => {
    try {
        // Intentar conectar a la cámara (timeout corto)
        await axios.get(CAMERA_STREAM_URL, { timeout: 2000, responseType: 'stream' })
            .then(response => {
                response.data.destroy(); // Cortar la conexión rápido
            });
        res.json({ status: 'ok', message: 'Cámara conectada' });
    } catch (error) {
        res.status(503).json({ status: 'error', message: 'Cámara inaccesible: ' + error.message });
    }
});

// Iniciar captura
app.post('/api/start', (req, res) => {
    if (isCapturing) {
        return res.status(400).json({ message: 'Ya se está capturando.' });
    }
    
    const intervalSeconds = req.body.interval || 1;
    const intervalMs = intervalSeconds * 1000;

    cleanFramesDirectory();
    frameCount = 0;
    isCapturing = true;

    captureIntervalId = setInterval(async () => {
        try {
            // Usar action=snapshot para obtener un solo frame en lugar de trabarse con el stream
            const reqFrame = await axios.get(CAMERA_SNAPSHOT_URL, { 
                responseType: 'arraybuffer', 
                timeout: Math.max(intervalMs - 500, 1000) // Timeout menor al intervalo
            });
            
            frameCount++;
            const filename = String(frameCount).padStart(4, '0') + '.jpg';
            fs.writeFileSync(path.join(FRAMES_DIR, filename), reqFrame.data);
            console.log(`Guardado: ${filename}`);
        } catch (error) {
            console.error('Error capturando frame:', error.message);
            // Fallback: si action=snapshot no existe y tira 404, se podría intentar extraer con ffmpeg del stream
            if (error.response && error.response.status === 404) {
                 console.log("action=snapshot no soportado. Intentando extraer con ffmpeg...");
                 frameCount++;
                 const filename = String(frameCount).padStart(4, '0') + '.jpg';
                 ffmpeg(CAMERA_STREAM_URL)
                    .frames(1)
                    .output(path.join(FRAMES_DIR, filename))
                    .on('end', () => console.log(`Guardado (vía ffmpeg): ${filename}`))
                    .on('error', (err) => {
                         console.error("Error ffmpeg captura:", err);
                         frameCount--;
                    })
                    .run();
            }
        }
    }, intervalMs);

    res.json({ message: 'Captura iniciada', interval: intervalSeconds });
});

// Detener captura y generar MP4
app.post('/api/stop', (req, res) => {
    if (!isCapturing) {
        return res.status(400).json({ message: 'No se está capturando actualmente.' });
    }

    clearInterval(captureIntervalId);
    isCapturing = false;
    
    res.json({ message: 'Captura detenida, generando MP4...' });
});

// Endpoint SSE para progreso de FFmpeg
app.get('/api/progress', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    if (frameCount === 0) {
        res.write('data: {"progress": 100, "status": "No hay frames para generar"}\n\n');
        return res.end();
    }

    ffmpeg()
        .input(path.join(FRAMES_DIR, '%04d.jpg'))
        .inputFPS(30)
        .videoCodec('libx264')
        .outputOptions(['-pix_fmt yuv420p'])
        .on('progress', (progress) => {
            let percent = (progress.frames / frameCount) * 100;
            if (percent > 100) percent = 100;
            res.write(`data: ${JSON.stringify({ progress: percent, status: 'procesando' })}\n\n`);
        })
        .on('end', () => {
            res.write(`data: ${JSON.stringify({ progress: 100, status: 'completado', file: '/output.mp4' })}\n\n`);
            res.end();
        })
        .on('error', (err) => {
            console.error('Error FFmpeg:', err);
            res.write(`data: ${JSON.stringify({ progress: 0, status: 'error', error: err.message })}\n\n`);
            res.end();
        })
        .save(OUTPUT_FILE);
});

// Servir el MP4 generado
app.get('/output.mp4', (req, res) => {
    if (fs.existsSync(OUTPUT_FILE)) {
        res.sendFile(OUTPUT_FILE);
    } else {
        res.status(404).send('Archivo no encontrado');
    }
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
