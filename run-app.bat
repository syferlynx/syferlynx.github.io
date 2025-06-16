@echo off
echo ========================================
echo    React Application Launcher
echo ========================================
echo.

:: Check if we're in the right directory
if not exist "syferlynx-applications" (
    echo Error: syferlynx-applications directory not found
    echo Please run this script from the project root directory
    pause
    exit /b 1
)

:: Navigate to the application directory
cd syferlynx-applications

:: Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    echo.
    echo Alternative: Try running in WSL with Node.js installed
    pause
    exit /b 1
)

:: Check if npm is available
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: npm is not available
    echo Please ensure Node.js is properly installed
    pause
    exit /b 1
)

echo Node.js and npm are available
echo.

:: Check if node_modules exists
if not exist "node_modules" (
    echo Installing dependencies...
    npm install
    if %errorlevel% neq 0 (
        echo Error: Failed to install dependencies
        pause
        exit /b 1
    )
)

echo Starting React development server...
echo.
echo The application will open in your browser at http://localhost:3000
echo Press Ctrl+C to stop the server
echo.

:: Start the React application
npm start

pause 