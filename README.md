# Disciply

A daily discipline companion that keeps you honest with yourself — habits, objectives, and the small routines that compound: hydration, workouts, nutrition, sleep, facial care and a daily agenda. Built with **Tauri 2** + **React** + **Dexie** (local-first, no accounts, no cloud).

## Features

- Habit & objective tracking with streaks and progress
- Daily trackers: hydration (water), workouts, nutrition, sleep, facial care
- Agenda / clock views for daily structure
- Local-first storage via IndexedDB (Dexie), fully offline
- Multilingual UI (i18n)
- Desktop (Windows, macOS, Linux) and Android

## Development

```bash
npm install
npm run tauri dev
```

## Building the Android APK

The repo ships a GitHub Actions workflow (`.github/workflows/build-android.yml`) that builds the APK on CI — no local Android SDK needed. Trigger it from the **Actions** tab, then download the APK artifact.

## License

AGPL-3.0 — see [LICENSE](LICENSE).