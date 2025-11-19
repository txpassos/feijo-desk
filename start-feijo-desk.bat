@echo off
cd /d "%~dp0"

echo =============================
echo Instalando dependencias (npm)
echo =============================
call npm install

echo.
echo =============================
echo Iniciando backend e frontend
echo (Ctrl + C para parar)
echo =============================
call npm run dev:full

pause