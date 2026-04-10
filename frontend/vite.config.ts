import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const apiTarget =
    env.VITE_API_HOST ||
    (command === "serve" ? "http://localhost:8080" : "http://backend:8080");

  return {
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    server: {
      port: 5173,
      host: true,
      strictPort: false,
      hmr: {
        protocol: "ws",
        host: "localhost",
        port: 5173,
      },
      proxy: {
        "/api": {
          target: apiTarget,
          changeOrigin: true,
          ws: true,
        },
      },
      watch: {
        usePolling: true,
      },
    },
    build: {
      outDir: "dist",
      sourcemap: false,
    },
  };
});
