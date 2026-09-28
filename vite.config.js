import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import jobsHandler from "./api/jobs.js";

function careersApi() {
  const configure = (server) => {
    server.middlewares.use("/api/jobs", (request, response, next) => {
      if (request.url.split("?")[0] !== "/") return next();
      response.status = (code) => { response.statusCode = code; return response; };
      response.json = (payload) => {
        response.setHeader("Content-Type", "application/json");
        response.end(JSON.stringify(payload));
      };
      jobsHandler(request, response).catch(next);
    });
  };
  return { name: "careers-api", configureServer: configure, configurePreviewServer: configure };
}

export default defineConfig({
  plugins: [react(), careersApi()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
});

// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'

// // https://vitejs.dev/config/
// export default defineConfig({
//   plugins: [react()],
// })
