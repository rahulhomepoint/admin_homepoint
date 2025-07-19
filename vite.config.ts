import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import flowbiteReact from "flowbite-react/plugin/vite";

// https://vite.dev/config/
export default defineConfig({
  server: {
    origin: "http://localhost:5173",
    allowedHosts: [
      "e601-2409-40e0-11b7-ed8d-70fe-cd21-42c7-54d2.ngrok-free.app",
    ],
  },
  plugins: [react(), tailwindcss(), flowbiteReact()],
});
