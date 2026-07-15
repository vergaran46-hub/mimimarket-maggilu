import { defineConfig } from "vite";
import { resolve } from "path";

// Configuración de Vite como aplicación multi-página (MPA).
// Cada .html del proyecto es una entrada independiente, tal como
// funcionaba el sitio original, pero ahora con soporte para
// módulos ES, npm y variables de entorno (import.meta.env).
export default defineConfig({
  root: "src",
  envDir: "../",
  publicDir: "../public",
  build: {
    outDir: "../dist",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, "src/index.html"),
        login: resolve(__dirname, "src/login.html"),
        caja: resolve(__dirname, "src/caja.html"),
        deudores: resolve(__dirname, "src/deudores.html"),
        inventario: resolve(__dirname, "src/inventario.html"),
        historial: resolve(__dirname, "src/historial.html"),
      },
    },
  },
});
