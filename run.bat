@echo off
title Zero Hunger Platform
echo ====================================================
echo   Zero Hunger — Food Sharing Platform
echo   Starting Node.js Server with SQLite Database...
echo ====================================================
cd /d "%~dp0"

REM Ensure node is in PATH if installed in standard location
if exist "C:\Program Files\nodejs\node.exe" (
  set "PATH=C:\Program Files\nodejs;%PATH%"
)

where node >nul 2>nul
if %errorlevel% neq 0 (
  echo [ERROR] Node.js is not found in PATH or standard location.
  echo Please install Node.js LTS from https://nodejs.org or restart your system.
  pause
  exit /b 1
)

start http://localhost:3000
node server.js
pause
