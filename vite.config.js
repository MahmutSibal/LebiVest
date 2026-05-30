import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import { resolve } from "node:path";

// Multi-page static site. Custom domain serves from root, so base = "/".
export default defineConfig({
  base: "/",
  plugins: [tailwindcss()],
  build: {
    outDir: "dist",
    rollupOptions: {
      input: {
        home: resolve(__dirname, "index.html"),
        shop: resolve(__dirname, "shop.html"),
        product: resolve(__dirname, "product.html"),
        about: resolve(__dirname, "about.html"),
      },
    },
  },
});
