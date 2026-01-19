// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import svelte from "@astrojs/svelte";
import vercel from "@astrojs/vercel/static";

export default defineConfig({
  output: "static",
  adapter: vercel({}),
  vite: {
    plugins: [tailwindcss()],
  },
  integrations: [svelte()],
});
