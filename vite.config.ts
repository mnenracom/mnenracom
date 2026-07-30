import { resolve } from "node:path";
import { defineConfig } from "vite";

export default defineConfig(({ command }) => ({
  root: resolve(__dirname, "showcase"),
  base: command === "build" ? "/mnenracom/" : "/",
  build: {
    outDir: resolve(__dirname, "dist"),
    emptyOutDir: true,
    target: "es2022",
  },
}));
