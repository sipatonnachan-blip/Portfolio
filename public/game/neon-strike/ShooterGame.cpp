// =====================================================================
//  NEON STRIKE - 2D Action Shooter
//  Single-file Win32 + GDI+ game. No external dependencies.
//
//  Build (MinGW/MSYS2):
//      g++ -O2 -std=c++17 ShooterGame.cpp -o NeonStrike.exe ^
//          -lgdiplus -lgdi32 -lwinmm -lmsimg32 -mwindows
//
//  Build (MSVC x64 Developer Prompt):
//      cl /O2 /EHsc /std:c++17 ShooterGame.cpp /link ^
//          gdiplus.lib winmm.lib msimg32.lib user32.lib gdi32.lib
//
//  Controls:
//      A / D or Left / Right  - move
//      Space / W              - jump  (double-jump supported)
//      Left Shift             - sprint
//      Mouse                  - aim
//      Left mouse button      - fire
//      R                      - reload
//      1 / 2 / 3              - switch weapon (Pistol / SMG / Shotgun)
//      P or Esc               - pause
//      Enter                  - start / restart
// =====================================================================

#define NOMINMAX
#include <windows.h>
#include <windowsx.h>
#include <objidl.h>
#include <gdiplus.h>
#include <mmsystem.h>
#include <vector>
#include <string>
#include <cmath>
#include <algorithm>
#include <random>
#include <chrono>
#include <cstdint>

using namespace Gdiplus;

// ---------- global config ----------
static const int   SCREEN_W   = 1280;
static const int   SCREEN_H   = 720;
static const int   WORLD_W    = 4096;    // world wraps / is wider than screen
static const float GRAVITY    = 1700.0f;
static const float JUMP_VEL   = -720.0f;
static const float MOVE_SPEED = 330.0f;
static const float SPRINT_MUL = 1.55f;
static const float PI         = 3.14159265358979323846f;

// ---------- utility ----------
static std::mt19937 rng((unsigned)std::chrono::steady_clock::now().time_since_epoch().count());
static float frand(float a, float b) { return a + (b - a) * (rng() / (float)rng.max()); }
static int   irand(int a, int b)     { std::uniform_int_distribution<int> d(a, b); return d(rng); }
static float clampf(float v, float lo, float hi) { return v < lo ? lo : (v > hi ? hi : v); }

struct Vec2 { float x, y; Vec2(float x=0, float y=0):x(x),y(y){} };
static float len(Vec2 v) { return std::sqrt(v.x*v.x + v.y*v.y); }
static Vec2  norm(Vec2 v){ float L = len(v); return L > 1e-6f ? Vec2(v.x/L, v.y/L) : Vec2(); }

// ---------- game objects ----------
enum WeaponType {
    WPN_PISTOL=0, WPN_LASER=1, WPN_MG=2, WPN_CROSSBOW=3,
    WPN_WAND=4,   WPN_FIREBALL=5, WPN_COUNT=6
};
struct Weapon {
    const wchar_t* name;
    float   fireDelay;
    int     magSize;
    float   reloadTime;
    float   bulletSpeed;
    float   damage;
    float   spread;
    int     pelletsPerShot;
    int     muzzleFlashLen;
    Color   tracerColor;
    bool    isBeam;
    float   beamRange;
    float   beamAmmoPerSec;
    float   projGravity;
    int     piercing;
    bool    isBolt;
    bool    isMagic;
    bool    isFireball;        // explodes on impact with area damage
    float   explosionRadius;
    float   explosionDmg;      // peak damage at center of blast
};
static const Weapon WEAPONS[WPN_COUNT] = {
    { L"Pistol",      0.18f,  14, 0.9f, 1600.0f,  34.0f, 0.015f, 1, 22,
      Color(255,180,240,255), false, 0.0f,    0.0f,   0.0f, 0, false, false, false, 0, 0 },
    { L"Laser Beam",  0.0f,  120, 1.6f,    0.0f, 180.0f, 0.0f,   1, 0,
      Color(255,120,255,255), true,  1500.0f, 40.0f,  0.0f, 0, false, false, false, 0, 0 },
    { L"Machine Gun", 0.06f,  60, 1.9f, 1700.0f,  15.0f, 0.10f,  1, 18,
      Color(255,255,210,120), false, 0.0f,    0.0f,   0.0f, 0, false, false, false, 0, 0 },
    { L"Crossbow",    0.70f,   5, 2.1f, 1500.0f,  95.0f, 0.005f, 1, 0,
      Color(255,220,200,160), false, 0.0f,    0.0f,  120.0f, 2, true,  false, false, 0, 0 },
    { L"Magic Wand",  0.32f,  20, 1.8f, 1100.0f,  50.0f, 0.02f,  1, 0,
      Color(255,200,120,255), false, 0.0f,    0.0f,    0.0f, 1, false, true,  false, 0, 0 },
    // Fireball - slow heavy projectile that explodes with AoE damage falloff
    { L"Fireball",    0.60f,   8, 2.0f,  900.0f,  60.0f, 0.03f,  1, 0,
      Color(255,255,150, 70), false, 0.0f,    0.0f,   60.0f, 0, false, false, true, 150.0f, 80.0f },
};

// Map themes - each portal transitions to the next theme in the cycle.
struct MapTheme {
    const wchar_t* name;
    Color skyTop, skyBottom;
    Color farShape, midShape;
    Color pillarA, pillarB;
    Color groundColor;
    Color platformColor;
    Color fogColor;
    Color starColor;
};
static const MapTheme MAP_THEMES[] = {
    { L"NEON CITY",
      Color(255, 12, 8, 36),   Color(255, 70, 20, 90),
      Color(255, 32, 26, 55),  Color(255, 55, 40, 95),
      Color(255, 255, 70, 170), Color(255, 80, 220, 255),
      Color(255, 32, 28, 48),  Color(255, 60, 40, 90),
      Color(140, 40, 20, 60),  Color(255, 255, 255, 255) },
    { L"LAVA FIELDS",
      Color(255, 30, 6, 10),   Color(255, 180, 60, 30),
      Color(255, 70, 20, 10),  Color(255, 120, 45, 15),
      Color(255, 255, 160, 60), Color(255, 255, 90, 20),
      Color(255, 50, 18, 12),  Color(255, 90, 40, 25),
      Color(140, 110, 40, 10), Color(255, 255, 220, 100) },
    { L"ICE CAVERNS",
      Color(255, 20, 28, 52),  Color(255, 55, 90, 160),
      Color(255, 40, 60, 100), Color(255, 70, 110, 160),
      Color(255, 200, 240, 255), Color(255, 130, 200, 255),
      Color(255, 30, 55, 100), Color(255, 60, 110, 170),
      Color(130, 110, 170, 220), Color(255, 220, 240, 255) },
    { L"VERDANT GROVE",
      Color(255, 15, 25, 15),  Color(255, 50, 110, 40),
      Color(255, 25, 55, 20),  Color(255, 40, 85, 30),
      Color(255, 200, 240, 100), Color(255, 110, 200, 70),
      Color(255, 22, 42, 20),  Color(255, 55, 90, 40),
      Color(140, 50, 110, 30), Color(255, 220, 255, 180) },
};
static const int NUM_THEMES = sizeof(MAP_THEMES) / sizeof(MAP_THEMES[0]);

// Perks: permanent upgrades granted by boss drops.
enum PerkId {
    PK_TWIN_SHOT = 0,
    PK_RAPID_FIRE,
    PK_HEAVY_ROUNDS,
    PK_DEEP_MAGS,
    PK_BLAST_RADIUS,
    PK_VAMPIRE,
    PK_STEADY_AIM,
    PK_COUNT
};
static const wchar_t* PERK_NAMES[PK_COUNT] = {
    L"TWIN SHOT", L"RAPID FIRE", L"HEAVY ROUNDS",
    L"DEEP MAGS", L"BLAST RADIUS", L"VAMPIRE", L"STEADY AIM"
};
struct Perks {
    std::vector<int> owned;
    int   extraBullets = 0;
    float fireDelayMul = 1.0f;
    float spreadMul    = 1.0f;
    float damageMul    = 1.0f;
    float magSizeMul   = 1.0f;
    float blastMul     = 1.0f;
    int   lifesteal    = 0;
    bool  has(int id) const {
        for (int x : owned) if (x == id) return true;
        return false;
    }
    bool apply(int id) {
        bool already = has(id);
        if (already && id != PK_TWIN_SHOT && id != PK_VAMPIRE) return false;
        owned.push_back(id);
        switch (id) {
            case PK_TWIN_SHOT:    extraBullets++;         break;
            case PK_RAPID_FIRE:   fireDelayMul *= 0.72f;  break;
            case PK_HEAVY_ROUNDS: damageMul    *= 1.30f;  break;
            case PK_DEEP_MAGS:    magSizeMul   *= 1.60f;  break;
            case PK_BLAST_RADIUS: blastMul     *= 1.50f;  break;
            case PK_VAMPIRE:      lifesteal    += 4;      break;
            case PK_STEADY_AIM:   spreadMul    *= 0.40f;  break;
        }
        return true;
    }
};

struct Player {
    Vec2  pos, vel;
    bool  onGround = false;
    int   facing = 1;        // -1 left, +1 right
    float hp = 100.0f, hpMax = 100.0f;
    float animT = 0.0f;
    float muzzleT = 0.0f;
    bool  moving = false, sprinting = false;
    int   jumpsLeft = 2;
    int   weapon = WPN_PISTOL;
    int   ammo[WPN_COUNT];
    bool  reloading = false;
    float reloadT = 0.0f;
    float fireCd = 0.0f;
    float aimAngle = 0.0f;
    float hurtFlash = 0.0f;
    int   score = 0;
    int   wave = 1;
    int   kills = 0;
    float shake = 0.0f;
    float armor = 50.0f;
    float armorMax = 100.0f;
    // Laser beam state
    bool  laserActive = false;
    Vec2  laserEnd;
    float laserAmmoAccum = 0.0f;
    float laserTickT = 0.0f;
    float laserPhase = 0.0f;
    // Leveling
    int   level = 1;
    float xp = 0.0f;
    float xpToNext = 50.0f;
    float levelUpFlash = 0.0f;
    float powerBoostT = 0.0f;
    float powerBoostMax = 3.0f;
    Perks perks;
    float damageMul() const {
        float boost = (powerBoostT > 0.0f) ? 1.75f : 1.0f;
        return (1.0f + (level - 1) * 0.18f) * boost * perks.damageMul;
    }
    float hpBonus()   const { return (level - 1) * 15.0f; }
    int   effectiveMagSize(int w) const {
        return std::max(1, (int)(WEAPONS[w].magSize * perks.magSizeMul));
    }
    // Lightning skill
    float lightningCd = 0.0f;
    float lightningMax = 3.5f;
};

struct Bullet {
    Vec2  pos, vel;
    float life = 1.2f;
    float dmg = 20.0f;
    bool  fromPlayer = true;
    Color color = Color(255,220,255,255);
    float trail = 0.0f;
    std::vector<Vec2> trailPts;
    int   pierces = 0;
    float gravity = 0.0f;
    bool  isBolt = false;
    bool  isMagic = false;
    bool  isFireball = false;
    float explosionRadius = 0.0f;
    float explosionDmg = 0.0f;
    float spinPhase = 0.0f;
};

// Chain lightning: a set of polyline arcs from caster through chained targets.
struct LightningArc {
    std::vector<Vec2> points;
};
struct LightningStrike {
    std::vector<LightningArc> arcs;
    float life = 0.45f, maxLife = 0.45f;
};

// Pickups that drop from killed enemies
enum PickupKind { PU_HP = 0, PU_AMMO = 1, PU_ARMOR = 2, PU_PERK = 3 };
struct Pickup {
    Vec2  pos, vel;
    int   kind;
    float life = 14.0f;
    float bob = 0.0f;
    bool  onGround = false;
};

enum EnemyKind { E_GRUNT, E_RUNNER, E_BRUTE, E_SNIPER, E_BOSS };
struct Enemy {
    Vec2  pos, vel;
    float hp = 50.0f, hpMax = 50.0f;
    bool  onGround = false;
    int   facing = -1;
    EnemyKind kind = E_GRUNT;
    float fireCd = 0.0f;
    float animT = 0.0f;
    float hurtFlash = 0.0f;
    float w = 42.0f, h = 70.0f;
    float moveSpeed = 160.0f;
    float sightRange = 900.0f;
    Color bodyColor = Color(255,210,70,70);
    int   weaponSprite = -1;   // drawWeapon code (-1 rifle, -3 pistol, -4 shotgun, -5 sniper, -6/-7/-8 boss)
    int   bossWeapon = 0;      // 0=Rocket, 1=Laser Cannon, 2=Minigun (used when kind==E_BOSS)
};

struct Particle {
    Vec2  pos, vel;
    float life = 1.0f, maxLife = 1.0f;
    float size = 3.0f;
    Color color = Color(255,255,255,255);
    float gravity = 0.0f;
    bool  additive = true;
    float rot = 0.0f, rotVel = 0.0f;
};

struct Platform {
    float x, y, w, h;
    Color color;
    bool  solid = true;
};

struct PopText {
    Vec2 pos; std::wstring text; float life, maxLife; Color color; float vy;
};

// Parallax layer entry
struct BgShape { float x, y, w, h; Color color; int type; };

enum GameState { GS_MENU, GS_PLAY, GS_PAUSE, GS_OVER };

// ---------- the game ----------
struct Game {
    Player player;
    std::vector<Bullet>   bullets;
    std::vector<Enemy>    enemies;
    std::vector<Particle> particles;
    std::vector<Platform> platforms;
    std::vector<PopText>  pops;
    std::vector<LightningStrike> strikes;
    std::vector<Pickup> pickups;
    std::vector<BgShape>  bgFar, bgMid, bgNear; // parallax layers
    std::vector<Vec2>     stars;                // twinkling stars

    GameState state = GS_MENU;
    float camX = 0.0f;
    Vec2  mouse = Vec2(SCREEN_W/2, SCREEN_H/2);
    bool  mouseDown = false;
    bool  keyLeft=false, keyRight=false, keyJump=false, keySprint=false;

    int   wave = 1;
    int   enemiesToSpawn = 0;
    float spawnTimer = 0.0f;
    float waveBannerT = 0.0f;
    std::wstring waveBannerText;
    bool  bossSpawnedThisWave = false;
    int   mapTheme = 0;
    bool  portalActive = false;
    Vec2  portalPos;
    float portalT = 0.0f;
    float teleportFlash = 0.0f;

    float time = 0.0f;
    float lastFrameMs = 0.0f;

    void buildWorld(int theme = 0) {
        mapTheme = theme;
        const MapTheme& T = MAP_THEMES[theme];
        platforms.clear();
        // Ground
        platforms.push_back({ -200.0f, 620.0f, (float)WORLD_W + 400.0f, 100.0f,
                              T.groundColor, true });
        // Floating platforms - layout varies by theme for visual variety
        float neon[]  = { 500.0f, 400.0f, 300.0f, 470.0f, 350.0f, 520.0f, 420.0f, 310.0f };
        float lava[]  = { 480.0f, 380.0f, 520.0f, 340.0f, 440.0f, 500.0f, 390.0f, 300.0f };
        float ice[]   = { 460.0f, 330.0f, 500.0f, 290.0f, 420.0f, 350.0f, 510.0f, 380.0f };
        float grove[] = { 520.0f, 420.0f, 490.0f, 340.0f, 400.0f, 470.0f, 310.0f, 450.0f };
        float* ys = (theme == 1) ? lava : (theme == 2) ? ice : (theme == 3) ? grove : neon;
        int platformCount = (theme == 2) ? 24 : 20;
        float spacing = (theme == 2) ? 160.0f : 190.0f;
        for (int i = 0; i < platformCount; ++i) {
            float x = 200.0f + i * spacing + frand(-30.0f, 30.0f);
            float y = ys[i % 8];
            float w = frand(120.0f, 220.0f);
            Color c(255,
                    (BYTE)clampf(T.platformColor.GetR() + irand(-15, 20), 0, 255),
                    (BYTE)clampf(T.platformColor.GetG() + irand(-15, 20), 0, 255),
                    (BYTE)clampf(T.platformColor.GetB() + irand(-15, 20), 0, 255));
            platforms.push_back({ x, y, w, 20.0f, c, true });
        }

        // Parallax layers
        bgFar.clear(); bgMid.clear(); bgNear.clear(); stars.clear();
        for (int i = 0; i < 160; ++i)
            stars.push_back(Vec2(frand(0.0f, (float)WORLD_W), frand(10.0f, 350.0f)));

        for (int i = 0; i < 40; ++i) {
            float x = i * 160.0f + frand(-40.0f, 40.0f);
            float h = frand(180.0f, 320.0f);
            bgFar.push_back({ x, 620.0f - h, 200.0f, h, T.farShape, 0 });
        }
        for (int i = 0; i < 30; ++i) {
            float x = i * 200.0f + frand(-30.0f, 30.0f);
            float h = frand(140.0f, 240.0f);
            bgMid.push_back({ x, 620.0f - h, 260.0f, h, T.midShape, 0 });
        }
        for (int i = 0; i < 24; ++i) {
            float x = i * 220.0f + frand(-20.0f, 20.0f);
            float h = frand(100.0f, 200.0f);
            Color c = (i & 1) ? T.pillarA : T.pillarB;
            bgNear.push_back({ x, 620.0f - h, 14.0f, h, c, 1 });
        }
    }

    void resetPlayer() {
        player = Player();
        player.pos = Vec2(300.0f, 400.0f);
        player.hpMax = 100.0f; player.hp = 100.0f;
        for (int w = 0; w < WPN_COUNT; ++w)
            player.ammo[w] = player.effectiveMagSize(w);
        player.weapon = WPN_PISTOL;
        player.wave = 1; player.score = 0; player.kills = 0;
        player.level = 1; player.xp = 0.0f; player.xpToNext = 50.0f;
        player.armor = 50.0f; player.armorMax = 100.0f;
        player.lightningCd = 0.0f;
    }

    void start() {
        buildWorld(0);
        resetPlayer();
        bullets.clear(); enemies.clear(); particles.clear(); pops.clear(); strikes.clear(); pickups.clear();
        portalActive = false; portalT = 0.0f; teleportFlash = 0.0f;
        wave = 1; enemiesToSpawn = 0; spawnTimer = 0.0f;
        startWave(1);
        state = GS_PLAY;
    }

    void startWave(int w) {
        wave = w;
        player.wave = w;
        enemiesToSpawn = 3 + w * 2;
        spawnTimer = 0.5f;
        waveBannerT = 2.2f;
        waveBannerText = L"WAVE " + std::to_wstring(w);
        bossSpawnedThisWave = false;
    }

