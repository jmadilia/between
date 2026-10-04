import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // Mirror the Vercel setup locally: /api/* goes to the FastAPI backend.
    proxy: {
      "/api": "http://127.0.0.1:8000",
    },
  },
});
