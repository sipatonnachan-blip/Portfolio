@echo off
REM Build script for NEON STRIKE - 2D Shooter
REM Tries MinGW g++ first, then MSVC cl.exe.

where g++ >nul 2>nul
if %ERRORLEVEL%==0 (
    echo [build] Using g++
    g++ -O2 -std=c++17 ShooterGame.cpp -o NeonStrike.exe ^
        -lgdiplus -lgdi32 -lwinmm -lmsimg32 -luser32 -mwindows
    if %ERRORLEVEL%==0 (
        echo.
        echo [ok] Built NeonStrike.exe - run it with: NeonStrike.exe
    ) else (
        echo [fail] g++ reported errors above.
    )
    exit /b %ERRORLEVEL%
)

where cl >nul 2>nul
if %ERRORLEVEL%==0 (
    echo [build] Using cl.exe (MSVC)
    cl /nologo /O2 /EHsc /std:c++17 ShooterGame.cpp /Fe:NeonStrike.exe /link ^
        gdiplus.lib winmm.lib msimg32.lib user32.lib gdi32.lib
    if %ERRORLEVEL%==0 (
        echo.
        echo [ok] Built NeonStrike.exe - run it with: NeonStrike.exe
    ) else (
        echo [fail] cl reported errors above.
    )
    exit /b %ERRORLEVEL%
)

echo.
echo [fail] No C++ compiler found on PATH.
echo.
echo Install one of these, then re-run build.bat:
echo.
echo   Option A - MSYS2 / MinGW (recommended, ~250MB):
echo     1) Download from https://www.msys2.org and install
echo     2) Open "MSYS2 MINGW64" shell and run:
echo            pacman -S --needed mingw-w64-x86_64-gcc
echo     3) Add C:\msys64\mingw64\bin to your Windows PATH
echo     4) Re-open this terminal and run build.bat
echo.
echo   Option B - Visual Studio Build Tools:
echo     1) Install "Build Tools for Visual Studio" (free)
echo     2) Open "x64 Native Tools Command Prompt"
echo     3) cd to this folder and run build.bat
echo.
exit /b 1