    void spawnPortal() {
        float px = clampf(player.pos.x + frand(-200.0f, 200.0f),
                          200.0f, (float)WORLD_W - 200.0f);
        portalPos = Vec2(px, 560.0f);  // sits above the ground
        portalActive = true;
        portalT = 0.0f;
        waveBannerT = 2.6f;
        waveBannerText = L"WAVE " + std::to_wstring(wave) + L" CLEAR   PORTAL OPENS";
        // Opening blast of particles at portal location
        for (int i = 0; i < 60; ++i) {
            Particle p;
            p.pos = portalPos;
            float a = frand(0, 2 * PI);
            float s = frand(60.0f, 220.0f);
            p.vel = Vec2(std::cos(a) * s, std::sin(a) * s);
            p.life = p.maxLife = frand(0.5f, 1.0f);
            p.size = frand(2.0f, 5.0f);
            p.color = Color(255, 180, 230, 255);
            particles.push_back(p);
        }
    }

    void teleport() {
        int newTheme = (mapTheme + 1) % NUM_THEMES;
        int newWave  = wave + 1;
        // Grace rewards
        player.hp    = std::min(player.hpMax,    player.hp + 40.0f);
        player.armor = std::min(player.armorMax, player.armor + 30.0f);
        addPop(Vec2(player.pos.x, player.pos.y - 110.0f),
               L"+40 HP  +30 ARMOR", Color(255, 120, 255, 180));
        buildWorld(newTheme);
        // Reset transient play state (no lingering bullets/pickups across maps)
        bullets.clear();
        pickups.clear();
        strikes.clear();
        particles.clear();
        // Drop the player at left edge of the new map
        player.pos = Vec2(300.0f, 400.0f);
        player.vel = Vec2(0, 0);
        camX = 0.0f;
        portalActive = false;
        teleportFlash = 1.0f;
        startWave(newWave);
        waveBannerText = std::wstring(MAP_THEMES[newTheme].name) +
                         L"   WAVE " + std::to_wstring(newWave);
        waveBannerT = 2.6f;
        // Arrival sparkle
        for (int i = 0; i < 80; ++i) {
            Particle p;
            p.pos = Vec2(player.pos.x, player.pos.y - 40.0f);
            float a = frand(0, 2 * PI);
            float s = frand(140.0f, 420.0f);
            p.vel = Vec2(std::cos(a) * s, std::sin(a) * s);
            p.life = p.maxLife = frand(0.4f, 0.9f);
            p.size = frand(3.0f, 6.0f);
            p.color = Color(255, 200, 150, 255);
            particles.push_back(p);
        }
    }

    void spawnBoss() {
        Enemy b;
        b.kind = E_BOSS;
        b.hp = b.hpMax = 450.0f + wave * 130.0f;
        b.pos = Vec2(clampf(player.pos.x + (frand(0,1) > 0.5f ? 900.0f : -900.0f),
                            80.0f, (float)WORLD_W - 80.0f), 300.0f);
        b.w = 90.0f; b.h = 118.0f;
        b.moveSpeed = 95.0f;
        b.sightRange = 2000.0f;
        b.bodyColor = Color(255, 120, 40, 200);
        b.bossWeapon = (wave - 1) % 3;
        b.weaponSprite = -6 - b.bossWeapon; // -6, -7, -8
        enemies.push_back(b);
        const wchar_t* bossWeaponName[] = { L"ROCKETEER", L"ARC OVERLORD", L"MINIGUN KING" };
        waveBannerT = 2.6f;
        waveBannerText = L"WAVE " + std::to_wstring(wave) + L"  BOSS - "
                       + bossWeaponName[b.bossWeapon];
        player.shake = std::max(player.shake, 12.0f);
    }

    void spawnEnemy() {
        Enemy e;
        float side = (frand(0,1) > 0.5f) ? 1.0f : -1.0f;
        e.pos.x = player.pos.x + side * frand(500.0f, 800.0f);
        e.pos.x = clampf(e.pos.x, 40.0f, (float)WORLD_W - 40.0f);
        e.pos.y = 300.0f;
        float r = frand(0,1);
        if (r < 0.55f) {
            e.kind = E_GRUNT;
            e.hp = e.hpMax = 50.0f + wave * 8.0f;
            e.moveSpeed = 150.0f;
            e.w = 42.0f; e.h = 70.0f;
            e.bodyColor = Color(255, 220, 80, 80);
            e.weaponSprite = -1; // rifle
        } else if (r < 0.8f) {
            e.kind = E_RUNNER;
            e.hp = e.hpMax = 35.0f + wave * 5.0f;
            e.moveSpeed = 280.0f;
            e.w = 36.0f; e.h = 64.0f;
            e.bodyColor = Color(255, 255, 160, 60);
            e.weaponSprite = -3; // pistol
        } else if (r < 0.92f) {
            e.kind = E_BRUTE;
            e.hp = e.hpMax = 160.0f + wave * 14.0f;
            e.moveSpeed = 95.0f;
            e.w = 60.0f; e.h = 86.0f;
            e.bodyColor = Color(255, 160, 60, 220);
            e.weaponSprite = -4; // shotgun
        } else {
            e.kind = E_SNIPER;
            e.hp = e.hpMax = 45.0f + wave * 6.0f;
            e.moveSpeed = 110.0f;
            e.w = 40.0f; e.h = 70.0f;
            e.bodyColor = Color(255, 90, 230, 230);
            e.sightRange = 1400.0f;
            e.weaponSprite = -5; // sniper rifle
        }
        enemies.push_back(e);
    }

    void handleInput(float dt) {
        float mv = 0.0f;
        if (keyLeft)  mv -= 1.0f;
        if (keyRight) mv += 1.0f;
        float spd = MOVE_SPEED * (keySprint ? SPRINT_MUL : 1.0f);
        player.vel.x = mv * spd;
        player.moving = mv != 0.0f;
        player.sprinting = keySprint && player.moving;
        if (mv != 0.0f) player.facing = (mv > 0) ? 1 : -1;

        if (keyJump) {
            if (player.onGround) {
                player.vel.y = JUMP_VEL;
                player.onGround = false;
                player.jumpsLeft = 1;
                spawnJumpDust(player.pos);
            } else if (player.jumpsLeft > 0) {
                player.vel.y = JUMP_VEL * 0.9f;
                player.jumpsLeft--;
                spawnJumpDust(player.pos);
            }
            keyJump = false;
        }

        // Aim angle from shoulder -> mouse (world space)
        Vec2 worldMouse(mouse.x + camX, mouse.y);
        Vec2 anchor = playerAimAnchor();
        Vec2 d = { worldMouse.x - anchor.x, worldMouse.y - anchor.y };
        player.aimAngle = std::atan2(d.y, d.x);
        if (worldMouse.x < player.pos.x) player.facing = -1;
        else if (worldMouse.x > player.pos.x) player.facing = 1;

        // Fire
        const Weapon& W = WEAPONS[player.weapon];
        bool infinite = (player.weapon == WPN_WAND);
        if (mouseDown && !player.reloading) {
            if (W.isBeam) {
                if (player.ammo[player.weapon] > 0) fireLaser(dt);
                else beginReload();
            } else if (player.fireCd <= 0.0f) {
                if (infinite || player.ammo[player.weapon] > 0) {
                    fireWeapon();
                    if (!infinite) {
                        player.ammo[player.weapon]--;
                        if (player.ammo[player.weapon] == 0) beginReload();
                    }
                    player.fireCd = W.fireDelay * player.perks.fireDelayMul;
                } else {
                    beginReload();
                }
            }
        }
        player.laserActive = mouseDown && W.isBeam && !player.reloading &&
                             player.ammo[player.weapon] > 0;
        if (!player.laserActive) player.laserAmmoAccum = 0.0f;
    }

    // Shoulder: the stable pivot used for aim calculations (does NOT depend on aimAngle).
    Vec2 playerAimAnchor() const {
        float torsoCenterY = player.pos.y - 42.0f;
        float shoulderX    = player.pos.x + player.facing * 4.0f;
        float shoulderY    = torsoCenterY - 28.0f / 2.0f + 6.0f;
        return Vec2(shoulderX, shoulderY);
    }
    // Muzzle: the end of the actual drawn barrel for the current weapon.
    Vec2 playerMuzzlePos() const {
        Vec2 sh = playerAimAnchor();
        const float armLen = 22.0f;
        float barrelLen;
        switch (player.weapon) {
            case WPN_PISTOL:   barrelLen = 26.0f; break;
            case WPN_LASER:    barrelLen = 52.0f; break;
            case WPN_MG:       barrelLen = 51.0f; break;
            case WPN_CROSSBOW: barrelLen = 50.0f; break;
            case WPN_WAND:     barrelLen = 32.0f; break;
            case WPN_FIREBALL: barrelLen = 34.0f; break;
            default:           barrelLen = 30.0f;
        }
        float d = armLen + barrelLen;
        return Vec2(sh.x + std::cos(player.aimAngle) * d,
                    sh.y + std::sin(player.aimAngle) * d);
    }

    void beginReload() {
        if (player.reloading) return;
        if (player.weapon == WPN_WAND) return;
        if (player.ammo[player.weapon] >= player.effectiveMagSize(player.weapon)) return;
        player.reloading = true;
        player.reloadT = WEAPONS[player.weapon].reloadTime;
    }

    // Shoulder of an enemy - mirrors drawHumanoid's front shoulder geometry.
    static Vec2 enemyShoulder(const Enemy& e) {
        float scale = (e.kind == E_BOSS) ? 1.7f : 1.0f;
        float torsoCenterY = e.pos.y - 42.0f * scale;
        float shoulderX    = e.pos.x + e.facing * 4.0f * scale;
        float shoulderY    = torsoCenterY - 28.0f * scale / 2.0f + 6.0f * scale;
        return Vec2(shoulderX, shoulderY);
    }
    // Muzzle position of an enemy's drawn weapon at the given aim angle.
    static Vec2 enemyMuzzle(const Enemy& e, float aimAngle) {
        float scale = (e.kind == E_BOSS) ? 1.7f : 1.0f;
        float barrelLen;
        switch (e.weaponSprite) {
            case -3: barrelLen = 24.0f; break;   // enemy pistol
            case -4: barrelLen = 45.0f; break;   // enemy shotgun
            case -5: barrelLen = 58.0f; break;   // enemy sniper
            case -6: barrelLen = 56.0f; break;   // boss rocket launcher
            case -7: barrelLen = 60.0f; break;   // boss arc cannon
            case -8: barrelLen = 61.0f; break;   // boss minigun
            default: barrelLen = 32.0f;          // enemy rifle (-1)
        }
        float d = 22.0f * scale + barrelLen * scale;
        Vec2 sh = enemyShoulder(e);
        return Vec2(sh.x + std::cos(aimAngle) * d,
                    sh.y + std::sin(aimAngle) * d);
    }

    // Ray vs axis-aligned box. Returns distance to nearest hit, or -1 if miss.
    static float rayVsAABB(Vec2 ro, Vec2 rd, float x, float y, float w, float h) {
        float invx = (std::abs(rd.x) < 1e-6f) ? 1e9f : 1.0f / rd.x;
        float invy = (std::abs(rd.y) < 1e-6f) ? 1e9f : 1.0f / rd.y;
        float t1 = (x - ro.x) * invx;
        float t2 = (x + w - ro.x) * invx;
        float t3 = (y - ro.y) * invy;
        float t4 = (y + h - ro.y) * invy;
        float tmin = std::max(std::min(t1, t2), std::min(t3, t4));
        float tmax = std::min(std::max(t1, t2), std::max(t3, t4));
        if (tmax < 0.0f || tmin > tmax) return -1.0f;
        return tmin < 0.0f ? 0.0f : tmin;
    }

    void gainXp(float amount) {
        player.xp += amount;
        bool leveled = false;
        while (player.xp >= player.xpToNext) {
            player.xp -= player.xpToNext;
            player.level++;
            player.xpToNext = 50.0f + player.level * 35.0f;
            // New level: bigger HP pool + full heal + flash
            float newMax = 100.0f + player.hpBonus();
            player.hpMax = newMax;
            player.hp = newMax;
            player.levelUpFlash = 1.2f;
            player.powerBoostT = player.powerBoostMax;
            player.shake = std::max(player.shake, 8.0f);
            // Celebratory burst
            for (int i = 0; i < 60; ++i) {
                Particle p;
                p.pos = Vec2(player.pos.x, player.pos.y - 40.0f);
                float a = frand(0, 2 * PI);
                float s = frand(180.0f, 420.0f);
                p.vel = Vec2(std::cos(a) * s, std::sin(a) * s);
                p.life = p.maxLife = frand(0.5f, 1.0f);
                p.size = frand(3.0f, 6.0f);
                p.color = (i & 1) ? Color(255, 255, 230, 120) : Color(255, 255, 120, 230);
                p.gravity = 180.0f;
                particles.push_back(p);
            }
            addPop(Vec2(player.pos.x, player.pos.y - 110.0f),
                   L"LEVEL UP!  Lv " + std::to_wstring(player.level),
                   Color(255, 255, 230, 120), -60.0f);
            leveled = true;
        }
        if (!leveled) {
            addPop(Vec2(player.pos.x, player.pos.y - 100.0f),
                   L"+" + std::to_wstring((int)amount) + L" XP",
                   Color(255, 160, 220, 255), -50.0f);
        }
    }

    void castLightning() {
        if (player.lightningCd > 0.0f) return;
        if (player.weapon != WPN_WAND) return;
        player.lightningCd = player.lightningMax;

        const int MAX_CHAIN = 5;
        const float JUMP_RANGE = 280.0f;
        const float BASE_DMG = 55.0f * player.damageMul();
        LightningStrike ls;
        ls.life = ls.maxLife = 0.5f;

        Vec2 origin = playerMuzzlePos();
        std::vector<int> hit;
        Vec2 cur = origin;
        for (int chain = 0; chain < MAX_CHAIN; ++chain) {
            int best = -1;
            float bestDist = JUMP_RANGE;
            for (size_t i = 0; i < enemies.size(); ++i) {
                if (enemies[i].hp <= 0) continue;
                if (std::find(hit.begin(), hit.end(), (int)i) != hit.end()) continue;
                Vec2 ec(enemies[i].pos.x, enemies[i].pos.y - enemies[i].h * 0.5f);
                float d = len(Vec2(ec.x - cur.x, ec.y - cur.y));
                if (d < bestDist) { bestDist = d; best = (int)i; }
            }
            if (best < 0) break;
            Vec2 target(enemies[best].pos.x,
                        enemies[best].pos.y - enemies[best].h * 0.5f);
            // Jagged polyline from cur -> target
            LightningArc arc;
            arc.points.push_back(cur);
            int segs = 10;
            Vec2 d(target.x - cur.x, target.y - cur.y);
            float L = len(d);
            Vec2 n(-d.y / std::max(1.0f, L), d.x / std::max(1.0f, L));
            for (int s = 1; s < segs; ++s) {
                float t = s / (float)segs;
                float jitter = frand(-16.0f, 16.0f) * (1.0f - std::abs(t - 0.5f) * 1.5f);
                Vec2 p(cur.x + d.x * t + n.x * jitter,
                       cur.y + d.y * t + n.y * jitter);
                arc.points.push_back(p);
            }
            arc.points.push_back(target);
            ls.arcs.push_back(arc);

            float dmg = BASE_DMG * std::pow(0.85f, chain);
            enemies[best].hp -= dmg;
            enemies[best].hurtFlash = 0.2f;
            spawnHit(target, Color(255, 180, 230, 255), 16);
            addPop(target, std::to_wstring((int)dmg), Color(255, 180, 230, 255), -50.0f);
            hit.push_back(best);
            cur = target;
        }
        if (!ls.arcs.empty()) strikes.push_back(ls);
        player.shake = std::max(player.shake, 10.0f);
        player.muzzleT = 0.1f;
        // Flash burst at caster
        for (int i = 0; i < 24; ++i) {
            Particle p;
            p.pos = origin;
            float a = frand(0, 2 * PI);
            float s = frand(140.0f, 320.0f);
            p.vel = Vec2(std::cos(a) * s, std::sin(a) * s);
            p.life = p.maxLife = frand(0.2f, 0.4f);
            p.size = frand(3.0f, 5.0f);
            p.color = Color(255, 180, 230, 255);
            particles.push_back(p);
        }
    }

    void spawnPickup(Vec2 pos) {
        Pickup p;
        p.pos = pos;
        p.vel = Vec2(frand(-120.0f, 120.0f), frand(-420.0f, -260.0f));
        float r = frand(0.0f, 1.0f);
        p.kind = (r < 0.5f) ? PU_HP : (r < 0.8f) ? PU_AMMO : PU_ARMOR;
        pickups.push_back(p);
    }

    void fireLaser(float dt) {
        const Weapon& W = WEAPONS[player.weapon];
        Vec2 muzzle = playerMuzzlePos();
        Vec2 dir(std::cos(player.aimAngle), std::sin(player.aimAngle));

        float hitDist = W.beamRange;
        Enemy* hitEnemy = nullptr;
        for (auto& pf : platforms) {
            if (!pf.solid) continue;
            float t = rayVsAABB(muzzle, dir, pf.x, pf.y, pf.w, pf.h);
            if (t >= 0.0f && t < hitDist) hitDist = t;
        }
        for (auto& e : enemies) {
            if (e.hp <= 0) continue;
            float t = rayVsAABB(muzzle, dir,
                                e.pos.x - e.w/2, e.pos.y - e.h, e.w, e.h);
            if (t >= 0.0f && t < hitDist) { hitDist = t; hitEnemy = &e; }
        }
        player.laserEnd = Vec2(muzzle.x + dir.x * hitDist,
                               muzzle.y + dir.y * hitDist);

        if (hitEnemy) {
            hitEnemy->hp -= W.damage * player.damageMul() * dt;
            hitEnemy->hurtFlash = 0.08f;
        }

        // Ammo drain
        player.laserAmmoAccum += W.beamAmmoPerSec * dt;
        while (player.laserAmmoAccum >= 1.0f) {
            player.laserAmmoAccum -= 1.0f;
            player.ammo[player.weapon]--;
            if (player.ammo[player.weapon] <= 0) {
                player.ammo[player.weapon] = 0;
                beginReload();
                break;
            }
        }

        // Impact sparkles
        player.laserTickT -= dt;
        if (player.laserTickT <= 0.0f) {
            player.laserTickT = 0.025f;
            for (int i = 0; i < 4; ++i) {
                Particle p;
                p.pos = player.laserEnd;
                float a = frand(0, 2 * PI);
                float s = frand(80.0f, 280.0f);
                p.vel = Vec2(std::cos(a) * s, std::sin(a) * s);
                p.life = p.maxLife = frand(0.12f, 0.28f);
                p.size = frand(2.0f, 4.0f);
                p.color = Color(255, 200, 255, 220);
                particles.push_back(p);
            }
            // Muzzle shimmer
            Particle m;
            m.pos = muzzle;
            float a = player.aimAngle + frand(-0.3f, 0.3f);
            float s = frand(60.0f, 180.0f);
            m.vel = Vec2(std::cos(a) * s, std::sin(a) * s);
            m.life = m.maxLife = 0.15f;
            m.size = 4.0f;
            m.color = Color(255, 220, 180, 255);
            particles.push_back(m);
        }
        player.shake = std::max(player.shake, 1.5f);
        player.muzzleT = 0.05f;
        player.laserPhase += dt * 40.0f;
    }

