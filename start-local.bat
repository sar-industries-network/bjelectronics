@echo off
setlocal
cd /d "%~dp0"
echo BJ ELECTRONICS - Windows 11 Localhost Start
echo.
echo Setting npm registry to public npm registry...
call npm config set registry https://registry.npmjs.org/
call npm config delete proxy >nul 2>nul
call npm config delete https-proxy >nul 2>nul

echo.
echo Installing dependencies from public npm registry...
call npm install --registry=https://registry.npmjs.org/ --no-audit --no-fund
if errorlevel 1 (
  echo.
  echo Installation failed. Close VS Code/terminal using this folder, delete node_modules manually, then run this file again.
  pause
  exit /b 1
)

echo.
echo Starting BJ ELECTRONICS local dev server at http://localhost:3000
call npm run dev
pause
