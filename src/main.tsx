import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

// Configuración para View Transitions API
if ("startViewTransition" in document) {
   // @ts-ignore - Polyfill opcional para navegadores que no soportan View Transitions
   document.startViewTransition = (callback: () => void) => {
      callback();
      return {
         ready: Promise.resolve(),
         updateCallbackDone: Promise.resolve(),
         finished: Promise.resolve()
      };
   };
}

const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);
root.render(
   <React.StrictMode>
      {/* <QueryClientProvider client={queryClient}> */}
      <App />
      {/* {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider> */}
   </React.StrictMode>
);

// Configurar PWA si es necesario
if ("serviceWorker" in navigator && import.meta.env.PROD) {
   window.addEventListener("load", () => {
      navigator.serviceWorker.register("/sw.js").catch((error) => {
         console.error("Service Worker registration failed:", error);
      });
   });
}

// Manejar errores no capturados
window.addEventListener("error", (event) => {
   console.error("Error no capturado:", event.error);
   // Enviar a servicio de monitoreo
});

window.addEventListener("unhandledrejection", (event) => {
   console.error("Promesa rechazada no manejada:", event.reason);
   // Enviar a servicio de monitoreo
});
