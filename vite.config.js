import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Codespaces serves the dev server through an HTTPS proxy on port 443, so the
// browser's Host header never matches localhost and HMR cannot use the raw port.
const inCodespaces = process.env.CODESPACES === "true";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    allowedHosts: true,
    hmr: inCodespaces ? { clientPort: 443, protocol: "wss" } : undefined,
  },
  preview: {
    host: true,
    port: 4173,
    allowedHosts: true,
  },
  test: {
    globals: true,
    environment: 'node',
  },
})
