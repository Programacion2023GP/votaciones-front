import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { version } from "./package.json";

// https://vite.dev/config/
export default defineConfig({
   define: {
      __APP_VERSION__: JSON.stringify(version)
   },
   server: {
      // https: httpsConfig,
      // host: "0.0.0.0", // Acepta conexiones desde cualquier IP en la red local
      port: 5173 // Puerto en el que corre el servidor (puedes cambiarlo si es necesario)
   },
   plugins: [tailwindcss(), react()]
});