    void explodeAt(Vec2 pos, float radius, float dmg) {
        // Extra fiery particles on top of the standard explosion
        spawnExplosion(pos);
        for (int i = 0; i < 20; ++i) {
            Particle p;
            p.pos = pos;
            float a = frand(0, 2 * PI);
            float s = frand(radius * 0.6f, radius * 2.0f);
            p.vel = Vec2(std::cos(a) * s, std::sin(a) * s - 40.0f);
            p.life = p.maxLife = frand(0.4f, 0.9f);
            p.size = frand(4.0f, 9.0f);
            p.color = (i & 1) ? Color(255, 255, 180, 60) : Color(255, 255, 90, 40);
            p.gravity = 180.0f;
            particles.push_back(p);
        }
        for (auto& e : enemies) {
            if (e.hp <= 0) continue;
            Vec2 ec(e.pos.x, e.pos.y - e.h * 0.5f);
            float dist = len(Vec2(ec.x - pos.x, ec.y - pos.y));
            if (dist < radius) {
                float f = 1.0f - dist / radius;
                float applied = dmg * (0.35f + f * 0.65f);
                e.hp -= applied;
                e.hurtFlash = 0.18f;
                e.vel.x += std::copysign(220.0f * f, ec.x - pos.x + 0.001f);
                addPop(ec, std::to_wstring((int)applied), Color(255, 255, 170, 90), -45.0f);
            }
        }
        player.shake = std::max(player.shake, 18.0f);
    }

    void fireWeapon() {
        const Weapon& W = WEAPONS[player.weapon];
        Vec2 muzzle = playerMuzzlePos();
        int shots = W.pelletsPerShot + player.perks.extraBullets;
        float spread = W.spread * player.perks.spreadMul;

        for (int i = 0; i < shots; ++i) {
            float a = player.aimAngle + frand(-spread, spread);
            // Fan the extras slightly so they don't overlap when spread is tiny
            if (shots > 1 && spread < 0.04f)
                a += (i - (shots - 1) * 0.5f) * 0.045f;
            Bullet b;
            b.pos = muzzle;
            b.vel = Vec2(std::cos(a) * W.bulletSpeed, std::sin(a) * W.bulletSpeed);
            b.dmg = W.damage * player.damageMul();
            b.fromPlayer = true;
            b.life = W.isBolt ? 1.8f : 0.9f;
            b.color = W.tracerColor;
            b.pierces = W.piercing;
            b.gravity = W.projGravity;
            b.isBolt = W.isBolt;
            b.isMagic = W.isMagic;
            b.isFireball = W.isFireball;
            b.explosionRadius = W.explosionRadius * player.perks.blastMul;
            b.explosionDmg = W.explosionDmg * player.damageMul();
            bullets.push_back(b);
        }
        // Muzzle flash particles
        for (int i = 0; i < 10; ++i) {
            Particle p;
            p.pos = muzzle;
            float a = player.aimAngle + frand(-0.4f, 0.4f);
            float s = frand(200.0f, 600.0f);
            p.vel = Vec2(std::cos(a) * s, std::sin(a) * s);
            p.life = p.maxLife = frand(0.08f, 0.18f);
            p.size = frand(3.0f, 6.0f);
            p.color = Color(255, 255, 220, 120);
            particles.push_back(p);
        }
        // Smoke puff
        for (int i = 0; i < 6; ++i) {
            Particle p;
            p.pos = muzzle;
            p.vel = Vec2(frand(-40.0f, 40.0f), frand(-80.0f, -20.0f));
            p.life = p.maxLife = frand(0.5f, 0.9f);
            p.size = frand(4.0f, 9.0f);
            p.color = Color(140, 210, 210, 230);
            p.additive = false;
            particles.push_back(p);
        }
        // Recoil / screen shake
        player.muzzleT = 0.07f;
        player.shake = std::max(player.shake, W.pelletsPerShot > 3 ? 10.0f : 5.0f);
        // Recoil kick
        player.vel.x -= std::cos(player.aimAngle) * (W.pelletsPerShot > 3 ? 70.0f : 25.0f);
    }

    void spawnJumpDust(Vec2 p) {
        for (int i = 0; i < 10; ++i) {
            Particle pt;
            pt.pos = Vec2(p.x + frand(-14.0f, 14.0f), p.y + frand(-4.0f, 4.0f));
            pt.vel = Vec2(frand(-80.0f, 80.0f), frand(-80.0f, -10.0f));
            pt.life = pt.maxLife = frand(0.3f, 0.6f);
            pt.size = frand(2.5f, 5.0f);
            pt.color = Color(180, 200, 200, 230);
            pt.additive = false;
            pt.gravity = 300.0f;
            particles.push_back(pt);
        }
    }

    void spawnHit(Vec2 p, Color c, int count = 14) {
        for (int i = 0; i < count; ++i) {
            Particle pt;
            pt.pos = p;
            float a = frand(0, 2 * PI);
            float s = frand(140.0f, 420.0f);
            pt.vel = Vec2(std::cos(a) * s, std::sin(a) * s - 40.0f);
            pt.life = pt.maxLife = frand(0.25f, 0.55f);
            pt.size = frand(2.5f, 5.0f);
            pt.color = c;
            pt.gravity = 500.0f;
            particles.push_back(pt);
        }
    }

    void spawnExplosion(Vec2 p) {
        for (int i = 0; i < 40; ++i) {
            Particle pt;
            pt.pos = p;
            float a = frand(0, 2 * PI);
            float s = frand(160.0f, 520.0f);
            pt.vel = Vec2(std::cos(a) * s, std::sin(a) * s);
            pt.life = pt.maxLife = frand(0.45f, 0.95f);
            pt.size = frand(3.0f, 8.0f);
            int r = 255, g = 120 + irand(0,120), b = 60;
            pt.color = Color(255, (BYTE)r, (BYTE)g, (BYTE)b);
            pt.gravity = 260.0f;
            particles.push_back(pt);
        }
        // Flash
        for (int i = 0; i < 30; ++i) {
            Particle pt;
            pt.pos = p;
            float a = frand(0, 2 * PI);
            float s = frand(60.0f, 180.0f);
            pt.vel = Vec2(std::cos(a) * s, std::sin(a) * s);
            pt.life = pt.maxLife = frand(0.1f, 0.25f);
            pt.size = frand(8.0f, 16.0f);
            pt.color = Color(255, 255, 240, 160);
            particles.push_back(pt);
        }
        player.shake = std::max(player.shake, 18.0f);
    }

    void addPop(Vec2 p, const std::wstring& t, Color c, float vy = -70.0f) {
        pops.push_back({ p, t, 0.9f, 0.9f, c, vy });
    }

    // ---- AABB helpers ----
    static bool rectsOverlap(float ax, float ay, float aw, float ah,
                             float bx, float by, float bw, float bh) {
        return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
    }

    // Slide against platforms. `ignoreFloating` = treat all platforms except the
    // ground as passable (used for the boss so it can walk through the level).
    void moveAABB(Vec2& pos, Vec2& vel, bool& onGround, float w, float h, float dt,
                  bool ignoreFloating = false) {
        onGround = false;
        pos.x += vel.x * dt;
        // Horizontal collision
        for (auto& pf : platforms) {
            if (!pf.solid) continue;
            if (ignoreFloating && pf.y < 600.0f) continue;
            if (rectsOverlap(pos.x - w/2, pos.y - h, w, h, pf.x, pf.y, pf.w, pf.h)) {
                if (vel.x > 0) pos.x = pf.x - w/2;
                else if (vel.x < 0) pos.x = pf.x + pf.w + w/2;
                vel.x = 0;
            }
        }
        vel.y += GRAVITY * dt;
        pos.y += vel.y * dt;
        // Vertical collision
        for (auto& pf : platforms) {
            if (!pf.solid) continue;
            if (ignoreFloating && pf.y < 600.0f) continue;
            if (rectsOverlap(pos.x - w/2, pos.y - h, w, h, pf.x, pf.y, pf.w, pf.h)) {
                if (vel.y > 0) { pos.y = pf.y; onGround = true; }
                else if (vel.y < 0) { pos.y = pf.y + pf.h + h; }
                vel.y = 0;
            }
        }
        // World bounds
        pos.x = clampf(pos.x, 40.0f, (float)WORLD_W - 40.0f);
    }

    void update(float dt) {
        time += dt;
        if (state != GS_PLAY) return;

        handleInput(dt);

        // Reload
        if (player.reloading) {
            player.reloadT -= dt;
            if (player.reloadT <= 0) {
                player.reloading = false;
                player.ammo[player.weapon] = player.effectiveMagSize(player.weapon);
            }
        }
        player.fireCd -= dt;
        player.muzzleT -= dt;
        player.hurtFlash = std::max(0.0f, player.hurtFlash - dt);
        player.animT += dt;
        player.shake = std::max(0.0f, player.shake - dt * 30.0f);
        player.levelUpFlash = std::max(0.0f, player.levelUpFlash - dt);
        player.lightningCd  = std::max(0.0f, player.lightningCd - dt);
        player.powerBoostT  = std::max(0.0f, player.powerBoostT - dt);

        // Move player
        moveAABB(player.pos, player.vel, player.onGround, 44.0f, 78.0f, dt);
        if (player.onGround) player.jumpsLeft = 2;

        // Camera follow
        float target = player.pos.x - SCREEN_W * 0.5f;
        camX += (target - camX) * std::min(1.0f, dt * 6.0f);
        camX = clampf(camX, 0.0f, (float)WORLD_W - SCREEN_W);

        // Spawn enemies, then boss, then advance.
        if (enemiesToSpawn > 0) {
            spawnTimer -= dt;
            if (spawnTimer <= 0.0f) {
                spawnEnemy();
                enemiesToSpawn--;
                spawnTimer = frand(0.6f, 1.4f) - std::min(0.5f, wave * 0.04f);
            }
        } else if (!bossSpawnedThisWave) {
            spawnTimer -= dt;
            if (enemies.empty() && spawnTimer <= -0.3f) {
                spawnBoss();
                bossSpawnedThisWave = true;
            }
        } else if (enemies.empty()) {
            // Boss clear - open a portal instead of auto-advancing.
            if (!portalActive) spawnPortal();
        }

        // Portal: pulse, check collision, teleport player
        if (portalActive) {
            portalT += dt;
            float dx = player.pos.x - portalPos.x;
            float dy = (player.pos.y - 32.0f) - portalPos.y;
            if (dx*dx + dy*dy < 54.0f * 54.0f) teleport();
        }
        teleportFlash = std::max(0.0f, teleportFlash - dt * 1.2f);

        // Update enemies
        for (auto& e : enemies) {
            e.animT += dt;
            e.hurtFlash = std::max(0.0f, e.hurtFlash - dt);
            e.fireCd -= dt;
            Vec2 toP(player.pos.x - e.pos.x, player.pos.y - e.pos.y);
            float dist = len(toP);
            if (dist < e.sightRange) {
                e.facing = (toP.x > 0) ? 1 : -1;
                float chaseDist = (e.kind == E_SNIPER) ? 550.0f : 55.0f;
                if (std::abs(toP.x) > chaseDist) {
                    e.vel.x = e.facing * e.moveSpeed;
                } else {
                    e.vel.x = 0;
                }
                // Jump if there is a ledge above them close by (simple heuristic)
                if (e.onGround && toP.y < -80.0f && irand(0, 60) == 0) {
                    e.vel.y = JUMP_VEL * 0.9f;
                }
                // Enemy fires. Per-kind (and per boss-weapon) stats.
                float fireRange, bs, dmg, spread, bulletLife;
                int   shots;
                float cd;
                Color col;
                float bulletSize = 1.0f;   // visual scale hint (unused, kept for later)
                (void)bulletSize;
                if (e.kind == E_BOSS) {
                    fireRange = 2000.0f;
                    switch (e.bossWeapon) {
                        case 0: // Rocket - slow big projectile, high damage
                            bs = 520.0f; dmg = 38.0f; spread = 0.015f; shots = 1;
                            cd = frand(1.9f, 2.6f); col = Color(255, 255, 150, 60);
                            bulletLife = 3.2f; break;
                        case 1: // Arc / laser cannon - twin fast shots
                            bs = 1400.0f; dmg = 24.0f; spread = 0.04f; shots = 2;
                            cd = frand(1.0f, 1.4f); col = Color(255, 150, 255, 255);
                            bulletLife = 1.4f; break;
                        default: // Minigun - 5-shot burst
                            bs = 950.0f; dmg = 11.0f; spread = 0.22f; shots = 5;
                            cd = frand(1.0f, 1.4f); col = Color(255, 255, 200, 120);
                            bulletLife = 1.4f; break;
                    }
                } else if (e.kind == E_SNIPER) {
                    fireRange = 1600.0f; bs = 1500.0f; dmg = 30.0f;
                    spread = 0.010f; shots = 1; cd = frand(1.8f, 2.6f);
                    col = Color(255, 120, 255, 255); bulletLife = 1.6f;
                } else if (e.kind == E_BRUTE) {
                    fireRange = 650.0f; bs = 680.0f; dmg = 9.0f;
                    spread = 0.22f; shots = 4;      // shotgun pellets
                    cd = frand(1.3f, 1.9f);
                    col = Color(255, 255, 110, 80); bulletLife = 1.1f;
                } else if (e.kind == E_RUNNER) {
                    fireRange = 650.0f; bs = 950.0f; dmg = 7.0f;
                    spread = 0.04f; shots = 1; cd = frand(0.45f, 0.85f);
                    col = Color(255, 255, 180, 100); bulletLife = 1.3f;
                } else { // E_GRUNT
                    fireRange = 750.0f; bs = 740.0f; dmg = 11.0f;
                    spread = 0.08f; shots = 1; cd = frand(0.7f, 1.3f);
                    col = Color(255, 255, 80, 80); bulletLife = 1.4f;
                }
                // Scale damage up and cooldown down each wave
                float wd = 1.0f + wave * 0.08f;
                dmg *= wd;
                cd /= wd;

                if (dist < fireRange && e.fireCd <= 0.0f) {
                    // Aim from the shoulder - matches the drawn weapon direction.
                    Vec2 shoulder = enemyShoulder(e);
                    Vec2 target(player.pos.x, player.pos.y - 32.0f);
                    float a0 = std::atan2(target.y - shoulder.y,
                                          target.x - shoulder.x);
                    Vec2 muzzle = enemyMuzzle(e, a0);
                    for (int s = 0; s < shots; ++s) {
                        float a = a0 + ((shots == 1) ? frand(-spread, spread)
                                                    : (s - (shots - 1) * 0.5f) * spread
                                                      + frand(-0.015f, 0.015f));
                        Bullet b;
                        b.pos = muzzle;
                        b.vel = Vec2(std::cos(a) * bs, std::sin(a) * bs);
                        b.dmg = dmg;
                        b.fromPlayer = false;
                        b.life = bulletLife;
                        b.color = col;
                        bullets.push_back(b);
                    }
                    // Muzzle flash spawns at the barrel tip too
                    for (int i = 0; i < 8; ++i) {
                        Particle p;
                        p.pos = muzzle;
                        float aa = a0 + frand(-0.5f, 0.5f);
                        float s2 = frand(150.0f, 380.0f);
                        p.vel = Vec2(std::cos(aa) * s2, std::sin(aa) * s2);
                        p.life = p.maxLife = frand(0.07f, 0.16f);
                        p.size = frand(2.5f, 6.0f);
                        p.color = Color(255, 255, 210, 110);
                        particles.push_back(p);
                    }
                    e.fireCd = cd;
                }
            } else {
                e.vel.x = 0;
            }
            moveAABB(e.pos, e.vel, e.onGround, e.w, e.h, dt, e.kind == E_BOSS);
        }

        // Update bullets
        for (auto& b : bullets) {
            b.trail += dt;
            if (b.trail > 0.012f) {
                b.trailPts.push_back(b.pos);
                if (b.trailPts.size() > 8) b.trailPts.erase(b.trailPts.begin());
                b.trail = 0.0f;
            }
            if (b.gravity != 0.0f) b.vel.y += b.gravity * dt;
            b.pos.x += b.vel.x * dt;
            b.pos.y += b.vel.y * dt;
            b.life -= dt;
            // Collision with platforms
            for (auto& pf : platforms) {
                if (!pf.solid) continue;
                if (b.pos.x >= pf.x && b.pos.x <= pf.x + pf.w &&
                    b.pos.y >= pf.y && b.pos.y <= pf.y + pf.h) {
                    if (b.isFireball) explodeAt(b.pos, b.explosionRadius, b.explosionDmg);
                    b.life = 0;
                    // spark
                    for (int i = 0; i < 8; ++i) {
                        Particle p;
                        p.pos = b.pos;
                        float a = frand(0, 2 * PI);
                        float s = frand(80.0f, 260.0f);
                        p.vel = Vec2(std::cos(a) * s, std::sin(a) * s - 80.0f);
                        p.life = p.maxLife = frand(0.2f, 0.4f);
                        p.size = frand(2.0f, 4.0f);
                        p.color = Color(255, 255, 220, 140);
                        p.gravity = 500.0f;
                        particles.push_back(p);
                    }
                    break;
                }
            }
            if (b.life <= 0) continue;
            // Collision with enemies (player bullets)
            if (b.fromPlayer) {
                for (auto& e : enemies) {
                    if (e.hp <= 0) continue;
                    if (b.pos.x > e.pos.x - e.w/2 && b.pos.x < e.pos.x + e.w/2 &&
                        b.pos.y > e.pos.y - e.h    && b.pos.y < e.pos.y) {
                        e.hp -= b.dmg;
                        e.hurtFlash = 0.15f;
                        e.vel.x += std::copysign(80.0f, b.vel.x);
                        Color sparkC = b.isMagic ? Color(255, 180, 100, 255)
                                      : b.isBolt  ? Color(255, 255, 220, 160)
                                                  : Color(255, 255, 90, 90);
                        spawnHit(b.pos, sparkC, 10);
                        addPop(b.pos, std::to_wstring((int)b.dmg), Color(255, 255, 240, 160), -40.0f);
                        if (b.isFireball) {
                            explodeAt(b.pos, b.explosionRadius, b.explosionDmg);
                            b.life = 0;
                            break;
                        } else if (b.pierces > 0) {
                            b.pierces--;
                            float dir = (b.vel.x >= 0) ? 1.0f : -1.0f;
                            b.pos.x = e.pos.x + dir * (e.w/2 + 4.0f);
                        } else {
                            b.life = 0;
                            break;
                        }
                    }
                }
            } else {
                // Enemy bullet vs player (armor absorbs 60% up to its remaining pool)
                if (b.pos.x > player.pos.x - 22.0f && b.pos.x < player.pos.x + 22.0f &&
                    b.pos.y > player.pos.y - 78.0f && b.pos.y < player.pos.y) {
                    float dmg = b.dmg;
                    if (player.armor > 0.0f) {
                        float absorbed = std::min(player.armor, dmg * 0.6f);
                        player.armor -= absorbed;
                        dmg -= absorbed;
                        spawnHit(b.pos, Color(255, 120, 220, 255), 6);
                    }
                    player.hp -= dmg;
                    player.hurtFlash = 0.35f;
                    player.shake = std::max(player.shake, 8.0f);
                    spawnHit(b.pos, Color(255, 255, 100, 140), 10);
                    b.life = 0;
                    if (player.hp <= 0) {
                        state = GS_OVER;
                        spawnExplosion(Vec2(player.pos.x, player.pos.y - 40.0f));
                    }
                }
            }
        }
        bullets.erase(std::remove_if(bullets.begin(), bullets.end(),
                                     [](const Bullet& b){ return b.life <= 0; }),
                      bullets.end());

        // Clean up enemies (grant score + XP for each kill)
        for (auto& e : enemies) {
            if (e.hp <= 0) {
                int score = (e.kind == E_BOSS)   ? 2500 + wave * 500
                          : (e.kind == E_BRUTE)  ? 500
                          : (e.kind == E_SNIPER) ? 300
                          : (e.kind == E_RUNNER) ? 150 : 100;
                float xp = (e.kind == E_BOSS)   ? 180.0f + wave * 25.0f
                         : (e.kind == E_BRUTE)  ? 45.0f
                         : (e.kind == E_SNIPER) ? 30.0f
                         : (e.kind == E_RUNNER) ? 18.0f : 12.0f;
                player.score += score;
                player.kills++;
                if (player.perks.lifesteal > 0) {
                    player.hp = std::min(player.hpMax,
                                         player.hp + (float)player.perks.lifesteal);
                }
                if (e.kind == E_BOSS) {
                    for (int i = 0; i < 4; ++i)
                        spawnExplosion(Vec2(e.pos.x + frand(-30,30), e.pos.y - e.h * 0.5f + frand(-20,20)));
                    player.shake = std::max(player.shake, 24.0f);
                    // Guaranteed HP/ammo/armor loot bundle
                    for (int i = 0; i < 4; ++i) spawnPickup(Vec2(e.pos.x + frand(-30,30), e.pos.y - e.h));
                    // Perk crystal
                    Pickup pk;
                    pk.pos = Vec2(e.pos.x, e.pos.y - e.h * 0.5f);
                    pk.vel = Vec2(frand(-40.0f, 40.0f), -520.0f);
                    pk.kind = PU_PERK;
                    pk.life = 30.0f;
                    pickups.push_back(pk);
                } else {
                    spawnExplosion(Vec2(e.pos.x, e.pos.y - e.h * 0.5f));
                    float dropChance = (e.kind == E_BRUTE)  ? 0.65f
                                     : (e.kind == E_SNIPER) ? 0.45f
                                     : (e.kind == E_RUNNER) ? 0.30f : 0.25f;
                    if (frand(0.0f, 1.0f) < dropChance)
                        spawnPickup(Vec2(e.pos.x, e.pos.y - e.h * 0.5f));
                }
                addPop(Vec2(e.pos.x, e.pos.y - e.h),
                       L"+" + std::to_wstring(score),
                       Color(255,120,255,180));
                gainXp(xp);
            }
        }
        enemies.erase(std::remove_if(enemies.begin(), enemies.end(),
                                     [](const Enemy& e){ return e.hp <= 0; }),
                      enemies.end());

        // Particles
        for (auto& p : particles) {
            p.vel.y += p.gravity * dt;
            p.pos.x += p.vel.x * dt;
            p.pos.y += p.vel.y * dt;
            p.life -= dt;
            p.rot += p.rotVel * dt;
        }
        particles.erase(std::remove_if(particles.begin(), particles.end(),
                                       [](const Particle& p){ return p.life <= 0; }),
                        particles.end());

        // Pop texts
        for (auto& p : pops) {
            p.pos.y += p.vy * dt;
            p.life -= dt;
        }
        pops.erase(std::remove_if(pops.begin(), pops.end(),
                                  [](const PopText& p){ return p.life <= 0; }),
                   pops.end());

        // Lightning strikes fade out
        for (auto& s : strikes) s.life -= dt;
        strikes.erase(std::remove_if(strikes.begin(), strikes.end(),
                                     [](const LightningStrike& s){ return s.life <= 0; }),
                      strikes.end());

        // Pickups: gravity, platform collision, player pickup
        for (auto& pk : pickups) {
            pk.life -= dt;
            pk.bob  += dt;
            if (!pk.onGround) {
                pk.vel.y += GRAVITY * 0.55f * dt;
                pk.pos.x += pk.vel.x * dt;
                pk.pos.y += pk.vel.y * dt;
                for (auto& pf : platforms) {
                    if (!pf.solid) continue;
                    if (pk.pos.x >= pf.x - 8.0f && pk.pos.x <= pf.x + pf.w + 8.0f &&
                        pk.pos.y >= pf.y && pk.pos.y <= pf.y + 14.0f && pk.vel.y > 0) {
                        pk.pos.y = pf.y;
                        pk.vel = Vec2(0, 0);
                        pk.onGround = true;
                        break;
                    }
                }
            }
            // Collision with player
            if (std::abs(pk.pos.x - player.pos.x) < 36.0f &&
                pk.pos.y > player.pos.y - 78.0f && pk.pos.y < player.pos.y + 10.0f) {
                if (pk.kind == PU_HP) {
                    player.hp = std::min(player.hpMax, player.hp + 30.0f);
                    addPop(Vec2(player.pos.x, player.pos.y - 110.0f),
                           L"+30 HP", Color(255, 100, 230, 140));
                } else if (pk.kind == PU_AMMO) {
                    int w = player.weapon;
                    player.ammo[w] = player.effectiveMagSize(w);
                    addPop(Vec2(player.pos.x, player.pos.y - 110.0f),
                           L"+AMMO", Color(255, 120, 220, 255));
                } else if (pk.kind == PU_ARMOR) {
                    player.armor = std::min(player.armorMax, player.armor + 40.0f);
                    addPop(Vec2(player.pos.x, player.pos.y - 110.0f),
                           L"+40 ARMOR", Color(255, 120, 200, 255));
                } else { // PU_PERK
                    std::vector<int> avail;
                    for (int i = 0; i < PK_COUNT; ++i) {
                        if (!player.perks.has(i) ||
                            i == PK_TWIN_SHOT || i == PK_VAMPIRE)
                            avail.push_back(i);
                    }
                    if (avail.empty()) {
                        player.score += 2500;
                        addPop(Vec2(player.pos.x, player.pos.y - 110.0f),
                               L"+2500 BONUS", Color(255, 180, 230, 255));
                    } else {
                        int pick = avail[irand(0, (int)avail.size() - 1)];
                        player.perks.apply(pick);
                        waveBannerT = 2.6f;
                        waveBannerText = std::wstring(L"PERK  ") + PERK_NAMES[pick];
                        addPop(Vec2(player.pos.x, player.pos.y - 110.0f),
                               std::wstring(L"PERK: ") + PERK_NAMES[pick],
                               Color(255, 180, 230, 255), -70.0f);
                        // Celebration burst
                        for (int i = 0; i < 40; ++i) {
                            Particle p;
                            p.pos = pk.pos;
                            float a = frand(0, 2 * PI);
                            float s = frand(140.0f, 400.0f);
                            p.vel = Vec2(std::cos(a) * s, std::sin(a) * s);
                            p.life = p.maxLife = frand(0.4f, 0.8f);
                            p.size = frand(3.0f, 5.0f);
                            p.color = Color(255, 200, 150, 255);
                            particles.push_back(p);
                        }
                    }
                }
                // Sparkle burst
                for (int i = 0; i < 18; ++i) {
                    Particle p;
                    p.pos = pk.pos;
                    float a = frand(0, 2 * PI);
                    float s = frand(100.0f, 280.0f);
                    p.vel = Vec2(std::cos(a) * s, std::sin(a) * s);
                    p.life = p.maxLife = frand(0.3f, 0.6f);
                    p.size = frand(2.5f, 4.5f);
                    p.color = (pk.kind == PU_HP) ? Color(255, 120, 240, 160)
                                                 : Color(255, 100, 220, 255);
                    particles.push_back(p);
                }
                pk.life = 0;
            }
        }
        pickups.erase(std::remove_if(pickups.begin(), pickups.end(),
                                     [](const Pickup& p){ return p.life <= 0; }),
                      pickups.end());

        waveBannerT = std::max(0.0f, waveBannerT - dt);
    }
};

