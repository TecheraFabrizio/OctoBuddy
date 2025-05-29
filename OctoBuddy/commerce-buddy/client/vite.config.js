import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:5000", // Address of your Express server
        changeOrigin: true,
        secure: false, // Set to true if you are using HTTPS for the backend
      },
    },
  },
});
