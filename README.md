# Konnichimap

אפליקציית תכנון טיול משפחתי ליפן (אוקטובר 2027) עם ממשק RTL בעברית ואסתטיקת Neo-Tokyo.

## הרצה מקומית

```bash
npm install
npm run dev
```

פתחו [http://localhost:3000](http://localhost:3000).

## התחברות Google + שמירה בענן

1. צרו פרויקט ב־[Firebase Console](https://console.firebase.google.com)
2. Authentication → Sign-in method → הפעילו **Google**
3. Firestore Database → צרו DB, והדביקו את הכללים מ־`firestore.rules`
4. Project settings → Web app → העתיקו את הקונפיג
5. העתיקו `.env.example` ל־`.env.local` ומלאו את המפתחות
6. ב־Authentication → Settings → Authorized domains ודאו ש־`localhost` קיים
7. הפעילו מחדש את `npm run dev`

אחרי התחברות עם Google:
- המסלול נטען מהענן
- שינויים בעורך הטיול נשמרים אוטומטית ל־Firestore
- כפתור **שמירה בענן** בעמוד עריכת הטיול

בלי מפתחות Firebase האפליקציה ממשיכה לעבוד עם שמירה מקומית במכשיר.

## סטאק

- Next.js (App Router) + TypeScript
- Tailwind CSS v4
- Framer Motion + Lucide
- Zustand (מצב מקומי)
- Firebase Auth + Firestore (ענן)
- Leaflet + Google tiles (מפת PiP)
- PWA (manifest + service worker) — מוכן ל־Bubblewrap/TWA

## PWA (התקנה בטלפון)

האפליקציה כוללת Web App Manifest ושירות־עובד (`public/sw.js`) ששומר את ה־shell ומבקש רשת תחילה ל־`/api/*`.

### בדיקה מקומית

1. בנו והריצו ב־production mode (Service Worker נרשם רק ב־production):

```bash
npm run build
npm run start
```

2. פתחו Chrome → DevTools → **Application**:
   - Manifest: `Konnichimap · טיול ליפן`, theme `#FEF6E3`
   - Service Workers: `/sw.js` פעיל
3. להתקנה מקומית נוחה יותר: `npx next start` אחרי build, או `npm run dev -- --experimental-https` לבדיקת HTTPS (ה־SW עדיין כבוי ב־dev בכוונה).
4. במובייל / Chrome: Install / «הוסף למסך הבית» אחרי deploy ל־HTTPS.

### APK (Android) אחרי deploy

ראו הוראות מלאות ב־[`docs/apk.md`](docs/apk.md). בקצרה, אחרי ש־`https://YOUR_DOMAIN` חי:

```bash
npm i -g @bubblewrap/cli
bubblewrap init --manifest https://YOUR_DOMAIN/manifest.webmanifest
bubblewrap build
```