// ---------- rendering ----------
struct Renderer {
    HDC   bufDC = nullptr;
    HBITMAP bufBmp = nullptr;
    int   bufW = 0, bufH = 0;

    void ensure(HDC hdc, int w, int h) {
        if (bufDC && bufW == w && bufH == h) return;
        if (bufDC) { DeleteObject(bufBmp); DeleteDC(bufDC); }
        bufDC = CreateCompatibleDC(hdc);
        bufBmp = CreateCompatibleBitmap(hdc, w, h);
        SelectObject(bufDC, bufBmp);
        bufW = w; bufH = h;
    }
    ~Renderer() { if (bufDC) { DeleteObject(bufBmp); DeleteDC(bufDC); } }
};

static void drawFilledPath(Graphics& g, const Color& c, const std::vector<PointF>& pts) {
    SolidBrush b(c);
    GraphicsPath p;
    p.AddPolygon(pts.data(), (INT)pts.size());
    g.FillPath(&b, &p);
}

static void drawCircle(Graphics& g, float x, float y, float r, Color c) {
    SolidBrush b(c);
    g.FillEllipse(&b, x - r, y - r, r * 2, r * 2);
}

static void drawRoundedRect(Graphics& g, float x, float y, float w, float h, float r, Color c) {
    SolidBrush b(c);
    GraphicsPath p;
    p.AddArc(x, y, r*2, r*2, 180, 90);
    p.AddArc(x + w - r*2, y, r*2, r*2, 270, 90);
    p.AddArc(x + w - r*2, y + h - r*2, r*2, r*2, 0, 90);
    p.AddArc(x, y + h - r*2, r*2, r*2, 90, 90);
    p.CloseFigure();
    g.FillPath(&b, &p);
}

