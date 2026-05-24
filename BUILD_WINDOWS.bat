@echo off
title Tornado — Building Windows Installer
color 1F
echo.
echo  ================================================
echo   TORNADO — Building Windows Desktop App
echo  ================================================
echo.

:: Check Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo  ERROR: Node.js not found!
    echo  Please install Node.js from https://nodejs.org
    pause
    exit /b 1
)

echo  [1/3] Installing dependencies...
call npm install
if %errorlevel% neq 0 (
    echo  ERROR: npm install failed
    pause
    exit /b 1
)

echo.
echo  [2/3] Building React app...
call npm run build
if %errorlevel% neq 0 (
    echo  ERROR: Build failed
    pause
    exit /b 1
)

echo.
echo  [3/3] Creating Windows installer (.exe)...
call npx electron-builder --win --x64
if %errorlevel% neq 0 (
    echo  ERROR: Packaging failed
    pause
    exit /b 1
)

echo.
echo  ================================================
echo   SUCCESS! Installer is in the  release  folder
echo  ================================================
echo.
explorer release
pause
