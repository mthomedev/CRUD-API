import { defineConfig } from "vite";

export default defineConfig({
  root: "src",
  envDir: "../",
  server: {
    host: "0.0.0.0",
    port: 8080,
    proxy: {
      "/api": "http://api:8000",
    },
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
