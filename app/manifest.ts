import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Semper",
    short_name: "Semper",
    description: "D&D 5e character sheets, forged for play.",
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#0c0a09",
    theme_color: "#0c0a09",
    orientation: "portrait-primary",
    categories: ["games", "utilities"],
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  };
}