// Draws a gun with grip at origin (0,0), barrel pointing +X.
// weaponType: 0=Pistol, 1=Laser, 2=MG, -1=generic enemy rifle.
static void drawWeapon(Graphics& g, int weaponType) {
    if (weaponType == 0) {
        // --- Pistol: compact slide + boxy grip
        SolidBrush body(Color(255, 55, 50, 70));
        g.FillRectangle(&body, 0.0f, -5.0f, 24.0f, 9.0f);
        SolidBrush slide(Color(255, 90, 85, 110));
        g.FillRectangle(&slide, 0.0f, -5.0f, 24.0f, 3.0f);
        SolidBrush tip(Color(255, 20, 15, 28));
        g.FillRectangle(&tip, 22.0f, -3.0f, 4.0f, 6.0f);
        SolidBrush sight(Color(255, 220, 180, 240));
        g.FillRectangle(&sight, 16.0f, -7.0f, 3.0f, 2.0f);
        g.FillRectangle(&sight, 2.0f,  -7.0f, 2.0f, 2.0f);
        // Grip (angled back-down)
        PointF grip[] = { {2.0f, 3.0f}, {11.0f, 3.0f}, {8.0f, 16.0f}, {-2.0f, 16.0f} };
        SolidBrush gripBr(Color(255, 30, 22, 40));
        g.FillPolygon(&gripBr, grip, 4);
        SolidBrush gripHi(Color(255, 90, 60, 90));
        g.FillRectangle(&gripHi, 2.0f, 4.0f, 2.0f, 11.0f);
    } else if (weaponType == 1) {
        // --- Laser rifle: elongated body, glowing core, bifurcated emitter
        SolidBrush shell(Color(255, 40, 55, 95));
        g.FillRectangle(&shell, -8.0f, -6.0f, 48.0f, 12.0f);
        SolidBrush shellTop(Color(255, 70, 90, 140));
        g.FillRectangle(&shellTop, -8.0f, -6.0f, 48.0f, 3.0f);
        // Glowing energy core
        LinearGradientBrush core(PointF(-4.0f, -2.0f), PointF(36.0f, -2.0f),
                                 Color(255, 255, 140, 230),
                                 Color(255, 255, 255, 255));
        g.FillRectangle(&core, -4.0f, -2.0f, 40.0f, 4.0f);
        // Emitter prongs
        SolidBrush prong(Color(255, 150, 240, 255));
        PointF p1[] = { {40.0f, -7.0f}, {52.0f, -3.5f}, {40.0f, -1.0f} };
        PointF p2[] = { {40.0f,  1.0f}, {52.0f,  3.5f}, {40.0f,  7.0f} };
        g.FillPolygon(&prong, p1, 3);
        g.FillPolygon(&prong, p2, 3);
        // Grip
        PointF grip[] = { {2.0f, 5.0f}, {12.0f, 5.0f}, {10.0f, 18.0f}, {0.0f, 18.0f} };
        SolidBrush gripBr(Color(255, 25, 20, 35));
        g.FillPolygon(&gripBr, grip, 4);
        // Top rail / sight
        SolidBrush rail(Color(255, 255, 160, 240));
        g.FillRectangle(&rail, 14.0f, -9.0f, 10.0f, 3.0f);
    } else if (weaponType == 2) {
        // --- Machine gun: long barrel, vents, box mag, stock
        SolidBrush stock(Color(255, 70, 40, 55));
        g.FillRectangle(&stock, -22.0f, -5.0f, 18.0f, 10.0f);
        SolidBrush body(Color(255, 45, 38, 55));
        g.FillRectangle(&body, -6.0f, -6.0f, 46.0f, 12.0f);
        SolidBrush bodyTop(Color(255, 80, 70, 95));
        g.FillRectangle(&bodyTop, -6.0f, -6.0f, 46.0f, 3.0f);
        // Vent slits
        SolidBrush vent(Color(255, 20, 15, 22));
        for (int i = 0; i < 5; i++)
            g.FillRectangle(&vent, 6.0f + i * 6.0f, -5.0f, 3.0f, 2.0f);
        // Barrel tip
        SolidBrush tip(Color(255, 25, 20, 30));
        g.FillRectangle(&tip, 38.0f, -3.0f, 12.0f, 6.0f);
        SolidBrush muzzle(Color(255, 15, 10, 15));
        g.FillRectangle(&muzzle, 48.0f, -2.5f, 3.0f, 5.0f);
        // Box magazine hanging below
        PointF mag[] = { {4.0f, 6.0f}, {18.0f, 6.0f}, {20.0f, 22.0f}, {2.0f, 22.0f} };
        SolidBrush magBr(Color(255, 30, 25, 40));
        g.FillPolygon(&magBr, mag, 4);
        SolidBrush magHi(Color(255, 180, 80, 80));
        g.FillRectangle(&magHi, 5.0f, 8.0f, 2.0f, 12.0f);
        // Grip
        PointF grip[] = { {-6.0f, 4.0f}, {2.0f, 4.0f}, {0.0f, 15.0f}, {-8.0f, 15.0f} };
        SolidBrush gripBr(Color(255, 25, 18, 30));
        g.FillPolygon(&gripBr, grip, 4);
        // Red accent on body
        SolidBrush accent(Color(255, 230, 80, 100));
        g.FillRectangle(&accent, -4.0f, 1.0f, 3.0f, 2.0f);
    } else if (weaponType == 3) {
        // --- Crossbow: horizontal stock, two bow limbs at the front, nocked bolt
        SolidBrush stock(Color(255, 95, 55, 30));
        g.FillRectangle(&stock, -16.0f, -4.0f, 48.0f, 8.0f);
        SolidBrush stockTop(Color(255, 150, 95, 55));
        g.FillRectangle(&stockTop, -16.0f, -4.0f, 48.0f, 2.5f);
        SolidBrush rail(Color(255, 30, 20, 15));
        g.FillRectangle(&rail, -4.0f, -1.5f, 36.0f, 1.5f);
        // Front plate
        SolidBrush plate(Color(255, 60, 55, 70));
        g.FillRectangle(&plate, 24.0f, -5.0f, 10.0f, 10.0f);
        // Bow limbs — angled strips extending up and down from the front
        SolidBrush limb(Color(255, 170, 105, 55));
        PointF topLimb[] = { {28.0f, -5.0f}, {38.0f, -22.0f}, {44.0f, -21.0f}, {34.0f, -4.0f} };
        PointF botLimb[] = { {28.0f,  5.0f}, {38.0f,  22.0f}, {44.0f,  21.0f}, {34.0f,  4.0f} };
        g.FillPolygon(&limb, topLimb, 4);
        g.FillPolygon(&limb, botLimb, 4);
        SolidBrush limbTip(Color(255, 220, 160, 90));
        g.FillEllipse(&limbTip, 40.0f, -24.0f, 4.0f, 4.0f);
        g.FillEllipse(&limbTip, 40.0f,  20.0f, 4.0f, 4.0f);
        // Bowstring
        Pen bow(Color(255, 230, 220, 190), 1.5f);
        g.DrawLine(&bow, 42.0f, -22.0f, 42.0f, 22.0f);
        // Nocked bolt visible on rail
        SolidBrush shaft(Color(255, 190, 150, 110));
        g.FillRectangle(&shaft, 0.0f, -1.0f, 44.0f, 2.0f);
        // Arrowhead peeking out
        SolidBrush head(Color(255, 220, 220, 230));
        PointF hd[] = { {44.0f, -3.0f}, {50.0f, 0.0f}, {44.0f, 3.0f} };
        g.FillPolygon(&head, hd, 3);
        // Trigger + grip
        SolidBrush trig(Color(255, 170, 150, 120));
        g.FillRectangle(&trig, -5.0f, 4.0f, 2.5f, 5.0f);
        PointF grip[] = { {-10.0f, 4.0f}, {-2.0f, 4.0f}, {-4.0f, 17.0f}, {-14.0f, 17.0f} };
        SolidBrush gripBr(Color(255, 40, 25, 20));
        g.FillPolygon(&gripBr, grip, 4);
    } else if (weaponType == 5) {
        // --- Fireball staff: wooden shaft with flaming orb cradle at the tip
        SolidBrush shaft(Color(255, 85, 55, 35));
        PointF shaftP[] = { {-4.0f, -2.5f}, {24.0f, -1.5f}, {24.0f, 1.5f}, {-4.0f, 2.5f} };
        g.FillPolygon(&shaft, shaftP, 4);
        SolidBrush woodGrain(Color(255, 120, 80, 50));
        g.FillRectangle(&woodGrain, 0.0f, -0.5f, 22.0f, 1.0f);
        // Wrapped grip
        SolidBrush grip(Color(255, 40, 25, 30));
        g.FillRectangle(&grip, -8.0f, -3.5f, 12.0f, 7.0f);
        Pen goldBand(Color(255, 220, 160, 80), 1.2f);
        g.DrawLine(&goldBand, -7.0f, -3.5f, 3.0f, -3.5f);
        g.DrawLine(&goldBand, -7.0f,  3.5f, 3.0f,  3.5f);
        // Open iron cradle around orb
        Pen prong(Color(255, 60, 45, 35), 2.0f);
        g.DrawArc(&prong, 22.0f, -11.0f, 22.0f, 22.0f, 200.0f, 140.0f);
        // Outer flame glow
        SolidBrush glow(Color(120, 255, 120, 30));
        g.FillEllipse(&glow, 21.0f, -12.0f, 24.0f, 24.0f);
        // Fireball
        SolidBrush fire(Color(255, 255, 140, 30));
        g.FillEllipse(&fire, 25.0f, -9.0f, 18.0f, 18.0f);
        SolidBrush hot(Color(255, 255, 220, 60));
        g.FillEllipse(&hot, 28.0f, -6.0f, 10.0f, 10.0f);
        SolidBrush core(Color(255, 255, 255, 220));
        g.FillEllipse(&core, 31.0f, -3.0f, 4.0f, 4.0f);
        // Rising flame tongues
        SolidBrush tongue(Color(255, 255, 160, 50));
        PointF t1[] = { {28.0f, -10.0f}, {30.0f, -16.0f}, {33.0f, -10.0f} };
        PointF t2[] = { {34.0f, -11.0f}, {36.0f, -18.0f}, {39.0f, -10.0f} };
        g.FillPolygon(&tongue, t1, 3);
        g.FillPolygon(&tongue, t2, 3);
    } else if (weaponType == 4) {
        // --- Magic wand: short tapered shaft with a glowing gem at the tip
        SolidBrush shaft(Color(255, 60, 40, 75));
        PointF shaftP[] = { {-4.0f, -2.0f}, {26.0f, -1.0f}, {26.0f, 1.0f}, {-4.0f, 2.0f} };
        g.FillPolygon(&shaft, shaftP, 4);
        SolidBrush ribbon(Color(255, 180, 90, 230));
        g.FillRectangle(&ribbon, 6.0f, -0.6f, 14.0f, 1.2f);
        // Wrapped grip
        SolidBrush grip(Color(255, 35, 25, 45));
        g.FillRectangle(&grip, -6.0f, -3.0f, 10.0f, 6.0f);
        Pen gold(Color(255, 220, 170, 90), 1.0f);
        g.DrawLine(&gold, -5.0f, -3.0f, 3.0f, -3.0f);
        g.DrawLine(&gold, -5.0f,  3.0f, 3.0f,  3.0f);
        // Prongs cradling a gem
        Pen prong(Color(255, 230, 190, 110), 2.0f);
        g.DrawLine(&prong, 26.0f, -5.0f, 32.0f, -2.0f);
        g.DrawLine(&prong, 26.0f,  5.0f, 32.0f,  2.0f);
        // Outer glow
        SolidBrush glow(Color(130, 220, 140, 255));
        g.FillEllipse(&glow, 24.0f, -9.0f, 18.0f, 18.0f);
        // Gem core
        SolidBrush gem(Color(255, 180, 120, 255));
        g.FillEllipse(&gem, 28.0f, -5.0f, 10.0f, 10.0f);
        SolidBrush gemHi(Color(255, 255, 230, 255));
        g.FillEllipse(&gemHi, 29.0f, -4.0f, 4.0f, 4.0f);
    } else if (weaponType == -3) {
        // --- Enemy pistol: compact with red slide
        SolidBrush body(Color(255, 35, 25, 28));
        g.FillRectangle(&body, 0.0f, -4.0f, 22.0f, 8.0f);
        SolidBrush slide(Color(255, 220, 60, 60));
        g.FillRectangle(&slide, 0.0f, -4.0f, 22.0f, 2.5f);
        SolidBrush tip(Color(255, 15, 10, 15));
        g.FillRectangle(&tip, 20.0f, -3.0f, 4.0f, 6.0f);
        PointF grip[] = { {2.0f, 3.0f}, {10.0f, 3.0f}, {7.0f, 14.0f}, {-1.0f, 14.0f} };
        SolidBrush gripBr(Color(255, 30, 20, 22));
        g.FillPolygon(&gripBr, grip, 4);
    } else if (weaponType == -4) {
        // --- Enemy shotgun: double barrel, wide body, chunky stock
        SolidBrush stock(Color(255, 90, 50, 30));
        g.FillRectangle(&stock, -16.0f, -5.0f, 14.0f, 10.0f);
        SolidBrush bodyBr(Color(255, 40, 25, 28));
        g.FillRectangle(&bodyBr, -4.0f, -6.0f, 28.0f, 12.0f);
        SolidBrush barrelTop(Color(255, 60, 40, 45));
        g.FillRectangle(&barrelTop, 20.0f, -5.0f, 24.0f, 4.0f);
        SolidBrush barrelBot(Color(255, 60, 40, 45));
        g.FillRectangle(&barrelBot, 20.0f, 1.0f, 24.0f, 4.0f);
        SolidBrush muzzle(Color(255, 15, 10, 15));
        g.FillRectangle(&muzzle, 42.0f, -5.0f, 3.0f, 4.0f);
        g.FillRectangle(&muzzle, 42.0f,  1.0f, 3.0f, 4.0f);
        SolidBrush accent(Color(255, 220, 70, 70));
        g.FillRectangle(&accent, -2.0f, -2.0f, 20.0f, 2.0f);
        PointF grip[] = { {-6.0f, 5.0f}, {2.0f, 5.0f}, {0.0f, 16.0f}, {-8.0f, 16.0f} };
        SolidBrush gripBr(Color(255, 30, 20, 20));
        g.FillPolygon(&gripBr, grip, 4);
    } else if (weaponType == -5) {
        // --- Enemy sniper rifle: long slender body with scope
        SolidBrush stock(Color(255, 60, 35, 35));
        g.FillRectangle(&stock, -22.0f, -4.0f, 16.0f, 8.0f);
        SolidBrush bodyBr(Color(255, 25, 15, 20));
        g.FillRectangle(&bodyBr, -6.0f, -4.0f, 60.0f, 8.0f);
        SolidBrush barrelTop(Color(255, 50, 30, 35));
        g.FillRectangle(&barrelTop, -6.0f, -4.0f, 60.0f, 2.0f);
        // Scope
        SolidBrush scope(Color(255, 40, 25, 30));
        g.FillRectangle(&scope, 10.0f, -11.0f, 16.0f, 7.0f);
        SolidBrush lens(Color(255, 200, 120, 220));
        g.FillEllipse(&lens, 23.0f, -10.0f, 5.0f, 5.0f);
        // Muzzle brake
        SolidBrush muzzle(Color(255, 15, 10, 15));
        g.FillRectangle(&muzzle, 52.0f, -3.0f, 6.0f, 6.0f);
        // Bipod
        Pen bipod(Color(255, 30, 20, 25), 1.5f);
        g.DrawLine(&bipod, 38.0f, 4.0f, 34.0f, 12.0f);
        g.DrawLine(&bipod, 38.0f, 4.0f, 42.0f, 12.0f);
        PointF grip[] = { {-6.0f, 4.0f}, {2.0f, 4.0f}, {0.0f, 14.0f}, {-8.0f, 14.0f} };
        SolidBrush gripBr(Color(255, 30, 20, 25));
        g.FillPolygon(&gripBr, grip, 4);
    } else if (weaponType == -6) {
        // --- Boss rocket launcher: wide tube with fins
        SolidBrush shoulder(Color(255, 60, 40, 45));
        g.FillRectangle(&shoulder, -16.0f, -7.0f, 12.0f, 14.0f);
        SolidBrush tube(Color(255, 45, 30, 40));
        g.FillRectangle(&tube, -4.0f, -8.0f, 52.0f, 16.0f);
        SolidBrush tubeTop(Color(255, 80, 55, 65));
        g.FillRectangle(&tubeTop, -4.0f, -8.0f, 52.0f, 4.0f);
        // Fins
        SolidBrush fin(Color(255, 220, 90, 60));
        PointF f1[] = { {18.0f, -8.0f}, {26.0f, -14.0f}, {30.0f, -8.0f} };
        PointF f2[] = { {18.0f,  8.0f}, {26.0f,  14.0f}, {30.0f,  8.0f} };
        g.FillPolygon(&fin, f1, 3);
        g.FillPolygon(&fin, f2, 3);
        // Warhead loaded
        SolidBrush warhead(Color(255, 200, 70, 50));
        PointF wh[] = { {42.0f, -5.0f}, {56.0f, 0.0f}, {42.0f, 5.0f} };
        g.FillPolygon(&warhead, wh, 3);
        SolidBrush exhaust(Color(255, 20, 15, 20));
        g.FillRectangle(&exhaust, -8.0f, -4.0f, 4.0f, 8.0f);
        PointF grip[] = { {-6.0f, 8.0f}, {2.0f, 8.0f}, {0.0f, 18.0f}, {-8.0f, 18.0f} };
        SolidBrush gripBr(Color(255, 30, 20, 25));
        g.FillPolygon(&gripBr, grip, 4);
    } else if (weaponType == -7) {
        // --- Boss arc / laser cannon: big emitter with a focusing crystal
        SolidBrush shell(Color(255, 40, 20, 70));
        g.FillRectangle(&shell, -10.0f, -8.0f, 58.0f, 16.0f);
        SolidBrush shellTop(Color(255, 80, 50, 110));
        g.FillRectangle(&shellTop, -10.0f, -8.0f, 58.0f, 4.0f);
        // Glowing inner coil
        LinearGradientBrush coil(PointF(-4.0f, -2.0f), PointF(40.0f, -2.0f),
                                 Color(255, 200, 100, 255),
                                 Color(255, 255, 255, 255));
        g.FillRectangle(&coil, -4.0f, -2.0f, 44.0f, 4.0f);
        // Crystal emitter
        SolidBrush crystal(Color(255, 220, 130, 255));
        PointF cr[] = { {44.0f, -10.0f}, {60.0f, 0.0f}, {44.0f, 10.0f}, {38.0f, 0.0f} };
        g.FillPolygon(&crystal, cr, 4);
        SolidBrush crystalHi(Color(255, 255, 230, 255));
        PointF crh[] = { {46.0f, -4.0f}, {52.0f, 0.0f}, {46.0f, 2.0f} };
        g.FillPolygon(&crystalHi, crh, 3);
        // Vents
        SolidBrush vent(Color(255, 20, 10, 25));
        for (int i = 0; i < 3; i++)
            g.FillRectangle(&vent, 4.0f + i * 8.0f, -7.0f, 4.0f, 2.0f);
        PointF grip[] = { {-6.0f, 8.0f}, {2.0f, 8.0f}, {0.0f, 18.0f}, {-8.0f, 18.0f} };
        SolidBrush gripBr(Color(255, 30, 20, 40));
        g.FillPolygon(&gripBr, grip, 4);
    } else if (weaponType == -8) {
        // --- Boss minigun: six rotating barrels
        SolidBrush shell(Color(255, 40, 30, 45));
        g.FillRectangle(&shell, -8.0f, -10.0f, 20.0f, 20.0f);
        SolidBrush ring(Color(255, 60, 45, 70));
        g.FillEllipse(&ring, 10.0f, -12.0f, 22.0f, 24.0f);
        SolidBrush barrelCluster(Color(255, 25, 20, 30));
        g.FillRectangle(&barrelCluster, 28.0f, -8.0f, 32.0f, 16.0f);
        // Individual barrels
        SolidBrush bar(Color(255, 60, 50, 65));
        for (int i = 0; i < 3; i++) {
            float by = -7.0f + i * 5.0f;
            g.FillRectangle(&bar, 32.0f, by, 28.0f, 2.0f);
        }
        SolidBrush muzzle(Color(255, 15, 10, 15));
        g.FillRectangle(&muzzle, 58.0f, -8.0f, 3.0f, 16.0f);
        // Ammo belt
        SolidBrush belt(Color(255, 220, 90, 70));
        for (int i = 0; i < 5; i++)
            g.FillRectangle(&belt, -12.0f + i * 3.0f, 8.0f + i * 1.0f, 2.0f, 4.0f);
        PointF grip[] = { {-10.0f, 8.0f}, {-2.0f, 8.0f}, {-4.0f, 18.0f}, {-12.0f, 18.0f} };
        SolidBrush gripBr(Color(255, 30, 20, 25));
        g.FillPolygon(&gripBr, grip, 4);
    } else {
        // --- Enemy rifle: short dark carbine with red accent
        SolidBrush body(Color(255, 30, 22, 25));
        g.FillRectangle(&body, -4.0f, -5.0f, 32.0f, 9.0f);
        SolidBrush bodyTop(Color(255, 55, 40, 45));
        g.FillRectangle(&bodyTop, -4.0f, -5.0f, 32.0f, 2.5f);
        SolidBrush tip(Color(255, 15, 10, 15));
        g.FillRectangle(&tip, 26.0f, -3.0f, 6.0f, 6.0f);
        SolidBrush accent(Color(255, 230, 60, 60));
        g.FillRectangle(&accent, 4.0f, -3.0f, 8.0f, 2.0f);
        // Short mag
        PointF mag[] = { {6.0f, 4.0f}, {14.0f, 4.0f}, {15.0f, 14.0f}, {5.0f, 14.0f} };
        SolidBrush magBr(Color(255, 25, 18, 20));
        g.FillPolygon(&magBr, mag, 4);
        // Grip
        PointF grip[] = { {-4.0f, 4.0f}, {2.0f, 4.0f}, {0.0f, 14.0f}, {-6.0f, 14.0f} };
        SolidBrush gripBr(Color(255, 30, 20, 22));
        g.FillPolygon(&gripBr, grip, 4);
    }
}

