// @ts-check
import { defineConfig, passthroughImageService } from "astro/config";
import node from "@astrojs/node";

const SITE = process.env.PUBLIC_SITE_URL;

// https://astro.build/config
export default defineConfig({
  site: SITE,
  adapter: node({ mode: "standalone" }),
  // Reduce render-blocking requests by inlining CSS into HTML.
  // Astro defaults to 'auto' (inline small files). For Lighthouse
  // improvements on this project, force inlining for all pages.
  build: {
    inlineStylesheets: "always",
  },
  image: {
    service: passthroughImageService(),
  },
});
