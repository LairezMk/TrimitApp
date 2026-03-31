@echo off
echo ====================================
echo TRIMIT - Iniciando servidor local
echo ====================================
echo.

cd /d "%~dp0"

echo Verificando dependencias...
if not exist "node_modules\" (
    echo Instalando dependencias...
    call npm install
    echo.
)

echo Iniciando servidor de desarrollo...
echo.
echo El proyecto estará disponible en: http://localhost:5173
echo.
echo Para detener el servidor presiona Ctrl+C
echo.

call npm run dev
