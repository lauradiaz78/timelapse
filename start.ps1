# start.ps1
# Script para iniciar la aplicación Time-Lapse Local

Write-Host "Iniciando configuración de Time-Lapse App..." -ForegroundColor Cyan

# 1. Configurar PATH local si están instalados manualmente
$env:Path = "C:\node\node-v20.17.0-win-x64;C:\ffmpeg\ffmpeg-master-latest-win64-gpl\bin;" + $env:Path

# 2. Verificar Node.js
if (!(Get-Command "node" -ErrorAction SilentlyContinue)) {
    Write-Host "Error: Node.js no está instalado o no está en el PATH." -ForegroundColor Red
    exit 1
} else {
    $nodeVersion = node -v
    Write-Host "Node.js encontrado: $nodeVersion" -ForegroundColor Green
}

# 2. Verificar FFmpeg
if (!(Get-Command "ffmpeg" -ErrorAction SilentlyContinue)) {
    Write-Host "Advertencia: FFmpeg no está instalado o no está en el PATH." -ForegroundColor Yellow
    Write-Host "Para generar el video, FFmpeg es necesario." -ForegroundColor Yellow
    Write-Host "Podés instalarlo ejecutando este comando en otra terminal como Administrador:" -ForegroundColor Cyan
    Write-Host "winget install ffmpeg" -ForegroundColor White
    Write-Host "Una vez instalado, cerrá esta ventana y volvé a ejecutar el script." -ForegroundColor Yellow
    
    $respuesta = Read-Host "¿Querés intentar continuar de todos modos? (S/N)"
    if ($respuesta -notmatch "^[Ss]") {
        exit 1
    }
} else {
    Write-Host "FFmpeg encontrado y listo para usar." -ForegroundColor Green
}

# 3. Instalar dependencias
Write-Host "Instalando dependencias de Node.js (npm install)..." -ForegroundColor Cyan
npm install

# 4. Iniciar el servidor
Write-Host "Iniciando el servidor..." -ForegroundColor Cyan
node server.js
