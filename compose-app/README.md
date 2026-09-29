# Disciply — Compose Wasm + Haze (Liquid Glass)

Prototip de migrare a aplicației Disciply (React + Tauri + Dexie) pe
**Compose Multiplatform / Kotlin-Wasm** cu efecte **Haze 2**
(`chrisbanes/haze`): `haze-blur` + `haze-glass`.

Aplicația React existentă rămâne intactă — acest modul este paralel (`compose-app/`).

## De ce Haze merge pe Wasm

- Haze suportă oficial ținta **Wasm** (Compose for Web pe Kotlin/Wasm via Skiko) —
  documentat ca mediu optim, la fel ca Android 13+ / iOS / Desktop.
- Pe Web intră în joc **fallback-urile Haze**: același `GlassStyle` pe toate
  platformele; unde rendererul complet lipsește se păstrează tint/shape/rim,
  dar se omit refracția, blur-ul și aberația cromatică. De aceea prototipul
  folosește un fundal expresiv (gradient), nu monocrom — pe negru plat efectul
  e (corect) subtil.
- Glass (`haze-glass`) este experimental, disponibil din `2.0.0-alpha04`.
  Toate artefactele Haze trebuie ținute pe **aceeași versiune**.

## Structură

```
compose-app/
├── settings.gradle.kts / build.gradle.kts / gradle.properties
├── gradle/libs.versions.toml      # kotlin / compose / haze — vezi nota de versiuni
└── composeApp/
    ├── build.gradle.kts           # ținta wasmJs (browser, output disciply.js)
    └── src/
        ├── commonMain/kotlin/com/disciply/app/
        │   ├── App.kt             # shell: header blur progresiv + carduri glass + nav
        │   ├── theme/DisciplyGlass.kt  # materiale blur + stiluri Glass (regular/clear/hero/nav)
        │   ├── data/Models.kt     # modele = schema Dexie din src/db.ts (10 tabele)
        │   ├── i18n/Strings.kt    # chei shell RO/EN (port din src/i18n.ts)
        │   └── nav/Routes.kt      # rute = uniunea View din src/App.tsx
        └── wasmJsMain/…/main.kt + resources/index.html
```

## Build (necesită JDK 17 + Gradle — indisponibile în acest mediu)

```bash
cd compose-app
gradle :composeApp:wasmJsBrowserDevelopmentRun   # dev server cu hot reload
gradle :composeApp:wasmJsBrowserDistribution     # build producție (build/dist/wasmJs/productionExecutable)
```

Alinierea versiunilor la prima eroare de rezolvare: vezi
https://github.com/chrisbanes/haze/releases (Kotlin / CMP compatibile).
Sample-ul oficial Wasm: `sample/wasm` în repo-ul Haze.

## Storage (de decis înainte de migrarea datelor)

Dexie/IndexedDB nu se portează direct. Opțiuni documentate pentru Kotlin-Wasm:

1. **Room 3 + SQLite pe OPFS** (WebWorkerSQLiteDriver) — același DAO ca pe Android,
   date reale SQLite în browser. Necesită headere COOP/COEP + worker.js. Recomandat
   pentru cele 10 tabele Disciply.
2. **IndexedDB tipizat** (`kidx`, `eygraber/indexeddb`) — strat Kotlin peste IndexedDB
   existent, fără cost WASM-SQLite, dar API mai apropiat de IndexedDB decât de SQL.
3. **Settings/localStorage** — doar pentru profil + limbă + temă (key-value).

## Plan de migrare (estimare: rescriere completă, ~4100 linii React/TS)

| Fază | Conținut | Sursă |
|------|----------|-------|
| 0 | Shell Haze validat pe Wasm (aici) | App.kt + DisciplyGlass.kt |
| 1 | Storage: Room/OPFS + entități din Models.kt | src/db.ts (6 versiuni) |
| 2 | i18n complet (~300 chei × RO/EN) | src/i18n.ts |
| 3 | Onboarding + quiz (20–100 întrebări) | Onboarding.tsx + questions.ts |
| 4 | Home + module viață (7 module) | Home.tsx + pages/*.tsx |
| 5 | Progress / calendare / detalii / agenda / facial / workout | pages/*.tsx + components/*.tsx |
| 6 | Profil + setări + export | Profile.tsx + lib/export.ts |

## Ce se pierde la migrare

- **Tauri** (desktop nativ + APK Android din CI): Kotlin nu rulează în Tauri.
  Țintele devin Web (Wasm) + Android/iOS/Desktop via CMP. Dacă APK-ul Tauri
  trebuie păstrat, migrarea NU e potrivită — alternativa e design-systemul
  Haze-style în React/CSS (fără dependențe noi).
- `backdrop-filter` CSS existent (`glass.css`) e înlocuit de shaderele Haze/Skia.
