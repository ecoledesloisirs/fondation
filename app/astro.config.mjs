// @ts-check
import { defineConfig } from "astro/config";
import node from "@astrojs/node";

const NGROK = "e9a7e9d91016.ngrok-free.app";
const SITE = process.env.PUBLIC_SITE_URL;
const DIRECTUS = process.env.PUBLIC_DIRECTUS_URL;

// https://astro.build/config
export default defineConfig({
  site: SITE,
  adapter: node({ mode: "standalone" }),
  // Astro dev server (utile pour ngrok)
  server: {
    host: true, // écoute sur 0.0.0.0
  },
  vite: {
    server: {
      // important: noms d'hôtes EXACTS (sans https:// et sans wildcard)
      allowedHosts: [NGROK, "localhost", "127.0.0.1"],

      // ton proxy Directus (inchangé)
      proxy: {
        "/directus": {
          target: "http://localhost:8055",
          changeOrigin: true,
          secure: false,
          rewrite: (p) => p.replace(/^\/directus/, ""),
        },
      },

      // Optionnel, utile si HMR casse derrière ngrok
      hmr: {
        host: NGROK,
        protocol: "wss",
        clientPort: 443,
      },
    },

    // utile si tu fais `astro preview` via ngrok
    preview: {
      allowedHosts: [NGROK],
    },
  },
});
