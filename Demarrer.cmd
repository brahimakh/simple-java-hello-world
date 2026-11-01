@echo off
setlocal
chcp 65001 >nul
cd /d "%~dp0"
set "RESONANCE_NODE=node"
where node >nul 2>nul
if errorlevel 1 set "RESONANCE_NODE=%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"
if "%RESONANCE_NODE%"=="node" goto node_ready
if not exist "%RESONANCE_NODE%" goto missing_node
:node_ready
"%RESONANCE_NODE%" -e "if(Number(process.versions.node.split('.')[0])<24)process.exit(1)"
if errorlevel 1 goto missing_node
if not exist "dist\app.js" goto missing_build
echo.
echo RÉSONANCE INDUSTRIELLE
echo Le navigateur va ouvrir http://127.0.0.1:4317
echo Gardez cette fenetre ouverte pendant la partie.
echo.
"%RESONANCE_NODE%" scripts\server.mjs --open
if errorlevel 1 pause
exit /b
:missing_node
echo Node.js 24 ou plus recent est necessaire.
echo Installez la version LTS depuis https://nodejs.org/ puis relancez ce fichier.
pause
exit /b 1
:missing_build
echo La version compilee manque. Lancez Verifier.cmd pour la reconstruire.
pause
exit /b 1
