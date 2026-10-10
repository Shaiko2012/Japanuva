/**
 * Build a sideloadable debug APK. No Play Store.
 * Uses JDK 17–24 (Capacitor / AGP cannot run on Java 8; Gradle 8.14 cannot run on Java 25+).
 */
import { spawnSync } from "node:child_process";
import { existsSync, readdirSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const android = join(root, "android");
const gradlew = join(android, process.platform === "win32" ? "gradlew.bat" : "gradlew");
const isWin = process.platform === "win32";

if (!existsSync(gradlew)) {
  console.error("Missing android/gradlew. Run npx cap add android first.");
  process.exit(1);
}

function javaBin(home) {
  return join(home, "bin", isWin ? "java.exe" : "java");
}

function javaMajor(home) {
  if (!home || !existsSync(javaBin(home))) return null;
  const result = spawnSync(javaBin(home), ["-version"], { encoding: "utf8" });
  const text = `${result.stdout || ""}${result.stderr || ""}`;
  const match = text.match(/version "(\d+)(?:\.(\d+))?/);
  if (!match) return null;
  const major = Number(match[1] === "1" ? match[2] : match[1]);
  return Number.isFinite(major) ? major : null;
}

function listDirs(parent) {
  if (!parent || !existsSync(parent)) return [];
  try {
    return readdirSync(parent, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => join(parent, entry.name));
  } catch {
    return [];
  }
}

function candidateHomes() {
  const homes = [];
  const add = (home) => {
    if (home && !homes.includes(home)) homes.push(home);
  };

  add(process.env.JAVA_HOME);
  add(join("C:\\Program Files\\Android\\Android Studio", "jbr"));
  add(join(process.env.LOCALAPPDATA || "", "Programs\\Android Studio\\jbr"));
  add("/Applications/Android Studio.app/Contents/jbr/Contents/Home");

  for (const parent of [
    "C:\\Program Files\\Eclipse Adoptium",
    "C:\\Program Files\\Microsoft",
    "C:\\Program Files\\Java",
    "C:\\Program Files\\Amazon Corretto",
    join(homedir(), ".jdks"),
    "/Library/Java/JavaVirtualMachines",
    "/usr/lib/jvm",
  ]) {
    for (const dir of listDirs(parent)) {
      add(dir);
      add(join(dir, "Contents", "Home"));
    }
  }
  return homes;
}

function findJdk() {
  const usable = [];
  for (const home of candidateHomes()) {
    const major = javaMajor(home);
    if (major == null) continue;
    usable.push({ home, major });
  }
  const preferred = usable
    .filter((jdk) => jdk.major >= 17 && jdk.major <= 24)
    .sort((a, b) => {
      const score = (major) => (major === 21 ? 100 : major === 17 ? 80 : major);
      return score(b.major) - score(a.major);
    });
  if (preferred[0]) return preferred[0];
  return { usable };
}

function ensureLocalProperties() {
  const file = join(android, "local.properties");
  if (existsSync(file)) return;
  const sdk =
    process.env.ANDROID_HOME ||
    process.env.ANDROID_SDK_ROOT ||
    (isWin
      ? join(process.env.LOCALAPPDATA || "", "Android", "Sdk")
      : join(homedir(), "Library", "Android", "sdk"));
  if (!existsSync(sdk)) {
    console.error("Android SDK not found. Open Android Studio once, then retry.");
    console.error("Looked for:", sdk);
    process.exit(1);
  }
  const escaped = sdk.replace(/\\/g, "\\\\").replace(/:/g, "\\:");
  writeFileSync(file, `sdk.dir=${escaped}\n`, "utf8");
  console.log("Wrote android/local.properties");
}

const jdk = findJdk();
if (!jdk.home) {
  const found = (jdk.usable || [])
    .map((item) => `  Java ${item.major}: ${item.home}`)
    .join("\n");
  console.error("This Android build needs JDK 17, 21, or 24.");
  console.error("Java 8 is too old. Java 25+ is too new for Gradle 8.14.");
  if (found) {
    console.error("Found:\n" + found);
  }
  console.error("Install Temurin 21, then retry npm run cap:apk:");
  console.error("  winget install EclipseAdoptium.Temurin.21.JDK");
  process.exit(1);
}

ensureLocalProperties();
console.log(`Using JDK ${jdk.major}: ${jdk.home}`);

const env = { ...process.env, JAVA_HOME: jdk.home };
const stop = spawnSync(gradlew, ["--stop"], {
  cwd: android,
  env,
  stdio: "inherit",
  shell: isWin,
});
if (stop.status) {
  // Ignore a missing daemon; assembleDebug will still run.
}

const result = spawnSync(gradlew, ["assembleDebug"], {
  cwd: android,
  env,
  stdio: "inherit",
  shell: isWin,
});

if (result.status !== 0) {
  process.exit(result.status ?? 1);
}

const apk = join(android, "app", "build", "outputs", "apk", "debug", "app-debug.apk");
console.log("\nSideload APK (not Play Store):");
console.log(apk);
