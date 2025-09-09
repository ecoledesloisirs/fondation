// @ts-check
import { defineConfig } from "astro/config";
import node from "@astrojs/node";

const NGROK = "54b5e2e69bf0.ngrok-free.app";

// https://astro.build/config
export default defineConfig({
  adapter: node({ mode: "standalone" }),
  // Astro dev server (utile pour ngrok)
  server: {
    host: true, // écoute sur 0.0.0.0
  },
  vite: {
    server: {
      // accepte tous les sous-domaines ngrok (wildcard, pas de https://)
      allowedHosts: ["*.ngrok-free.app"],
      // (optionnel) HMR via ngrok si tu as des soucis de websocket
      hmr: {
        host: NGROK,
        protocol: "wss",
        clientPort: 443,
      },
    },
    preview: {
      allowedHosts: ["*.ngrok-free.app"],
    },
  },
});
