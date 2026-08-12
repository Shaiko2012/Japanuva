# APK via Bubblewrap (TWA)

Japanuva is a Progressive Web App. After you **deploy** the site (for example on [Vercel](https://vercel.com)), you can wrap the live HTTPS URL as an Android Trusted Web Activity (TWA) and produce an APK/AAB with [Bubblewrap](https://github.com/GoogleChromeLabs/bubblewrap).

There is no production domain in this repo yet — replace `YOUR_DOMAIN` everywhere below (e.g. `japanuva.vercel.app`).

## Prerequisites

1. Deploy the Next.js app so these URLs work over HTTPS:
   - `https://YOUR_DOMAIN/`
   - `https://YOUR_DOMAIN/manifest.webmanifest`
   - `https://YOUR_DOMAIN/sw.js`
2. Install [JDK 17+](https://adoptium.net/) and Android command-line tools (Bubblewrap can prompt to download the SDK).
3. Install Bubblewrap CLI:

```bash
npm i -g @bubblewrap/cli
```

## Init from the web manifest

```bash
bubblewrap init --manifest https://YOUR_DOMAIN/manifest.webmanifest
```

Answer the prompts (package id, app name, signing key, etc.). Suggested values:

| Prompt | Suggestion |
| --- | --- |
| Application name | Japanuva |
| Short name | Japanuva |
| Package ID | `app.vercel.japanuva.twa` (or your own reverse-DNS id) |
| Host | `YOUR_DOMAIN` |
| Theme color | `#FEF6E3` |
| Background color | `#FEF6E3` |
| Start URL | `/` |
| Display mode | `standalone` |

Bubblewrap creates a local Android project that launches your PWA in Chrome Custom Tabs / TWA mode.

This repo already has the generated TWA project under **`android/`** (kept out of the Next.js root so it does not conflict with `src/app`). Run Bubblewrap commands from that folder:

```bash
cd android
bubblewrap build
```

## Build the APK

```bash
cd android
bubblewrap build
```

Outputs typically land under `android/` (APK and/or AAB). Install on a device with:

```bash
adb install path/to/app-release-signed.apk
```

## Digital Asset Links (required for full-screen TWA)

For the TWA to hide the browser URL bar, host this file on the deployed site:

`https://YOUR_DOMAIN/.well-known/assetlinks.json`

Bubblewrap prints the JSON (including your signing cert fingerprint) after init/build. In Next.js you can serve it from:

`public/.well-known/assetlinks.json`

Redeploy after adding it.

## Notes

- Bubblewrap does **not** replace the PWA — it wraps the **deployed** site. Keep shipping web updates; the APK mainly points at your domain.
- Local `npm run dev` is not enough for Bubblewrap; you need a public HTTPS origin.
- API routes stay network-first in the service worker; the TWA still needs connectivity for live data (weather, places, etc.).
