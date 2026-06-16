import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Aula — El sistema operativo de tu escuela",
    short_name: "Aula",
    description:
      "Asistencia, bitácora y plan SEP en un solo lugar para maestros, directores y padres.",
    start_url: "/",
    display: "standalone",
    background_color: "#f4f5fa",
    theme_color: "#4254e0",
    lang: "es-MX",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      {
        src: "/icons/icon-512-maskable.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