// Draw a procedural humanoid character (player or enemy)
// weaponType: 0..4 for player weapons, -1 for enemy rifle, -2 for none.
// armorAmt in [0,1]: draws a chestplate overlay on torso when > 0.
// scale: scales every dimension; isBoss adds horns and darker outline.
static void drawHumanoid(Graphics& g, float cx, float groundY, int facing,
                         float animT, bool moving, bool sprinting, bool onGround,
                         float aimAngle, int weaponType,
                         Color body, Color accent, Color skin, float hurtFlash,
                         float armorAmt = 0.0f, float scale = 1.0f, bool isBoss = false) {
    // Positions (center bottom at cx, groundY)
    float torsoH = 28.0f * scale, torsoW = 22.0f * scale;
    float headR  = 11.0f * scale;
    float legLen = 26.0f * scale;
    float armLen = 20.0f * scale;

    float torsoCenterY = groundY - 42.0f * scale;
    float headCenterY  = torsoCenterY - torsoH/2 - headR + 2.0f * scale;

    // Walk cycle
    float phase = animT * (sprinting ? 14.0f : 10.0f);
    float legSwing = moving && onGround ? std::sin(phase) * (sprinting ? 20.0f : 14.0f) : 0.0f;
    float armSwing = moving && onGround ? std::sin(phase + PI) * (sprinting ? 10.0f : 6.0f) : 0.0f;
    float bob = moving && onGround ? std::abs(std::sin(phase)) * -3.0f * scale
                                   : std::sin(animT * 2.4f) * -1.6f * scale;

    if (!onGround) { legSwing = 0; armSwing = 0; bob = 0; }

    // Shadow
    SolidBrush shadow(Color(110, 0, 0, 0));
    g.FillEllipse(&shadow, cx - 22.0f * scale, groundY - 4.0f,
                  44.0f * scale, 10.0f * scale);

    // Class cosmetics: cape for magical weapons, extended armor for firearms.
    bool magicClass = (weaponType == 4 || weaponType == 5);
    bool gunClass   = (weaponType >= 0 && weaponType <= 3);
    if (magicClass) {
        float capeTop = groundY - 42.0f * scale - 28.0f * scale / 2.0f + 2.0f * scale;
        float capeBot = groundY - 6.0f * scale;
        float sway = std::sin(animT * 2.5f) * 4.0f * scale;
        float backSign = -facing;
        PointF cape[] = {
            { cx + facing * 2.0f * scale,              capeTop },
            { cx + backSign * torsoW * 0.35f,          capeTop + 2.0f * scale },
            { cx + backSign * (torsoW * 0.55f + sway), capeTop + torsoH * 0.5f },
            { cx + backSign * (torsoW * 0.7f + sway * 1.5f),  capeBot },
            { cx + backSign * (torsoW * 0.15f + sway * 0.5f), capeBot + 6.0f * scale },
            { cx + facing * (torsoW * 0.15f),          capeBot - 2.0f * scale }
        };
        SolidBrush capeBr(Color(235, 100, 20, 150));
        g.FillPolygon(&capeBr, cape, 6);
        // Trim highlight running along the edge nearest the player
        Pen trim(Color(220, 240, 190, 90), 1.5f);
        g.DrawPolygon(&trim, cape, 6);
        // Clasp at the neck
        SolidBrush clasp(Color(255, 230, 170, 90));
        g.FillEllipse(&clasp, cx - 4.0f * scale, capeTop - 2.0f * scale,
                      8.0f * scale, 5.0f * scale);
    }

    // Legs (two rectangles rotated)
    Color legC = Color(hurtFlash > 0 ? 255 : body.GetA(),
                       hurtFlash > 0 ? 255 : (BYTE)std::max(0, body.GetR() - 40),
                       hurtFlash > 0 ? 255 : (BYTE)std::max(0, body.GetG() - 40),
                       hurtFlash > 0 ? 255 : (BYTE)std::max(0, body.GetB() - 40));
    for (int side = -1; side <= 1; side += 2) {
        float hipX = cx + side * 5.0f * scale;
        float hipY = torsoCenterY + torsoH/2;
        float ang  = (side == 1 ? legSwing : -legSwing) * (float)(PI / 180.0f);
        float footX = hipX + std::sin(ang) * legLen;
        float footY = hipY + std::cos(ang) * legLen;
        Pen pen(legC, 7.0f * scale);
        pen.SetStartCap(LineCapRound); pen.SetEndCap(LineCapRound);
        g.DrawLine(&pen, hipX, hipY + bob, footX, footY + bob);
    }

    // Torso
    SolidBrush torsoBr(hurtFlash > 0 ? Color(255,255,255,255) : body);
    g.FillEllipse(&torsoBr, cx - torsoW/2, torsoCenterY - torsoH/2 + bob,
                  torsoW, torsoH);

    // Belt / accent
    SolidBrush accentBr(accent);
    g.FillRectangle(&accentBr, cx - torsoW/2,
                    torsoCenterY + torsoH/2 - 4.0f * scale + bob,
                    torsoW, 4.0f * scale);

    // Tactical armor overlay for firearm class
    if (gunClass) {
        // Chest plate
        SolidBrush chest(Color(230, 55, 70, 100));
        PointF cp[] = {
            { cx - torsoW * 0.45f, torsoCenterY - torsoH * 0.28f + bob },
            { cx + torsoW * 0.45f, torsoCenterY - torsoH * 0.28f + bob },
            { cx + torsoW * 0.5f,  torsoCenterY + torsoH * 0.15f + bob },
            { cx - torsoW * 0.5f,  torsoCenterY + torsoH * 0.15f + bob }
        };
        g.FillPolygon(&chest, cp, 4);
        Pen cpr(Color(255, 190, 220, 230), 1.2f);
        g.DrawPolygon(&cpr, cp, 4);
        // Diagonal strap
        Pen strap(Color(255, 30, 15, 25), 2.5f * scale);
        g.DrawLine(&strap,
                   cx - torsoW * 0.5f, torsoCenterY - torsoH * 0.25f + bob,
                   cx + torsoW * 0.4f, torsoCenterY + torsoH * 0.12f + bob);
        // Shoulder pads (bulge above shoulders)
        SolidBrush pad(Color(255, 50, 65, 95));
        g.FillEllipse(&pad, cx - torsoW * 0.6f,
                      torsoCenterY - torsoH * 0.55f + bob,
                      torsoW * 0.5f, torsoH * 0.35f);
        g.FillEllipse(&pad, cx + torsoW * 0.1f,
                      torsoCenterY - torsoH * 0.55f + bob,
                      torsoW * 0.5f, torsoH * 0.35f);
        Pen padRim(Color(255, 180, 210, 220), 1.0f);
        g.DrawEllipse(&padRim, cx - torsoW * 0.6f,
                      torsoCenterY - torsoH * 0.55f + bob,
                      torsoW * 0.5f, torsoH * 0.35f);
        g.DrawEllipse(&padRim, cx + torsoW * 0.1f,
                      torsoCenterY - torsoH * 0.55f + bob,
                      torsoW * 0.5f, torsoH * 0.35f);
    }

    // Armor chestplate overlay
    if (armorAmt > 0.0f) {
        BYTE a = (BYTE)std::min(255.0f, 170.0f + armorAmt * 85.0f);
        SolidBrush plate(Color(a, 110, 180, 230));
        PointF pl[] = {
            { cx - torsoW * 0.42f, torsoCenterY - torsoH * 0.35f + bob },
            { cx + torsoW * 0.42f, torsoCenterY - torsoH * 0.35f + bob },
            { cx + torsoW * 0.5f,  torsoCenterY + torsoH * 0.1f + bob },
            { cx,                  torsoCenterY + torsoH * 0.28f + bob },
            { cx - torsoW * 0.5f,  torsoCenterY + torsoH * 0.1f + bob }
        };
        g.FillPolygon(&plate, pl, 5);
        Pen rim(Color(a, 200, 230, 255), 1.5f);
        g.DrawPolygon(&rim, pl, 5);
        // Center sheen
        SolidBrush sheen(Color((BYTE)(a * 0.7f), 220, 240, 255));
        g.FillRectangle(&sheen, cx - 2.0f * scale,
                        torsoCenterY - torsoH * 0.3f + bob,
                        4.0f * scale, torsoH * 0.5f);
    }

    // Head
    SolidBrush headBr(hurtFlash > 0 ? Color(255,255,255,255) : skin);
    g.FillEllipse(&headBr, cx - headR, headCenterY - headR + bob, headR*2, headR*2);

    // Helmet band for firearm class
    if (gunClass) {
        SolidBrush band(Color(230, 50, 65, 95));
        g.FillRectangle(&band, cx - headR, headCenterY - headR * 0.6f + bob,
                        headR * 2, headR * 0.55f);
        Pen bandRim(Color(255, 190, 220, 220), 1.0f);
        g.DrawRectangle(&bandRim, cx - headR, headCenterY - headR * 0.6f + bob,
                        headR * 2, headR * 0.55f);
    }

    // Wizard hood for magic class - little peaked top
    if (magicClass) {
        SolidBrush hood(Color(255, 110, 25, 150));
        PointF hd[] = {
            { cx - headR * 0.9f, headCenterY - headR * 0.5f + bob },
            { cx + headR * 0.9f, headCenterY - headR * 0.5f + bob },
            { cx + facing * headR * 0.4f, headCenterY - headR * 1.8f + bob }
        };
        g.FillPolygon(&hood, hd, 3);
    }

    // Visor / eye
    {
        SolidBrush visBr(isBoss ? Color(255, 255, 60, 60)
                       : magicClass ? Color(255, 180, 90, 255)
                       : Color(255, 50, 230, 255));
        float vx = cx + facing * 2.0f * scale - 5.0f * scale;
        float vy = headCenterY - 2.0f * scale + bob;
        g.FillRectangle(&visBr, vx, vy, 10.0f * scale, 3.0f * scale);
    }

    // Boss horns + crown
    if (isBoss) {
        SolidBrush horn(Color(255, 200, 60, 70));
        PointF h1[] = {
            { cx - headR * 0.6f, headCenterY - headR + bob },
            { cx - headR * 1.0f, headCenterY - headR * 2.2f + bob },
            { cx - headR * 0.3f, headCenterY - headR * 0.9f + bob }
        };
        PointF h2[] = {
            { cx + headR * 0.6f, headCenterY - headR + bob },
            { cx + headR * 1.0f, headCenterY - headR * 2.2f + bob },
            { cx + headR * 0.3f, headCenterY - headR * 0.9f + bob }
        };
        g.FillPolygon(&horn, h1, 3);
        g.FillPolygon(&horn, h2, 3);
    }

    // Back arm
    {
        float shoulderX = cx - facing * 4.0f * scale;
        float shoulderY = torsoCenterY - torsoH/2 + 4.0f * scale + bob;
        float ang = (armSwing) * (float)(PI / 180.0f);
        float handX = shoulderX + std::sin(ang) * armLen * facing;
        float handY = shoulderY + std::cos(ang) * armLen;
        Pen pen(legC, 5.5f * scale);
        pen.SetStartCap(LineCapRound); pen.SetEndCap(LineCapRound);
        g.DrawLine(&pen, shoulderX, shoulderY, handX, handY);
    }

    // Front arm aiming
    {
        float shoulderX = cx + facing * 4.0f * scale;
        float shoulderY = torsoCenterY - torsoH/2 + 6.0f * scale + bob;
        float armX = shoulderX + std::cos(aimAngle) * 22.0f * scale;
        float armY = shoulderY + std::sin(aimAngle) * 22.0f * scale;
        Pen pen(Color(hurtFlash > 0 ? 255 : body.GetA(),
                      (BYTE)std::max(0, body.GetR() - 20),
                      (BYTE)std::max(0, body.GetG() - 20),
                      (BYTE)std::max(0, body.GetB() - 20)), 5.5f * scale);
        pen.SetStartCap(LineCapRound); pen.SetEndCap(LineCapRound);
        g.DrawLine(&pen, shoulderX, shoulderY, armX, armY);

        if (weaponType != -2) {
            Matrix saved;
            g.GetTransform(&saved);
            g.TranslateTransform(armX, armY);
            g.RotateTransform(aimAngle * 180.0f / (float)PI);
            if (std::cos(aimAngle) < 0.0f) g.ScaleTransform(1.0f, -1.0f);
            if (scale != 1.0f) g.ScaleTransform(scale, scale);
            drawWeapon(g, weaponType);
            g.SetTransform(&saved);
        }
    }
}

static void drawBackground(Graphics& g, Game& G, float camX) {
    const MapTheme& T = MAP_THEMES[G.mapTheme];
    LinearGradientBrush skyBr(Point(0, 0), Point(0, SCREEN_H),
                              T.skyTop, T.skyBottom);
    g.FillRectangle(&skyBr, 0, 0, SCREEN_W, SCREEN_H);

    // Moon
    SolidBrush moonGlow(Color(80, 255, 220, 255));
    g.FillEllipse(&moonGlow, 940, 60, 180, 180);
    SolidBrush moon(Color(255, 240, 230, 255));
    g.FillEllipse(&moon, 980, 90, 100, 100);

    // Stars (twinkle)
    for (auto& s : G.stars) {
        float sx = s.x - camX * 0.1f;
        sx = std::fmod(sx + WORLD_W, (float)WORLD_W);
        if (sx < 0 || sx > SCREEN_W) continue;
        float tw = 0.5f + 0.5f * std::sin(G.time * 3.0f + s.x * 0.1f);
        SolidBrush b(Color((BYTE)(160 * tw + 60), 255, 255, 255));
        g.FillEllipse(&b, sx, s.y, 2.0f, 2.0f);
    }

    // Far layer
    for (auto& s : G.bgFar) {
        float sx = s.x - camX * 0.25f;
        sx = std::fmod(sx + WORLD_W, (float)WORLD_W);
        if (sx + s.w < 0 || sx > SCREEN_W) continue;
        // triangular mountains
        std::vector<PointF> pts = {
            { sx, s.y + s.h },
            { sx + s.w * 0.5f, s.y },
            { sx + s.w, s.y + s.h }
        };
        drawFilledPath(g, s.color, pts);
    }
    // Mid layer
    for (auto& s : G.bgMid) {
        float sx = s.x - camX * 0.5f;
        sx = std::fmod(sx + WORLD_W, (float)WORLD_W);
        if (sx + s.w < 0 || sx > SCREEN_W) continue;
        std::vector<PointF> pts = {
            { sx, s.y + s.h },
            { sx + s.w * 0.3f, s.y + 10.0f },
            { sx + s.w * 0.6f, s.y + 40.0f },
            { sx + s.w, s.y + s.h }
        };
        drawFilledPath(g, s.color, pts);
    }
    // Near layer: neon pillars
    for (auto& s : G.bgNear) {
        float sx = s.x - camX * 0.75f;
        sx = std::fmod(sx + WORLD_W, (float)WORLD_W);
        if (sx + s.w < 0 || sx > SCREEN_W) continue;
        LinearGradientBrush br(PointF(sx, s.y), PointF(sx, s.y + s.h),
                               s.color, Color(255, 20, 10, 30));
        g.FillRectangle(&br, sx, s.y, s.w, s.h);
        // Top glow dot
        SolidBrush glow(Color(180, s.color.GetR(), s.color.GetG(), s.color.GetB()));
        g.FillEllipse(&glow, sx + s.w/2 - 8, s.y - 8, 16.0f, 16.0f);
    }
    // Ground fog (theme-colored)
    Color fogTop(0, T.fogColor.GetR(), T.fogColor.GetG(), T.fogColor.GetB());
    LinearGradientBrush fog(Point(0, 500), Point(0, 620), fogTop, T.fogColor);
    g.FillRectangle(&fog, 0, 500, SCREEN_W, 120);
}

static void drawPlatforms(Graphics& g, Game& G, float camX) {
    for (auto& p : G.platforms) {
        float sx = p.x - camX;
        if (sx + p.w < 0 || sx > SCREEN_W) continue;
        // Shadow underside
        SolidBrush shad(Color(140, 0, 0, 0));
        g.FillRectangle(&shad, sx + 6, p.y + p.h, p.w, 6.0f);
        // Body
        LinearGradientBrush body(PointF(sx, p.y), PointF(sx, p.y + p.h),
                                 Color(255,
                                       (BYTE)std::min(255, p.color.GetR() + 30),
                                       (BYTE)std::min(255, p.color.GetG() + 30),
                                       (BYTE)std::min(255, p.color.GetB() + 30)),
                                 p.color);
        g.FillRectangle(&body, sx, p.y, p.w, p.h);
        // Top neon line
        Pen neon(Color(255, 80, 230, 255), 2.0f);
        g.DrawLine(&neon, sx, p.y + 1, sx + p.w, p.y + 1);
        // Side accents
        SolidBrush acc(Color(255, 255, 90, 170));
        g.FillRectangle(&acc, sx, p.y, 3.0f, p.h);
        g.FillRectangle(&acc, sx + p.w - 3, p.y, 3.0f, p.h);
    }
}

static void drawBullets(Graphics& g, Game& G, float camX) {
    for (auto& b : G.bullets) {
        float sx = b.pos.x - camX, sy = b.pos.y;
        // Trail (common to all)
        for (size_t i = 0; i < b.trailPts.size(); ++i) {
            float tx = b.trailPts[i].x - camX;
            float ty = b.trailPts[i].y;
            BYTE alpha = (BYTE)(40 + 20 * i);
            Color c(alpha, b.color.GetR(), b.color.GetG(), b.color.GetB());
            SolidBrush br(c);
            float r = 2.0f + i * 0.4f;
            g.FillEllipse(&br, tx - r, ty - r, r*2, r*2);
        }
        if (b.isFireball) {
            // Outer glow
            SolidBrush haze(Color(70, 255, 140, 60));
            g.FillEllipse(&haze, sx - 24, sy - 24, 48.0f, 48.0f);
            SolidBrush outer(Color(180, 255, 180, 60));
            g.FillEllipse(&outer, sx - 16, sy - 16, 32.0f, 32.0f);
            SolidBrush mid(Color(230, 255, 230, 110));
            g.FillEllipse(&mid, sx - 10, sy - 10, 20.0f, 20.0f);
            SolidBrush hot(Color(255, 255, 240, 200));
            g.FillEllipse(&hot, sx - 5, sy - 5, 10.0f, 10.0f);
            // Ember sparks around it
            float t = G.time * 10.0f;
            for (int i = 0; i < 4; ++i) {
                float a = t + i * 1.57f;
                SolidBrush spark(Color(220, 255, 200, 90));
                g.FillEllipse(&spark,
                              sx + std::cos(a) * 10 - 2,
                              sy + std::sin(a) * 10 - 2, 4.0f, 4.0f);
            }
        } else if (b.isBolt) {
            float ang = std::atan2(b.vel.y, b.vel.x);
            Matrix saved;
            g.GetTransform(&saved);
            g.TranslateTransform(sx, sy);
            g.RotateTransform(ang * 180.0f / (float)3.14159265f);
            // Shaft
            SolidBrush shaft(Color(255, 210, 160, 110));
            g.FillRectangle(&shaft, -16.0f, -1.5f, 28.0f, 3.0f);
            // Arrowhead
            SolidBrush head(Color(255, 240, 240, 250));
            PointF hd[] = { { 12.0f, -4.5f }, { 22.0f, 0.0f }, { 12.0f, 4.5f } };
            g.FillPolygon(&head, hd, 3);
            // Fletching
            SolidBrush fletch(Color(255, 230, 90, 110));
            PointF f1[] = { { -16.0f, -5.5f }, { -8.0f, -1.5f }, { -16.0f, -1.5f } };
            PointF f2[] = { { -16.0f,  5.5f }, { -8.0f,  1.5f }, { -16.0f,  1.5f } };
            g.FillPolygon(&fletch, f1, 3);
            g.FillPolygon(&fletch, f2, 3);
            g.SetTransform(&saved);
        } else if (b.isMagic) {
            // Soft outer aura
            SolidBrush aura(Color(90, b.color.GetR(), b.color.GetG(), b.color.GetB()));
            g.FillEllipse(&aura, sx - 14, sy - 14, 28.0f, 28.0f);
            SolidBrush mid(Color(160, b.color.GetR(), b.color.GetG(), b.color.GetB()));
            g.FillEllipse(&mid, sx - 8, sy - 8, 16.0f, 16.0f);
            SolidBrush core(Color(255, 255, 240, 255));
            g.FillEllipse(&core, sx - 4, sy - 4, 8.0f, 8.0f);
        } else {
            // Default tracer
            SolidBrush glow(Color(80, b.color.GetR(), b.color.GetG(), b.color.GetB()));
            g.FillEllipse(&glow, sx - 8, sy - 8, 16.0f, 16.0f);
            SolidBrush core(Color(255, 255, 255, 255));
            g.FillEllipse(&core, sx - 2.5f, sy - 2.5f, 5.0f, 5.0f);
        }
    }
}

static void drawLightning(Graphics& g, Game& G, float camX) {
    for (auto& s : G.strikes) {
        float t = s.life / s.maxLife;
        BYTE a = (BYTE)(std::max(0.0f, std::min(1.0f, t)) * 255);
        for (auto& arc : s.arcs) {
            if (arc.points.size() < 2) continue;
            std::vector<PointF> pts;
            pts.reserve(arc.points.size());
            for (auto& p : arc.points) pts.push_back(PointF(p.x - camX, p.y));
            // Outer bloom
            Pen bloom(Color((BYTE)(a * 0.35f), 180, 220, 255), 12.0f);
            bloom.SetLineJoin(LineJoinRound);
            g.DrawLines(&bloom, pts.data(), (INT)pts.size());
            // Mid bluish-white
            Pen mid(Color((BYTE)(a * 0.65f), 220, 230, 255), 6.0f);
            mid.SetLineJoin(LineJoinRound);
            g.DrawLines(&mid, pts.data(), (INT)pts.size());
            // Hot core
            Pen core(Color(a, 255, 255, 255), 2.0f);
            core.SetLineJoin(LineJoinRound);
            g.DrawLines(&core, pts.data(), (INT)pts.size());
        }
    }
}

