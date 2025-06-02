@echo off
setlocal

echo ===============================
echo API Mock Mode Manager
echo ===============================
echo.
echo This script helps you toggle the API mock mode for testing the application without
echo the Golang API backend running.
echo.
echo Current Mode:
php artisan api:mock status
echo.
echo Options:
echo 1. Turn ON API mock mode (for testing without Golang API)
echo 2. Turn OFF API mock mode (for normal operation with Golang API)
echo 3. Exit
echo.

set /p choice=Enter your choice (1-3): 

if "%choice%"=="1" (
    php artisan api:mock on
    echo.
    echo API mock mode has been turned ON.
    echo The application will now use mocked API responses.
    echo You can develop and test WITHOUT the Golang API running.
)

if "%choice%"=="2" (
    php artisan api:mock off
    echo.
    echo API mock mode has been turned OFF.
    echo The application will now connect to the real Golang API.
    echo Make sure the Golang API is running before testing.
)

if "%choice%"=="3" (
    echo Exiting...
    goto :eof
)

echo.
echo Press any key to exit...
pause > nul
endlocal
