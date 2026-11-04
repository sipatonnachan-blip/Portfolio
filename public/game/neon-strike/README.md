# NEON STRIKE - 2D Action Shooter (C++)

A single-file Win32 + GDI+ 2D side-scrolling shooter. No external libraries, no asset files - everything is drawn procedurally so it compiles and runs from one `.cpp`.

## Features

- **Smooth character animation** - procedural stickman-style humanoid with:
  - Idle breathing bob
  - Walk and sprint cycles (leg/arm swing, foot plant)
  - Jump and double-jump (dust puffs on launch)
  - Aim-tracking front arm that follows the mouse 360 degrees
- **Three weapons**
  - **Pistol** - accurate, fast reload
  - **SMG** - rapid fire, wide spread, heavy recoil
  - **Shotgun** - 7 pellets, screen-shaking boom
- **Combat juice**
  - Muzzle flash sprites + smoke puffs
  - Glowing tracers with motion-trails
  - Hit sparks and damage pop-up numbers
  - Screen shake and recoil kick
  - Full-screen hurt vignette when damaged
- **Enemy variety** - 4 enemy types, each with its own HP, speed, and aim behavior:
  - *Grunt* - balanced ground chaser
  - *Runner* - fast, fragile
  - *Brute* - slow, tanky, high-damage
  - *Sniper* - long sightlines, slow cadence, high damage
- **Wave-based progression** - difficulty scales, +25 HP between waves, running score and kill count
- **Parallax background** - 4 scroll speeds: twinkling stars, distant skyline, mid-range hills, foreground neon pillars with vertical gradients and bloom-style glow
- **Platforming** - gravity, floating platforms, world is ~4000 px wide with smooth camera follow
- **Polished UI** - gradient HP bar, weapon panel with reload progress, animated wave banners, custom crosshair, menu / pause / game-over screens

## Controls

| Input | Action |
|---|---|
| `A` / `D` or arrows | Move left / right |
| `Shift` | Sprint |
| `Space` / `W` | Jump (double-jump) |
| Mouse | Aim |
| Left click | Fire |
| `R` | Reload |
| `1` / `2` / `3` | Switch to Pistol / SMG / Shotgun |
| `P` / `Esc` | Pause |
| `Enter` | Start / Restart |

## Build

No C++ compiler is currently installed on this machine. Install one, then run `build.bat`:

### Option A - MSYS2 / MinGW-w64 (recommended)
1. Download and install MSYS2: https://www.msys2.org
2. Open "MSYS2 MINGW64" shell and run:
   ```
   pacman -S --needed mingw-w64-x86_64-gcc
   ```
3. Add `C:\msys64\mingw64\bin` to your Windows `PATH`.
4. Open a new PowerShell in this folder and run `.\build.bat`.

### Option B - MSVC (Visual Studio Build Tools)
1. Install the free "Build Tools for Visual Studio".
2. Open the "x64 Native Tools Command Prompt".
3. `cd` into this folder and run `build.bat`.

Then launch it with:
```
.\NeonStrike.exe
```

## Files

- [ShooterGame.cpp](ShooterGame.cpp) - the entire game (one translation unit)
- [build.bat](build.bat) - auto-detects compiler and builds `NeonStrike.exe`
- [README.md](README.md) - this file
