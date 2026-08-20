import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Rentaly · Madrid capital",
    short_name: "Rentaly",
    description:
      "Transparencia para inquilinas e inquilinos: Catastro, 131 barrios y memoria vecinal. No es un portal de anuncios.",
    start_url: "/",
    display: "standalone",
    background_color: "#f4efe4",
    theme_color: "#8f1d2c",
    lang: "es",
    orientation: "portrait",
    icons: [
      { src: "/icon", sizes: "32x32", type: "image/png" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
  };
}
