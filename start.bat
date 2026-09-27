@echo off
rem Wubi Trainer Windows Launch Script
cd /d "%~dp0"

where python >nul 2>nul
if %ERRORLEVEL% equ 0 (
    start "" python server.py --open
    exit /b 0
)

where pythonw >nul 2>nul
if %ERRORLEVEL% equ 0 (
    start "" pythonw launch.pyw
    exit /b 0
)

echo [Error] Python 3 was not found in your PATH.
echo Please install Python 3 from https://www.python.org/ or the Microsoft Store.
pause
