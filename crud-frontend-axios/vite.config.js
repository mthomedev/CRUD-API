import { defineConfig } from "vite";

export default defineConfig({
  root: "src",
  server: {
    host: "0.0.0.0",
    port: 8080,
  },
  preview: {
    host: "0.0.0.0",
    port: 8080,
  },
  build: {
    outDir: "../dist",
    emptyOutDir: true,
  },
});
