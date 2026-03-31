@echo off
echo ====================================
echo TRIMIT - Instalando dependencias
echo ====================================
echo.

cd /d "%~dp0"

echo Instalando paquetes npm...
call npm install

echo.
echo ====================================
echo Instalacion completada!
echo ====================================
echo.
echo Ahora puedes ejecutar "run-dev.bat" para iniciar el servidor
echo.
pause
