import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // binds 0.0.0.0 (all interfaces, both IPv4 and IPv6)
    port: 5173,
  },
});