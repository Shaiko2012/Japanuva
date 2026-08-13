import type { CapacitorConfig } from "@capacitor/cli";

/**
 * Native Android shell for the live Vercel site.
 * Does not replace or rebuild the Next.js web app.
 */
const config: CapacitorConfig = {
  appId: "com.japanuva.app",
  appName: "Japanuva",
  webDir: "www",
  backgroundColor: "#FAF8F2",
  server: {
    url: "https://japanuva.vercel.app",
    cleartext: false,
    androidScheme: "https",
    allowNavigation: [
      "japanuva.vercel.app",
      "*.vercel.app",
      "*.google.com",
      "*.googleapis.com",
      "*.gstatic.com",
      "*.googleusercontent.com",
      "*.firebaseapp.com",
      "*.firebase.com",
      "*.firebasestorage.app",
      "nominatim.openstreetmap.org",
      "*.openstreetmap.org",
    ],
    errorPath: "offline.html",
  },
  android: {
    allowMixedContent: false,
    backgroundColor: "#FAF8F2",
    captureInput: true,
    webContentsDebuggingEnabled: false,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1400,
      launchAutoHide: true,
      backgroundColor: "#FAF8F2",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_INSIDE",
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: false,
    },
    StatusBar: {
      style: "DARK",
      backgroundColor: "#FAF8F2",
      overlaysWebView: true,
    },
  },
};

export default config;
