# Android APK (Capacitor WebView)

Japanuva’s website stays on Vercel. The Android app is a native WebView shell that loads:

`https://japanuva.vercel.app`

No Chrome Custom Tabs, no address bar, no browser UI.

## Prerequisites

- JDK 17+
- [Android Studio](https://developer.android.com/studio) (SDK + platform tools)
- This repo’s Node dependencies (`npm install`)

## Build

```bash
npm run cap:sync
npm run cap:open
```

In Android Studio: **Build → Build Bundle(s) / APK(s) → Build APK(s)**.

Release APK/AAB should be signed with your own keystore. Do not commit `*.apk`, `*.aab`, or `*.keystore`.

## Branding assets

Launcher and splash images are generated from the mint + torii mark:

```bash
node scripts/generate-android-branding.mjs
```

Replace later if you want a different icon: `android/app/src/main/res/mipmap-*/ic_launcher.png` and `ic_launcher_foreground.png`.
