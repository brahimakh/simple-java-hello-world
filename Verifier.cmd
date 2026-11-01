@echo off
setlocal
chcp 65001 >nul
cd /d "%~dp0"
set "RESONANCE_NODE=node"
where node >nul 2>nul
if errorlevel 1 set "RESONANCE_NODE=%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"
if not exist node_modules\typescript\bin\tsc goto missing_compiler
"%RESONANCE_NODE%" node_modules\typescript\bin\tsc
if errorlevel 1 goto failed
"%RESONANCE_NODE%" scripts\build.mjs
if errorlevel 1 goto failed
"%RESONANCE_NODE%" --test --test-isolation=none tests\*.test.mjs
if errorlevel 1 goto failed
"%RESONANCE_NODE%" scripts\balance.mjs
if errorlevel 1 goto failed
echo.
echo Compilation, typage, tests et mesures termines.
pause
exit /b 0
:missing_compiler
echo TypeScript manque. Installez les dependances avec pnpm install --frozen-lockfile.
echo Cette premiere installation peut demander Internet. Le jeu compile n'en a pas besoin.
pause
exit /b 1
:failed
echo.
echo Verification en echec. Consultez le message ci-dessus.
pause
exit /b 1
