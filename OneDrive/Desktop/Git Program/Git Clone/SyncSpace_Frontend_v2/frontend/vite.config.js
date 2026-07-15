import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
  },
  build: {
    chunkSizeWarningLimit: 3000,
    rollupOptions: {
      output: {
        manualChunks: {
          monaco: ["monaco-editor", "@monaco-editor/react", "y-monaco"],
          konva: ["konva", "react-konva"],
          yjs: ["yjs", "y-protocols/awareness.js"],
        },
      },
    },
  },
});
