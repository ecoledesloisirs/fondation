// @ts-check
import { defineConfig } from "astro/config";
import node from "@astrojs/node";

const SITE = process.env.PUBLIC_SITE_URL;

// https://astro.build/config
export default defineConfig({
  site: SITE,
  adapter: node({ mode: "standalone" }),
});
