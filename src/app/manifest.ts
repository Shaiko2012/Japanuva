import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Japanuva · טיול ליפן",
    short_name: "Japanuva",
    description:
      "אפליקציית תכנון אינטראקטיבית לטיול משפחתי ליפן — מסלול, JR Pass, Suica ולוגיסטיקה.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait-primary",
    lang: "he",
    dir: "rtl",
    background_color: "#FEF6E3",
    theme_color: "#FEF6E3",
    categories: ["travel", "lifestyle"],
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512-maskable.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