static void drawPortal(Graphics& g, Game& G, float camX) {
    if (!G.portalActive) return;
    float sx = G.portalPos.x - camX;
    float sy = G.portalPos.y;
    float t  = G.portalT;
    float pulse = 0.75f + 0.25f * std::sin(t * 4.0f);
    float rotA  = t * 90.0f;  // degrees per second

    // Outer purple haze
    SolidBrush haze(Color((BYTE)(90 * pulse), 180, 120, 240));
    g.FillEllipse(&haze, sx - 90, sy - 90, 180.0f, 180.0f);
    SolidBrush haze2(Color((BYTE)(140 * pulse), 220, 160, 255));
    g.FillEllipse(&haze2, sx - 70, sy - 70, 140.0f, 140.0f);
    // Body ring
    SolidBrush body(Color(255, 90, 40, 140));
    g.FillEllipse(&body, sx - 54, sy - 54, 108.0f, 108.0f);
    SolidBrush inner(Color(255, 180, 120, 240));
    g.FillEllipse(&inner, sx - 44, sy - 44, 88.0f, 88.0f);
    // Swirling vortex arcs
    for (int i = 0; i < 4; ++i) {
        float a = rotA + i * 90.0f;
        float r = 42.0f - i * 6.0f;
        Color c((BYTE)(200 - i * 30),
                (BYTE)(220 + i * 5),
                (BYTE)(200 - i * 20),
                (BYTE)(255 - i * 20));
        Pen pen(c, 3.0f);
        pen.SetStartCap(LineCapRound); pen.SetEndCap(LineCapRound);
        g.DrawArc(&pen, sx - r, sy - r, r * 2, r * 2, a, 150.0f);
    }
    // Hot core
    SolidBrush core(Color(255, 255, 240, 255));
    g.FillEllipse(&core, sx - 10, sy - 10, 20.0f, 20.0f);
    // Rising sparkle particles (procedural - no need for the particle system)
    for (int i = 0; i < 12; ++i) {
        float phase = t * 2.0f + i * 0.5f;
        float ox = std::sin(phase) * 48.0f;
        float oy = -std::fmod(t * 60.0f + i * 15.0f, 110.0f) + 10.0f;
        BYTE a = (BYTE)(220.0f * (1.0f - std::abs(oy) / 110.0f));
        SolidBrush s(Color(a, 255, 230, 255));
        g.FillEllipse(&s, sx + ox - 2, sy + oy - 2, 4.0f, 4.0f);
    }
    // Floor glyph
    SolidBrush glyph(Color(180, 200, 150, 240));
    g.FillEllipse(&glyph, sx - 46, sy + 48, 92.0f, 16.0f);

    // "ENTER" prompt
    Font prompt(L"Segoe UI", 14, FontStyleBold);
    StringFormat fmt; fmt.SetAlignment(StringAlignmentCenter);
    SolidBrush white(Color(255, 255, 255, 255));
    RectF r(sx - 100.0f, sy - 110.0f, 200.0f, 22.0f);
    g.DrawString(L"ENTER", -1, &prompt, r, &fmt, &white);
}

static void drawPickups(Graphics& g, Game& G, float camX) {
    for (auto& pk : G.pickups) {
        float sx = pk.pos.x - camX;
        float wobble = std::sin(pk.bob * 4.0f) * 3.0f;
        float sy = pk.pos.y - 14.0f + (pk.onGround ? wobble : 0.0f);
        BYTE alpha = (pk.life < 2.0f) ? (BYTE)((std::sin(pk.life * 12.0f) + 1) * 110 + 30)
                                      : 255;
        if (pk.kind == PU_HP) {
            SolidBrush glow(Color((BYTE)(alpha / 3), 255, 100, 150));
            g.FillEllipse(&glow, sx - 18, sy - 18, 36.0f, 36.0f);
            SolidBrush box(Color(alpha, 255, 240, 240));
            g.FillRectangle(&box, sx - 11, sy - 11, 22.0f, 22.0f);
            SolidBrush red(Color(alpha, 230, 60, 90));
            g.FillRectangle(&red, sx - 2.5f, sy - 9, 5.0f, 18.0f);
            g.FillRectangle(&red, sx - 9, sy - 2.5f, 18.0f, 5.0f);
        } else if (pk.kind == PU_AMMO) {
            SolidBrush glow(Color((BYTE)(alpha / 3), 120, 220, 255));
            g.FillEllipse(&glow, sx - 18, sy - 18, 36.0f, 36.0f);
            SolidBrush body(Color(alpha, 35, 30, 50));
            PointF mag[] = { { sx - 8, sy - 10 }, { sx + 8, sy - 10 },
                             { sx + 10, sy + 10 }, { sx - 10, sy + 10 } };
            g.FillPolygon(&body, mag, 4);
            SolidBrush cyan(Color(alpha, 120, 220, 255));
            g.FillRectangle(&cyan, sx - 5, sy - 6, 3.0f, 12.0f);
            g.FillRectangle(&cyan, sx + 2, sy - 6, 3.0f, 12.0f);
        } else if (pk.kind == PU_ARMOR) {
            SolidBrush glow(Color((BYTE)(alpha / 3), 120, 200, 255));
            g.FillEllipse(&glow, sx - 18, sy - 18, 36.0f, 36.0f);
            SolidBrush plate(Color(alpha, 120, 180, 230));
            PointF sh[] = { { sx - 11, sy - 10 }, { sx + 11, sy - 10 },
                            { sx + 11, sy + 2 }, { sx, sy + 12 },
                            { sx - 11, sy + 2 } };
            g.FillPolygon(&plate, sh, 5);
            Pen rim(Color(alpha, 210, 230, 255), 1.5f);
            g.DrawPolygon(&rim, sh, 5);
        } else { // PU_PERK
            // Radiating halo
            float pulse = 0.65f + 0.35f * std::sin(pk.bob * 6.0f);
            SolidBrush halo(Color((BYTE)(alpha * 0.25f * pulse), 200, 150, 240));
            g.FillEllipse(&halo, sx - 26, sy - 26, 52.0f, 52.0f);
            SolidBrush halo2(Color((BYTE)(alpha * 0.4f * pulse), 230, 180, 255));
            g.FillEllipse(&halo2, sx - 18, sy - 18, 36.0f, 36.0f);
            // Diamond (two triangles)
            SolidBrush gem(Color(alpha, 220, 170, 255));
            PointF d1[] = { { sx, sy - 14 }, { sx + 12, sy }, { sx - 12, sy } };
            PointF d2[] = { { sx - 12, sy }, { sx + 12, sy }, { sx, sy + 14 } };
            g.FillPolygon(&gem, d1, 3);
            g.FillPolygon(&gem, d2, 3);
            // Highlight ridge
            SolidBrush hi(Color(alpha, 255, 240, 255));
            PointF hl[] = { { sx - 4, sy - 6 }, { sx, sy - 14 }, { sx + 4, sy - 6 },
                            { sx, sy - 2 } };
            g.FillPolygon(&hi, hl, 4);
            // Sparkles orbiting
            for (int i = 0; i < 4; ++i) {
                float ang = pk.bob * 3.0f + i * 1.57f;
                SolidBrush s(Color((BYTE)(alpha * pulse), 255, 240, 255));
                g.FillEllipse(&s,
                              sx + std::cos(ang) * 18 - 2,
                              sy + std::sin(ang) * 18 - 2, 4.0f, 4.0f);
            }
        }
    }
}

static void drawParticles(Graphics& g, Game& G, float camX) {
    for (auto& p : G.particles) {
        float t = p.life / p.maxLife;
        BYTE a = (BYTE)(std::max(0.0f, std::min(1.0f, t)) * p.color.GetA());
        Color c(a, p.color.GetR(), p.color.GetG(), p.color.GetB());
        SolidBrush br(c);
        float sz = p.size * (0.3f + 0.7f * t);
        g.FillEllipse(&br, p.pos.x - camX - sz, p.pos.y - sz, sz*2, sz*2);
    }
}

static void drawEnemyHealth(Graphics& g, Enemy& e, float camX) {
    float sx = e.pos.x - camX - 22;
    float sy = e.pos.y - e.h - 14;
    SolidBrush bg(Color(200, 20, 10, 20));
    g.FillRectangle(&bg, sx, sy, 44.0f, 5.0f);
    float frac = clampf(e.hp / e.hpMax, 0, 1);
    SolidBrush fg(Color(255, 255, 90, 90));
    g.FillRectangle(&fg, sx, sy, 44.0f * frac, 5.0f);
}

static void drawHUD(Graphics& g, Game& G) {
    Font font(L"Segoe UI", 14, FontStyleBold);
    Font bigFont(L"Impact", 36, FontStyleRegular);
    Font medFont(L"Segoe UI", 18, FontStyleBold);
    SolidBrush white(Color(255, 255, 255, 255));

    // Level badge
    float lx = 24.0f, ly = 24.0f;
    SolidBrush badgeBg(Color(220, 30, 15, 50));
    g.FillEllipse(&badgeBg, lx, ly, 42.0f, 42.0f);
    Pen badgePen(Color(255, 255, 230, 120), 2.0f);
    g.DrawEllipse(&badgePen, lx, ly, 42.0f, 42.0f);
    Font lvFont(L"Impact", 22, FontStyleRegular);
    StringFormat lvFmt; lvFmt.SetAlignment(StringAlignmentCenter);
    RectF lvRect(lx, ly + 4.0f, 42.0f, 34.0f);
    SolidBrush lvBr(Color(255, 255, 230, 120));
    g.DrawString(std::to_wstring(G.player.level).c_str(), -1, &lvFont, lvRect, &lvFmt, &lvBr);

    // Health bar
    float hx = 76.0f, hy = 24.0f, hw = 260.0f, hh = 18.0f;
    SolidBrush hpBg(Color(180, 30, 10, 20));
    g.FillRectangle(&hpBg, hx, hy, hw, hh);
    float frac = clampf(G.player.hp / G.player.hpMax, 0, 1);
    LinearGradientBrush hpFg(PointF(hx, hy), PointF(hx, hy + hh),
                             Color(255, 255, 80, 120),
                             Color(255, 200, 40, 80));
    g.FillRectangle(&hpFg, hx, hy, hw * frac, hh);
    Pen hpBorder(Color(255, 255, 255, 255), 1.5f);
    g.DrawRectangle(&hpBorder, hx, hy, hw, hh);
    std::wstring hpTxt = L"HP " + std::to_wstring((int)G.player.hp) + L" / " +
                         std::to_wstring((int)G.player.hpMax);
    g.DrawString(hpTxt.c_str(), -1, &font, PointF(hx + 8, hy - 2), &white);

    // Armor bar (between HP and XP)
    float aH = 8.0f;
    float aY = hy + hh + 2.0f;
    SolidBrush aBg(Color(200, 25, 30, 55));
    g.FillRectangle(&aBg, hx, aY, hw, aH);
    float aFrac = clampf(G.player.armor / G.player.armorMax, 0, 1);
    LinearGradientBrush aFg(PointF(hx, aY), PointF(hx, aY + aH),
                            Color(255, 170, 220, 255),
                            Color(255, 110, 170, 220));
    g.FillRectangle(&aFg, hx, aY, hw * aFrac, aH);
    std::wstring aTxt = L"ARMOR " + std::to_wstring((int)G.player.armor);
    Font smallF(L"Segoe UI", 10, FontStyleBold);
    g.DrawString(aTxt.c_str(), -1, &smallF, PointF(hx + 6, aY - 1), &white);

    // XP bar directly below armor
    float xpH = 8.0f;
    float xpY = aY + aH + 2.0f;
    SolidBrush xpBg(Color(200, 20, 20, 50));
    g.FillRectangle(&xpBg, hx, xpY, hw, xpH);
    float xpFrac = clampf(G.player.xp / G.player.xpToNext, 0, 1);
    LinearGradientBrush xpFg(PointF(hx, xpY), PointF(hx, xpY + xpH),
                             Color(255, 180, 230, 255),
                             Color(255, 120, 180, 220));
    g.FillRectangle(&xpFg, hx, xpY, hw * xpFrac, xpH);
    std::wstring xpTxt = L"XP " + std::to_wstring((int)G.player.xp) + L" / " +
                         std::to_wstring((int)G.player.xpToNext) +
                         L"   DMG x" + std::to_wstring((int)(G.player.damageMul() * 100)) + L"%";
    g.DrawString(xpTxt.c_str(), -1, &smallF, PointF(hx + 6, xpY - 1), &white);

    // Lightning cooldown badge (only when wand equipped)
    if (G.player.weapon == WPN_WAND) {
        float lcx = SCREEN_W - 80.0f, lcy = SCREEN_H - 80.0f;
        float ready = 1.0f - clampf(G.player.lightningCd / G.player.lightningMax, 0, 1);
        SolidBrush ring(Color(200, 30, 40, 70));
        g.FillEllipse(&ring, lcx - 30, lcy - 30, 60.0f, 60.0f);
        SolidBrush fill(Color(230, 160, 220, 255));
        if (ready > 0.98f) {
            SolidBrush glow(Color(220, 220, 240, 255));
            g.FillEllipse(&glow, lcx - 30, lcy - 30, 60.0f, 60.0f);
            g.FillEllipse(&fill, lcx - 22, lcy - 22, 44.0f, 44.0f);
            g.DrawString(L"Q", -1, &medFont, PointF(lcx - 7, lcy - 15), &white);
        } else {
            // Partial pie using an arc
            Pen cdPen(Color(220, 160, 220, 255), 6.0f);
            g.DrawArc(&cdPen, lcx - 24.0f, lcy - 24.0f, 48.0f, 48.0f,
                      -90.0f, ready * 360.0f);
            std::wstring s = std::to_wstring((int)std::ceil(G.player.lightningCd)) + L"s";
            g.DrawString(s.c_str(), -1, &font, PointF(lcx - 12, lcy - 12), &white);
        }
        Font tiny(L"Segoe UI", 10, FontStyleBold);
        g.DrawString(L"Lightning", -1, &tiny, PointF(lcx - 32, lcy + 32), &white);
    }

    // Owned perks row (bottom-left)
    if (!G.player.perks.owned.empty()) {
        Font pf(L"Segoe UI", 11, FontStyleBold);
        float px = 24.0f, py = SCREEN_H - 36.0f;
        SolidBrush label(Color(255, 255, 220, 140));
        g.DrawString(L"PERKS", -1, &pf, PointF(px, py), &label);
        px += 50.0f;
        for (int id : G.player.perks.owned) {
            std::wstring n = PERK_NAMES[id];
            RectF m;
            g.MeasureString(n.c_str(), -1, &pf, PointF(0,0), &m);
            float w = m.Width + 10.0f;
            SolidBrush chipBg(Color(220, 60, 20, 80));
            g.FillRectangle(&chipBg, px, py - 2.0f, w, 20.0f);
            Pen chipBorder(Color(255, 220, 160, 255), 1.0f);
            g.DrawRectangle(&chipBorder, px, py - 2.0f, w, 20.0f);
            SolidBrush chipText(Color(255, 255, 240, 220));
            g.DrawString(n.c_str(), -1, &pf, PointF(px + 5.0f, py - 1.0f), &chipText);
            px += w + 6.0f;
            if (px > SCREEN_W - 200.0f) break;
        }
    }

    // Boss HP bar (if any boss alive)
    for (auto& e : G.enemies) {
        if (e.kind == E_BOSS && e.hp > 0) {
            float bw = SCREEN_W * 0.6f;
            float bbx = (SCREEN_W - bw) * 0.5f;
            float bby = 100.0f;
            SolidBrush bbg(Color(200, 30, 10, 20));
            g.FillRectangle(&bbg, bbx, bby, bw, 18.0f);
            float bFrac = clampf(e.hp / e.hpMax, 0, 1);
            LinearGradientBrush bfg(PointF(bbx, bby), PointF(bbx, bby + 18.0f),
                                    Color(255, 255, 90, 160),
                                    Color(255, 160, 40, 80));
            g.FillRectangle(&bfg, bbx, bby, bw * bFrac, 18.0f);
            Pen bborder(Color(255, 255, 230, 120), 1.8f);
            g.DrawRectangle(&bborder, bbx, bby, bw, 18.0f);
            Font bf(L"Impact", 22, FontStyleRegular);
            StringFormat fmt; fmt.SetAlignment(StringAlignmentCenter);
            RectF r(0, bby - 36.0f, (float)SCREEN_W, 32.0f);
            SolidBrush bosstxt(Color(255, 255, 220, 140));
            std::wstring bn = L"WAVE " + std::to_wstring(G.player.wave) + L"  BOSS";
            g.DrawString(bn.c_str(), -1, &bf, r, &fmt, &bosstxt);
            break;
        }
    }

    // Weapon panel
    float wx = 24.0f, wy = 80.0f;
    const Weapon& W = WEAPONS[G.player.weapon];
    SolidBrush wBg(Color(180, 20, 20, 40));
    g.FillRectangle(&wBg, wx, wy, 300.0f, 42.0f);
    bool wandEquipped = (G.player.weapon == WPN_WAND);
    std::wstring wTxt = std::wstring(W.name) + L"   " +
                        (wandEquipped
                           ? std::wstring(L"∞")
                           : std::to_wstring(G.player.ammo[G.player.weapon]) + L" / " +
                             std::to_wstring(W.magSize));
    g.DrawString(wTxt.c_str(), -1, &medFont, PointF(wx + 10, wy + 8), &white);
    if (G.player.reloading) {
        float f = 1.0f - (G.player.reloadT / W.reloadTime);
        SolidBrush rbg(Color(255, 80, 230, 180));
        g.FillRectangle(&rbg, wx, wy + 38.0f, 300.0f * f, 4.0f);
    }

    // Score / wave
    std::wstring sTxt = L"SCORE  " + std::to_wstring(G.player.score);
    std::wstring wvTxt = L"WAVE " + std::to_wstring(G.player.wave) +
                        L"   KILLS " + std::to_wstring(G.player.kills);
    g.DrawString(sTxt.c_str(), -1, &medFont, PointF(SCREEN_W - 230.0f, 24.0f), &white);
    g.DrawString(wvTxt.c_str(), -1, &font, PointF(SCREEN_W - 260.0f, 54.0f), &white);

    // Crosshair
    float mx = G.mouse.x, my = G.mouse.y;
    Pen cross(Color(255, 80, 230, 255), 2.0f);
    g.DrawLine(&cross, mx - 12, my, mx - 4, my);
    g.DrawLine(&cross, mx + 4, my, mx + 12, my);
    g.DrawLine(&cross, mx, my - 12, mx, my - 4);
    g.DrawLine(&cross, mx, my + 4, mx, my + 12);
    SolidBrush dot(Color(255, 255, 255, 255));
    g.FillEllipse(&dot, mx - 1.5f, my - 1.5f, 3.0f, 3.0f);

    // Wave banner
    if (G.waveBannerT > 0) {
        float a = std::min(1.0f, G.waveBannerT / 0.5f);
        SolidBrush bg(Color((BYTE)(160 * a), 10, 10, 20));
        g.FillRectangle(&bg, 0, 260, SCREEN_W, 120);
        SolidBrush fgb(Color((BYTE)(255 * a), 255, 240, 120));
        StringFormat fmt;
        fmt.SetAlignment(StringAlignmentCenter);
        RectF r(0, 275, SCREEN_W, 80);
        g.DrawString(G.waveBannerText.c_str(), -1, &bigFont, r, &fmt, &fgb);
    }

    // Hurt vignette
    if (G.player.hurtFlash > 0) {
        BYTE a = (BYTE)(std::min(1.0f, G.player.hurtFlash / 0.35f) * 140);
        SolidBrush vb(Color(a, 255, 40, 40));
        g.FillRectangle(&vb, 0, 0, SCREEN_W, SCREEN_H);
    }
    // Teleport flash - bright white that fades out
    if (G.teleportFlash > 0) {
        BYTE a = (BYTE)(std::min(1.0f, G.teleportFlash) * 220);
        SolidBrush vb(Color(a, 255, 240, 255));
        g.FillRectangle(&vb, 0, 0, SCREEN_W, SCREEN_H);
    }
    // Level-up gold flash
    if (G.player.levelUpFlash > 0) {
        BYTE a = (BYTE)(std::min(1.0f, G.player.levelUpFlash / 1.2f) * 90);
        SolidBrush vb(Color(a, 255, 220, 120));
        g.FillRectangle(&vb, 0, 0, SCREEN_W, SCREEN_H);
        Font big(L"Impact", 48, FontStyleRegular);
        StringFormat fmt; fmt.SetAlignment(StringAlignmentCenter);
        SolidBrush br(Color((BYTE)(a * 2), 255, 230, 140));
        std::wstring t = L"LEVEL " + std::to_wstring(G.player.level);
        RectF r(0, 170, SCREEN_W, 80);
        g.DrawString(t.c_str(), -1, &big, r, &fmt, &br);
    }
}

