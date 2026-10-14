@echo off
setlocal
cd /d "%~dp0"

rem ============================================
rem  Alpha Resource Hub - local server launcher
rem  Double-click this file. The site opens
rem  automatically in your browser.
rem ============================================

rem --- Find Python -------------------------------------------------
set "PY="
python --version >nul 2>nul
if not errorlevel 1 set "PY=python"
if not defined PY (
    py -3 --version >nul 2>nul
    if not errorlevel 1 set "PY=py -3"
)

rem --- Start the server --------------------------------------------
if defined PY goto :startpython
where npx >nul 2>nul
if not errorlevel 1 goto :startnode
goto :nopython

:startpython
echo Starting server with Python...
start "Alpha Hub server - do not close" /min %PY% -m http.server 8080
goto :wait

:startnode
echo Python was not found - using Node.js http-server instead...
echo The first run may download a package, please wait...
start "Alpha Hub server - do not close" /min cmd /c "npx --yes http-server -p 8080 -c-1"
goto :wait

:nopython
echo.
echo  ERROR: Python was not found on this computer.
echo  Install it from https://www.python.org/downloads/windows/
echo  and tick "Add python.exe to PATH" during setup.
echo.
pause
exit /b 1

:wait
echo Waiting for the server to start...
where curl >nul 2>nul
if not errorlevel 1 goto :poll
ping -n 5 127.0.0.1 >nul
goto :opensite

:poll
set /a tries=0
:pollloop
curl -s -o nul --max-time 2 http://localhost:8080
if not errorlevel 1 goto :opensite
set /a tries+=1
ping -n 2 127.0.0.1 >nul
if %tries% lss 20 goto :pollloop
echo.
echo  ERROR: The server did not start.
echo  Check if port 8080 is already in use, then try again.
echo.
pause
exit /b 1

:opensite
start "" http://localhost:8080
echo.
echo  Done! The site is open in your browser at http://localhost:8080
echo.
echo  - The server runs in the minimized "Alpha Hub server" window.
echo  - Close that window whenever you want to stop the server.
echo.
pause
exit /b 0
