@echo off
:: Run TCP Proxy with administrator privileges on Windows

:: Check for admin privileges
NET SESSION >nul 2>&1
IF %ERRORLEVEL% NEQ 0 (
    echo This script requires administrator privileges to bind to port 80.
    echo Right-click on this batch file and select "Run as administrator".
    pause
    exit /b 1
)

:: Get the directory where the script is located
cd /d "%~dp0"

:: Run the proxy
echo Starting TCP Proxy with port 80 forwarding...
python tcp_proxy.py %*
pause 