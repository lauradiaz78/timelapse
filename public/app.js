const btnGrabar = document.getElementById('btnGrabar');
const btnDetener = document.getElementById('btnDetener');
const intervalInput = document.getElementById('interval');
const progressSection = document.getElementById('progressSection');
const progressBar = document.getElementById('progressBar');
const progressText = document.getElementById('progressText');
const downloadSection = document.getElementById('downloadSection');
const downloadLink = document.getElementById('downloadLink');
const statusLed = document.getElementById('statusLed');
const statusText = document.getElementById('statusText');

async function checkStatus() {
    try {
        const response = await fetch('/api/status');
        const data = await response.json();
        if (response.ok && data.status === 'ok') {
            statusLed.className = 'led green';
            statusText.innerText = 'Cámara conectada';
            if (!btnDetener.disabled === false) btnGrabar.disabled = false; // Habilitar si no estamos grabando
        } else {
            statusLed.className = 'led red';
            statusText.innerText = data.message || 'Error de cámara';
            btnGrabar.disabled = true;
        }
    } catch (err) {
        statusLed.className = 'led red';
        statusText.innerText = 'Sin conexión con el servidor Node.js';
        btnGrabar.disabled = true;
    }
}

// Chequear status cada 5 segundos
setInterval(checkStatus, 5000);
checkStatus();

btnGrabar.addEventListener('click', async () => {
    const interval = intervalInput.value;
    
    try {
        const response = await fetch('/api/start', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ interval: parseInt(interval) })
        });
        
        if (response.ok) {
            btnGrabar.disabled = true;
            btnDetener.disabled = false;
            intervalInput.disabled = true;
            
            // Ocultar sección de progreso si estaba visible de una grabación anterior
            progressSection.style.display = 'none';
            progressBar.style.width = '0%';
            progressText.innerText = '0%';
            downloadSection.style.display = 'none';
        } else {
            const data = await response.json();
            alert('Error: ' + data.message);
        }
    } catch (error) {
        console.error('Error al iniciar captura:', error);
        alert('Fallo la conexión con el servidor.');
    }
});

btnDetener.addEventListener('click', async () => {
    try {
        const response = await fetch('/api/stop', { method: 'POST' });
        
        if (response.ok) {
            btnGrabar.disabled = false;
            btnDetener.disabled = true;
            intervalInput.disabled = false;
            
            startProgress();
        } else {
            const data = await response.json();
            alert('Error: ' + data.message);
        }
    } catch (error) {
        console.error('Error al detener captura:', error);
        alert('Fallo la conexión con el servidor.');
    }
});

function startProgress() {
    progressSection.style.display = 'block';
    downloadSection.style.display = 'none';
    progressBar.style.width = '0%';
    progressText.innerText = 'Iniciando compresión...';

    const evtSource = new EventSource('/api/progress');
    
    evtSource.onmessage = function(event) {
        const data = JSON.parse(event.data);
        
        if (data.status === 'procesando') {
            const pct = Math.round(data.progress);
            progressBar.style.width = pct + '%';
            progressText.innerText = pct + '%';
        } else if (data.status === 'completado') {
            progressBar.style.width = '100%';
            progressText.innerText = '100%';
            
            downloadLink.href = data.file;
            downloadSection.style.display = 'block';
            evtSource.close();
        } else if (data.status === 'No hay frames para generar') {
             progressBar.style.width = '100%';
             progressText.innerText = data.status;
             evtSource.close();
        } else if (data.status === 'error') {
            progressText.innerText = 'Error: ' + data.error;
            progressBar.style.backgroundColor = 'var(--danger-color)';
            evtSource.close();
        }
    };
    
    evtSource.onerror = function(err) {
        console.error("EventSource failed:", err);
        evtSource.close();
        progressText.innerText = 'Error de conexión con el progreso.';
    };
}
