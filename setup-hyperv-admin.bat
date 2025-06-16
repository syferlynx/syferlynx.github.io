@echo off
echo ========================================
echo    Hyper-V Setup - Administrator Mode
echo ========================================
echo.
echo This script will enable Hyper-V on your system.
echo You will be prompted for administrator privileges.
echo.
pause

:: Check if already running as administrator
net session >nul 2>&1
if %errorLevel% == 0 (
    echo Running with administrator privileges...
    goto :runScript
) else (
    echo Requesting administrator privileges...
    goto :requestAdmin
)

:requestAdmin
:: Request administrator privileges
powershell -Command "Start-Process cmd -ArgumentList '/c cd /d %~dp0 && powershell -ExecutionPolicy Bypass -File setup-hyperv.ps1 && pause' -Verb RunAs"
goto :end

:runScript
:: Run the PowerShell script directly
powershell -ExecutionPolicy Bypass -File "%~dp0setup-hyperv.ps1"
pause

:end
echo.
echo Script execution completed.
pause 
