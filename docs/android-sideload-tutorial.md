# Japanuva Android app tutorial (no Google Play)

This tutorial shows how to build a **Japanuva** Android app and install it on a phone **without Google Play**.

You will end up with a normal home-screen app named **Japanuva**. It opens in fullscreen. There is no Chrome window, no address bar, and no browser controls. The app loads the live website:

**https://japanuva.vercel.app**

The website on Vercel does not change. You are only wrapping that site in a native Android WebView.

---

## What you are building

| You want | You get |
| --- | --- |
| A store listing | No. Nothing is uploaded to Google Play. |
| An installable app | Yes. A file called `app-debug.apk`. |
| Chrome / a URL bar | No. It is a fullscreen app. |
| The current Japanuva site | Yes. The APK always loads the live Vercel site. |

Install path:

1. Build the APK on your computer.
2. Copy that file to the phone.
3. Open the file on the phone and tap Install.

---

## What you need

### Computer

- Windows, macOS, or Linux
- This Japanuva project (already cloned)
- Node.js and npm
- [Android Studio](https://developer.android.com/studio) installed **once** (this installs the Android SDK)
- JDK 17 or newer (Android Studio can install this for you)

### Phone

- An Android phone
- A USB cable, Google Drive, or any way to send a file to the phone
- Permission to install apps from outside Play Store (Android will ask for this)

### First-time Android Studio setup

1. Install Android Studio from the link above.
2. Open it and finish the setup wizard.
3. When it asks for SDK / platform tools, accept the defaults.
4. You do **not** need a Google Play developer account.
5. You do **not** need to create a Play Store listing.
6. You do **not** need to use **Build Bundle** / `.aab`. That format is for the store.

---

## Step 1 — Install project dependencies

In a terminal, go to the Japanuva project folder and run:

```bash
npm install
```

---

## Step 2 — Build the APK

From the same folder run:

```bash
npm run cap:apk
```

This syncs Capacitor and builds a sideload APK.

When it finishes, the file is here:

```text
android/app/build/outputs/apk/debug/app-debug.apk
```

### Optional: build from Android Studio instead

```bash
npm run cap:sync
npm run cap:open
```

Then in Android Studio:

**Build → Build Bundle(s) / APK(s) → Build APK(s)**

Do **not** choose App Bundle. That is for Google Play.

---

## Step 3 — Copy the APK to the phone

Pick one method:

**USB**

1. Plug the phone into the computer.
2. On the phone, choose **File transfer** / **MTP**.
3. Copy `app-debug.apk` into **Download**.

**Google Drive**

1. Upload `app-debug.apk` to Drive.
2. Open Drive on the phone and download the file.

**WhatsApp / Telegram to yourself**

1. Send `app-debug.apk` to your own chat.
2. Download it on the phone.

---

## Step 4 — Allow installs from this source

Android blocks unknown APKs until you allow the app that opens the file.

1. On the phone, open **Files**, **Downloads**, **Drive**, or **Chrome** — whichever has the APK.
2. Tap `app-debug.apk`.
3. If you see **Blocked** or **For your security**:
   - tap **Settings**
   - turn on **Allow from this source**
   - go back and tap the APK again

The wording varies by phone (Samsung, Pixel, Xiaomi), but the idea is the same: allow that one app to install packages. You are not enabling a global “unknown sources” switch on newer Android.

---

## Step 5 — Install Japanuva

1. Tap **Install**.
2. Wait until it says **App installed**.
3. Tap **Open**, or find **Japanuva** on the home screen / app drawer.

You should see the Japanuva splash (parchment + mint torii), then the live site in fullscreen.

---

## How to confirm it is not a browser

The app is correct if:

- The name under the icon is **Japanuva**
- There is no Chrome icon overlay
- There is no address bar and no `japanuva.vercel.app` URL shown as a browser tab
- The Android back button goes back inside the site, then exits the app

If Chrome opens instead, you installed an old Trusted Web Activity build. Uninstall that app and install this new `app-debug.apk`.

---

## Updating the app later

The APK does **not** contain a frozen copy of the website. After install, opening Japanuva loads whatever is currently live on Vercel.

- Website changes: deploy to Vercel, then reopen the app (pull to refresh if needed).
- Native app changes (icon, splash, package name, WebView settings): build a new APK and install it again. Android will treat it as an update if the application id stays `com.japanuva.app`.

Rebuild:

```bash
npm run cap:apk
```

Then copy the new `app-debug.apk` to the phone and install over the old one.

---

## App identity

| Field | Value |
| --- | --- |
| App name | Japanuva |
| Application ID | `com.japanuva.app` |
| Loads | `https://japanuva.vercel.app` |
| Distribution | Direct APK only. No Google Play. |

---

## Replace the icon later

Default icons are the mint circle + torii mark.

Regenerate them:

```bash
node scripts/generate-android-branding.mjs
```

Or replace these files yourself, then run `npm run cap:apk` again:

- `android/app/src/main/res/mipmap-*/ic_launcher.png`
- `android/app/src/main/res/mipmap-*/ic_launcher_foreground.png`

---

## Troubleshooting

**`This build uses a Java 8 JVM` / `Dependency requires at least JVM runtime version 11`**  
Windows PATH still has Java 8. Do not run `gradlew` in a raw terminal unless JDK 21 is selected.

Always build with:

```bash
npm run cap:apk
```

The wrapper now forces Temurin 21 (`C:\Program Files\Eclipse Adoptium\jdk-21.0.12.8-hotspot`). If that JDK is missing:

```bash
winget install EclipseAdoptium.Temurin.21.JDK
```

Then run `npm run cap:apk` again. Do not set `JAVA_HOME` to Java 8.

**`SDK location not found` / `ANDROID_HOME`**  
Open Android Studio once, or create `android/local.properties` with:

```properties
sdk.dir=C:\\Users\\YOUR_USER\\AppData\\Local\\Android\\Sdk
```

Use your real Windows username. On macOS the path is usually `/Users/YOUR_USER/Library/Android/sdk`.

**`Your project path contains non-ASCII characters`**  
The Windows user folder includes Hebrew letters. The Android build is already set to allow this (`android.overridePathCheck=true`). You do not need to move the project.

**Phone says the app is unsafe**  
Normal for sideload APKs. Allow the install from that source. You are installing your own app, not a store listing.

**Blank screen / no network**  
The app needs internet. If the site cannot load, you should see the Japanuva offline page with a retry button, not an empty WebView.

**Google sign-in fails inside the app**  
Google sometimes blocks sign-in inside a WebView. The website in Chrome is unchanged. If this happens, sign in on the website in a browser, or we can add a native auth path later.

**Old Chrome-style app is still on the phone**  
Uninstall anything named Japanuva that opens Chrome, then install this APK.

Do not commit `*.apk`, `*.aab`, or `*.keystore` to git.