static void drawMenu(Graphics& g, Game& G, bool over) {
    SolidBrush dim(Color(170, 5, 5, 20));
    g.FillRectangle(&dim, 0, 0, SCREEN_W, SCREEN_H);
    Font title(L"Impact", 72, FontStyleRegular);
    Font sub(L"Segoe UI", 20, FontStyleBold);
    Font tip(L"Segoe UI", 14, FontStyleRegular);
    StringFormat fmt; fmt.SetAlignment(StringAlignmentCenter);
    SolidBrush pink(Color(255, 255, 110, 230));
    SolidBrush white(Color(255, 255, 255, 255));
    SolidBrush grey(Color(255, 200, 200, 220));

    if (over) {
        RectF r(0, 160, SCREEN_W, 100);
        g.DrawString(L"YOU DIED", -1, &title, r, &fmt, &pink);
        std::wstring s = L"Level  " + std::to_wstring(G.player.level) +
                         L"    Score  " + std::to_wstring(G.player.score) +
                         L"    Wave  " + std::to_wstring(G.player.wave) +
                         L"    Kills  " + std::to_wstring(G.player.kills);
        RectF r2(0, 260, SCREEN_W, 40);
        g.DrawString(s.c_str(), -1, &sub, r2, &fmt, &white);
        RectF r3(0, 340, SCREEN_W, 40);
        g.DrawString(L"Press ENTER to try again", -1, &sub, r3, &fmt, &grey);
    } else {
        RectF r(0, 140, SCREEN_W, 100);
        g.DrawString(L"NEON STRIKE", -1, &title, r, &fmt, &pink);
        RectF r2(0, 240, SCREEN_W, 40);
        g.DrawString(L"A 2D Action Shooter", -1, &sub, r2, &fmt, &white);
        RectF r3(0, 330, SCREEN_W, 30);
        g.DrawString(L"A / D  move      SHIFT  sprint      SPACE  jump (x2)",
                     -1, &tip, r3, &fmt, &grey);
        RectF r4(0, 360, SCREEN_W, 30);
        g.DrawString(L"MOUSE aim      LEFT CLICK fire      R reload     1 2 3 switch weapon",
                     -1, &tip, r4, &fmt, &grey);
        RectF r5(0, 430, SCREEN_W, 40);
        g.DrawString(L"Press ENTER to begin", -1, &sub, r5, &fmt, &pink);
    }
}

static void drawPause(Graphics& g) {
    SolidBrush dim(Color(170, 5, 5, 20));
    g.FillRectangle(&dim, 0, 0, SCREEN_W, SCREEN_H);
    Font title(L"Impact", 60, FontStyleRegular);
    Font sub(L"Segoe UI", 18, FontStyleBold);
    StringFormat fmt; fmt.SetAlignment(StringAlignmentCenter);
    SolidBrush white(Color(255, 255, 255, 255));
    RectF r(0, 240, SCREEN_W, 80);
    g.DrawString(L"PAUSED", -1, &title, r, &fmt, &white);
    RectF r2(0, 330, SCREEN_W, 30);
    g.DrawString(L"Press P or ESC to resume", -1, &sub, r2, &fmt, &white);
}

static void renderFrame(HDC hdcScreen, Renderer& R, Game& G) {
    R.ensure(hdcScreen, SCREEN_W, SCREEN_H);
    Graphics g(R.bufDC);
    g.SetSmoothingMode(SmoothingModeAntiAlias);
    g.SetInterpolationMode(InterpolationModeHighQualityBilinear);
    g.SetPixelOffsetMode(PixelOffsetModeHighQuality);
    g.SetCompositingQuality(CompositingQualityHighQuality);

    float shakeX = 0, shakeY = 0;
    if (G.player.shake > 0) {
        shakeX = frand(-G.player.shake, G.player.shake);
        shakeY = frand(-G.player.shake, G.player.shake);
    }
    float camX = G.camX + shakeX;

    drawBackground(g, G, camX);
    drawPlatforms(g, G, camX);

    // Enemies
    for (auto& e : G.enemies) {
        float sx = e.pos.x - camX;
        if (sx < -120 || sx > SCREEN_W + 120) continue;
        Color accent = Color(255, 40, 20, 40);
        Color skin   = Color(255, 240, 220, 180);
        Vec2 sh = G.enemyShoulder(e);
        float aimA = std::atan2(G.player.pos.y - 32.0f - sh.y,
                                G.player.pos.x - sh.x);
        bool isBoss = (e.kind == E_BOSS);
        float enemyScale = isBoss ? 1.7f : 1.0f;
        drawHumanoid(g, sx, e.pos.y + shakeY, e.facing, e.animT,
                     std::abs(e.vel.x) > 10.0f, false, e.onGround,
                     aimA, e.weaponSprite, e.bodyColor, accent, skin, e.hurtFlash,
                     0.0f, enemyScale, isBoss);
        if (!isBoss) drawEnemyHealth(g, e, camX);
    }

    // Power-surge aura (before drawing player so he sits inside the glow)
    if (G.player.powerBoostT > 0.0f) {
        float sx = G.player.pos.x - camX;
        float sy = G.player.pos.y + shakeY;
        float t = G.player.powerBoostT / G.player.powerBoostMax;
        float pulse = 0.65f + 0.35f * std::sin(G.time * 10.0f);
        BYTE baseA = (BYTE)(std::min(1.0f, t * 1.2f) * 170);
        // Outer breathing ring
        float R = 70.0f + pulse * 10.0f;
        SolidBrush ring(Color((BYTE)(baseA * 0.35f), 255, 230, 140));
        g.FillEllipse(&ring, sx - R, sy - 40 - R, R*2, R*2);
        // Inner bloom
        float R2 = 45.0f + pulse * 6.0f;
        SolidBrush inner(Color((BYTE)(baseA * 0.55f), 255, 210, 100));
        g.FillEllipse(&inner, sx - R2, sy - 40 - R2, R2*2, R2*2);
        // Rotating sparks orbiting the player
        int n = 10;
        for (int i = 0; i < n; ++i) {
            float ang = G.time * 3.5f + i * (2 * PI / n);
            float r = 46.0f + std::sin(G.time * 5.0f + i) * 4.0f;
            float px = sx + std::cos(ang) * r;
            float py = sy - 40 + std::sin(ang) * r * 0.6f;
            SolidBrush s(Color(baseA, 255, 230, 110));
            g.FillEllipse(&s, px - 3, py - 3, 6.0f, 6.0f);
        }
        // Floating runes (upward streaks) emitted procedurally
        for (int i = 0; i < 3; ++i) {
            float phase = G.time * 2.0f + i * 2.1f;
            float ox = std::sin(phase) * 22.0f;
            float oy = -std::fmod(G.time * 35.0f + i * 20.0f, 70.0f);
            SolidBrush s(Color((BYTE)(baseA * 0.8f), 255, 240, 140));
            g.FillRectangle(&s, sx + ox - 1.5f, sy - 40 + oy - 6.0f, 3.0f, 10.0f);
        }
    }

    // Player
    {
        float sx = G.player.pos.x - camX;
        Color body = Color(255, 90, 180, 240);
        Color accent = Color(255, 255, 90, 200);
        Color skin = Color(255, 250, 220, 190);
        float armorAmt = clampf(G.player.armor / G.player.armorMax, 0.0f, 1.0f);
        drawHumanoid(g, sx, G.player.pos.y + shakeY, G.player.facing, G.player.animT,
                     G.player.moving, G.player.sprinting, G.player.onGround,
                     G.player.aimAngle, G.player.weapon, body, accent, skin,
                     G.player.hurtFlash, armorAmt, 1.0f, false);
        // Muzzle flash
        if (G.player.muzzleT > 0) {
            Vec2 muzzle = G.playerMuzzlePos();
            muzzle.x = muzzle.x - camX;
            muzzle.y = muzzle.y + shakeY;
            BYTE a = (BYTE)(std::min(1.0f, G.player.muzzleT / 0.07f) * 220);
            SolidBrush f1(Color(a, 255, 240, 180));
            g.FillEllipse(&f1, muzzle.x - 18, muzzle.y - 18, 36.0f, 36.0f);
            SolidBrush f2(Color((BYTE)(a * 0.9f), 255, 200, 120));
            g.FillEllipse(&f2, muzzle.x - 10, muzzle.y - 10, 20.0f, 20.0f);
        }
    }

    drawBullets(g, G, camX);
    drawPortal(g, G, camX);
    drawPickups(g, G, camX);

    // Laser beam
    if (G.player.laserActive) {
        Vec2 m = G.playerMuzzlePos();
        float sx1 = m.x - camX;
        float sy1 = m.y + shakeY;
        float sx2 = G.player.laserEnd.x - camX;
        float sy2 = G.player.laserEnd.y + shakeY;
        float pulse = 0.85f + 0.15f * std::sin(G.player.laserPhase);
        // Outer bloom
        Pen bloom(Color((BYTE)(90 * pulse), 180, 90, 255), 22.0f);
        bloom.SetStartCap(LineCapRound); bloom.SetEndCap(LineCapRound);
        g.DrawLine(&bloom, sx1, sy1, sx2, sy2);
        // Mid magenta
        Pen midp(Color((BYTE)(170 * pulse), 230, 120, 255), 12.0f);
        midp.SetStartCap(LineCapRound); midp.SetEndCap(LineCapRound);
        g.DrawLine(&midp, sx1, sy1, sx2, sy2);
        // Hot pink
        Pen hotp(Color(255, 255, 180, 255), 6.0f);
        hotp.SetStartCap(LineCapRound); hotp.SetEndCap(LineCapRound);
        g.DrawLine(&hotp, sx1, sy1, sx2, sy2);
        // White-hot core
        Pen core(Color(255, 255, 255, 255), 2.5f);
        core.SetStartCap(LineCapRound); core.SetEndCap(LineCapRound);
        g.DrawLine(&core, sx1, sy1, sx2, sy2);
        // Impact flare
        SolidBrush flareOuter(Color(140, 255, 180, 255));
        g.FillEllipse(&flareOuter, sx2 - 20.0f, sy2 - 20.0f, 40.0f, 40.0f);
        SolidBrush flareInner(Color(230, 255, 255, 255));
        g.FillEllipse(&flareInner, sx2 - 9.0f, sy2 - 9.0f, 18.0f, 18.0f);
        // Muzzle flare
        SolidBrush muzzOuter(Color(180, 255, 150, 255));
        g.FillEllipse(&muzzOuter, sx1 - 14.0f, sy1 - 14.0f, 28.0f, 28.0f);
    }

    drawLightning(g, G, camX);
    drawParticles(g, G, camX);

    // Pop texts
    {
        Font f(L"Segoe UI", 14, FontStyleBold);
        for (auto& p : G.pops) {
            BYTE a = (BYTE)(std::min(1.0f, p.life / p.maxLife) * 255);
            SolidBrush br(Color(a, p.color.GetR(), p.color.GetG(), p.color.GetB()));
            g.DrawString(p.text.c_str(), -1, &f,
                         PointF(p.pos.x - camX - 10, p.pos.y), &br);
        }
    }

    drawHUD(g, G);
    if (G.state == GS_MENU) drawMenu(g, G, false);
    else if (G.state == GS_OVER) drawMenu(g, G, true);
    else if (G.state == GS_PAUSE) drawPause(g);

    BitBlt(hdcScreen, 0, 0, SCREEN_W, SCREEN_H, R.bufDC, 0, 0, SRCCOPY);
}

// ---------- window plumbing ----------
static Game        gGame;
static Renderer    gRender;
static ULONG_PTR   gdiplusToken;

static LRESULT CALLBACK WndProc(HWND hwnd, UINT msg, WPARAM wp, LPARAM lp) {
    switch (msg) {
    case WM_MOUSEMOVE:
        gGame.mouse.x = (float)GET_X_LPARAM(lp);
        gGame.mouse.y = (float)GET_Y_LPARAM(lp);
        return 0;
    case WM_LBUTTONDOWN: gGame.mouseDown = true; return 0;
    case WM_LBUTTONUP:   gGame.mouseDown = false; return 0;
    case WM_KEYDOWN: {
        switch (wp) {
        case 'A': case VK_LEFT:  gGame.keyLeft = true; break;
        case 'D': case VK_RIGHT: gGame.keyRight = true; break;
        case 'W': case VK_SPACE: gGame.keyJump = true; break;
        case VK_SHIFT:           gGame.keySprint = true; break;
        case 'R':
            if (gGame.state == GS_PLAY) gGame.beginReload();
            break;
        case '1': if (gGame.state == GS_PLAY) { gGame.player.weapon = WPN_PISTOL;   gGame.player.reloading = false; } break;
        case '2': if (gGame.state == GS_PLAY) { gGame.player.weapon = WPN_LASER;    gGame.player.reloading = false; } break;
        case '3': if (gGame.state == GS_PLAY) { gGame.player.weapon = WPN_MG;       gGame.player.reloading = false; } break;
        case '4': if (gGame.state == GS_PLAY) { gGame.player.weapon = WPN_CROSSBOW; gGame.player.reloading = false; } break;
        case '5': if (gGame.state == GS_PLAY) { gGame.player.weapon = WPN_WAND;     gGame.player.reloading = false; } break;
        case '6': if (gGame.state == GS_PLAY) { gGame.player.weapon = WPN_FIREBALL; gGame.player.reloading = false; } break;
        case 'Q': if (gGame.state == GS_PLAY) gGame.castLightning(); break;
        case 'P': case VK_ESCAPE:
            if (gGame.state == GS_PLAY) gGame.state = GS_PAUSE;
            else if (gGame.state == GS_PAUSE) gGame.state = GS_PLAY;
            break;
        case VK_RETURN:
            if (gGame.state == GS_MENU || gGame.state == GS_OVER) gGame.start();
            break;
        }
        return 0;
    }
    case WM_KEYUP:
        switch (wp) {
        case 'A': case VK_LEFT:  gGame.keyLeft = false; break;
        case 'D': case VK_RIGHT: gGame.keyRight = false; break;
        case VK_SHIFT:           gGame.keySprint = false; break;
        }
        return 0;
    case WM_ERASEBKGND:
        return 1;
    case WM_CLOSE:
        DestroyWindow(hwnd);
        return 0;
    case WM_DESTROY:
        PostQuitMessage(0);
        return 0;
    }
    return DefWindowProc(hwnd, msg, wp, lp);
}

int WINAPI WinMain(HINSTANCE hInst, HINSTANCE, LPSTR, int nShow) {
    // GDI+ startup
    GdiplusStartupInput gpsi;
    GdiplusStartup(&gdiplusToken, &gpsi, nullptr);

    WNDCLASSW wc{};
    wc.lpfnWndProc = WndProc;
    wc.hInstance = hInst;
    wc.hbrBackground = (HBRUSH)GetStockObject(BLACK_BRUSH);
    wc.hCursor = LoadCursor(nullptr, IDC_ARROW);
    wc.lpszClassName = L"NeonStrikeWnd";
    RegisterClassW(&wc);

    // Fixed-size client area
    RECT r{ 0, 0, SCREEN_W, SCREEN_H };
    DWORD style = WS_OVERLAPPEDWINDOW & ~(WS_MAXIMIZEBOX | WS_THICKFRAME);
    AdjustWindowRect(&r, style, FALSE);
    HWND hwnd = CreateWindowW(L"NeonStrikeWnd", L"NEON STRIKE - 2D Shooter",
                              style, CW_USEDEFAULT, CW_USEDEFAULT,
                              r.right - r.left, r.bottom - r.top,
                              nullptr, nullptr, hInst, nullptr);
    ShowWindow(hwnd, nShow);
    UpdateWindow(hwnd);

    gGame.buildWorld(0);
    gGame.resetPlayer();

    // Fixed-ish timestep main loop
    LARGE_INTEGER freq, prev, now;
    QueryPerformanceFrequency(&freq);
    QueryPerformanceCounter(&prev);

    MSG msg;
    bool running = true;
    while (running) {
        while (PeekMessage(&msg, nullptr, 0, 0, PM_REMOVE)) {
            if (msg.message == WM_QUIT) { running = false; break; }
            TranslateMessage(&msg);
            DispatchMessage(&msg);
        }
        if (!running) break;

        QueryPerformanceCounter(&now);
        float dt = (float)(now.QuadPart - prev.QuadPart) / (float)freq.QuadPart;
        prev = now;
        if (dt > 0.05f) dt = 0.05f;   // clamp when debugger paused
        gGame.update(dt);

        HDC hdc = GetDC(hwnd);
        renderFrame(hdc, gRender, gGame);
        ReleaseDC(hwnd, hdc);

        Sleep(1);
    }

    GdiplusShutdown(gdiplusToken);
    return 0;
}
