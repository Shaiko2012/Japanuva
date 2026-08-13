import type { Metadata, Viewport } from "next";
import { Heebo, Nunito, Quicksand } from "next/font/google";
import { AppShell } from "@/components/layout/AppShell";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { CloudSync } from "@/components/auth/CloudSync";
import { ServiceWorkerRegister } from "@/components/pwa/ServiceWorkerRegister";
import { SmoothScroll } from "@/components/providers/SmoothScroll";
import "./globals.css";

const heebo = Heebo({
  variable: "--font-heebo",
  subsets: ["hebrew", "latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const quicksand = Quicksand({
  variable: "--font-quicksand",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});
export const metadata: Metadata = {
  title: "Japanuva · תכנון טיול משפחתי ליפן",
  description:
    "אפליקציית תכנון אינטראקטיבית לטיול משפחתי ליפן באוקטובר 2027 — מסלול, JR Pass, Suica ולוגיסטיקה.",
  applicationName: "Japanuva",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Japanuva",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "32x32", type: "image/x-icon" },
      { url: "/logo.svg", type: "image/svg+xml" },
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
    shortcut: "/favicon.ico",
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FAF8F2" },
    { media: "(prefers-color-scheme: dark)", color: "#1A1714" },
  ],
  colorScheme: "light dark",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="he"
      dir="rtl"
      className={`${heebo.variable} ${nunito.variable} ${quicksand.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full font-sans">
        <ThemeProvider>
          <AuthProvider>
            <SmoothScroll>
              <AppShell>{children}</AppShell>
              <CloudSync />
              <ServiceWorkerRegister />
            </SmoothScroll>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
