@echo off
setlocal
cd /d "%~dp0"
echo BJ ELECTRONICS - Windows 11 Local Build Test
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
echo Running production static build test...
call npm run build
if errorlevel 1 (
  echo.
  echo Build failed. Send the error screenshot/log.
  pause
  exit /b 1
)

echo.
echo Build completed successfully. Upload the CONTENTS of the out folder to Hostinger public_html.
pause
