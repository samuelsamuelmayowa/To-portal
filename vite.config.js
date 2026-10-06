import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import process from "node:process";
import path from "path";
import jobsHandler from "./api/jobs.js";
import { createOptionsHandler } from "./api/options-chain.js";

const optionsBuildId = process.env.VERCEL_GIT_COMMIT_SHA
  || process.env.GITHUB_SHA
  || process.env.VITE_OPTIONS_BUILD_ID
  || new Date().toISOString();

function optionsApi() {
  let handler;
  const configure = (server) => {
    server.middlewares.use('/api/options-chain', (request, response, next) => {
      if (request.url.split('?')[0] !== '/') return next();
      response.status = (code) => { response.statusCode = code; return response; };
      response.json = (body) => { response.setHeader('Content-Type', 'application/json'); response.end(JSON.stringify(body)); };
      handler(request, response).catch(next);
    });
  };
  return {
    name: 'alpaca-options-api',
    configResolved(config) { handler = createOptionsHandler({ ...loadEnv(config.mode, config.envDir, 'ALPACA_'), ...process.env }); },
    configureServer: configure, configurePreviewServer: configure,
  };
}

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
  define: {
    "import.meta.env.VITE_OPTIONS_BUILD_ID": JSON.stringify(optionsBuildId),
  },
  plugins: [react(), careersApi(), optionsApi()],
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
