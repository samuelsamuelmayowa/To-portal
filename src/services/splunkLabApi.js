import axios from "axios";
import { getAuth } from "firebase/auth";
import { app } from "../../firebase.config";
import { getCsrfToken } from "../lib/cookieAuth";

const configuredApiUrl = import.meta.env.VITE_API_URL;
const API_URL = (import.meta.env.DEV
  ? "http://localhost:8000"
  : (configuredApiUrl || "")).replace(/\/+$/, "");

const client = axios.create({
  baseURL: `${API_URL}/api/splunk-lab`,
  timeout: 30000,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

client.interceptors.request.use(async (config) => {
  const currentUser = getAuth(app).currentUser;
  if (currentUser) {
    config.headers.Authorization = `Bearer ${await currentUser.getIdToken()}`;
  }
  const csrfToken = getCsrfToken();
  if (csrfToken && !["GET", "HEAD", "OPTIONS"].includes(String(config.method || "get").toUpperCase())) {
    config.headers["X-CSRF-Token"] = csrfToken;
  }
  return config;
});

const guestKey = "toSplunkLabGuestId";

export const getGuestId = () => {
  return localStorage.getItem(guestKey);
};

const rememberGuest = (guestId) => {
  if (guestId) {
    localStorage.setItem(guestKey, guestId);
  }
};

export const splunkLabApi = {
  async listCatalog() {
    const response = await client.get("/catalog");
    return response.data.data || [];
  },

  async search(query, options = {}) {
    const response = await client.post("/search", {
      query,
      timeRange: options.timeRange || "all",
      page: options.page || 1,
      pageSize: options.pageSize || 100,
    });
    return response.data.data;
  },

  async getStudentWork() {
    const response = await client.get("/student/work");
    return response.data.data;
  },

  async migrateLocalWork(work) {
    const response = await client.post("/student/work/migrate", work);
    return response.data.data;
  },

  async listHistory() {
    const response = await client.get("/student/work/history");
    return response.data.data || [];
  },

  async recordLocalHistory(data) {
    const response = await client.post("/student/work/history", { ...data, source: "local" });
    return response.data.data;
  },

  async clearHistory() {
    const response = await client.delete("/student/work/history");
    return response.data.data;
  },

  async createSavedSearch(data) { return (await client.post("/student/work/searches", data)).data.data; },
  async updateSavedSearch(id, data) { return (await client.patch(`/student/work/searches/${id}`, data)).data.data; },
  async deleteSavedSearch(id) { return (await client.delete(`/student/work/searches/${id}`)).data.data; },

  async createDashboard(data) { return (await client.post("/student/work/dashboards", data)).data.data; },
  async updateDashboard(id, data) { return (await client.patch(`/student/work/dashboards/${id}`, data)).data.data; },
  async deleteDashboard(id) { return (await client.delete(`/student/work/dashboards/${id}`)).data.data; },
  async refreshDashboard(id, options = {}) { return (await client.post(`/student/work/dashboards/${id}/refresh`, { timeRange: options.timeRange || "all" })).data.data; },

  async createAlert(data) { return (await client.post("/student/work/alerts", data)).data.data; },
  async updateAlert(id, data) { return (await client.patch(`/student/work/alerts/${id}`, data)).data.data; },
  async deleteAlert(id) { return (await client.delete(`/student/work/alerts/${id}`)).data.data; },
  async runAlert(id, options = {}) { return (await client.post(`/student/work/alerts/${id}/run`, { timeRange: options.timeRange || "all" })).data.data; },

  async listMissions() { return (await client.get("/student/work/missions")).data.data || []; },
  async submitMission(id, data) { return (await client.post(`/student/work/missions/${id}/submit`, data)).data.data; },

  async listCases() {
    const response = await client.get("/cases");
    return response.data.data;
  },

  async getCase(slug) {
    const response = await client.get(`/cases/${slug}`);
    return response.data.data;
  },

  async start(slug) {
    const response = await client.post(`/cases/${slug}/start`, {
      guestId: getGuestId(),
    });

    rememberGuest(response.data.data.guestId);
    return response.data.data;
  },

  async run(attemptId, missionKey, query) {
    const response = await client.post(
      `/attempts/${attemptId}/run`,
      {
        guestId: getGuestId(),
        missionKey,
        query,
      }
    );

    return response.data.data;
  },

  async hint(attemptId, missionKey) {
    const response = await client.post(
      `/attempts/${attemptId}/hint`,
      {
        guestId: getGuestId(),
        missionKey,
      }
    );

    return response.data.data;
  },

  async submit(attemptId) {
    const response = await client.post(
      `/attempts/${attemptId}/submit`,
      {
        guestId: getGuestId(),
      }
    );

    return response.data.data;
  },
};
// import axios from "axios";

// const client = axios.create({
//   baseURL: `${import.meta.env.VITE_API_URL}/api/splunk-lab`,
//   timeout: 15000,
// });

// const guestKey = "toSplunkLabGuestId";
// export const getGuestId = () => localStorage.getItem(guestKey);
// const rememberGuest = (guestId) => localStorage.setItem(guestKey, guestId);

// export const splunkLabApi = {
//   async listCases() {
//     const response = await client.get("/cases");
//     return response.data.data;
//   },
//   async getCase(slug) {
//     const response = await client.get(`/cases/${slug}`);
//     return response.data.data;
//   },
//   async start(slug) {
//     const response = await client.post(`/cases/${slug}/start`, { guestId: getGuestId() });
//     rememberGuest(response.data.data.guestId);
//     return response.data.data;
//   },
//   async run(attemptId, missionKey, query) {
//     const response = await client.post(`/attempts/${attemptId}/run`, { guestId: getGuestId(), missionKey, query });
//     return response.data.data;
//   },
//   async hint(attemptId, missionKey) {
//     const response = await client.post(`/attempts/${attemptId}/hint`, { guestId: getGuestId(), missionKey });
//     return response.data.data;
//   },
//   async submit(attemptId) {
//     const response = await client.post(`/attempts/${attemptId}/submit`, { guestId: getGuestId() });
//     return response.data.data;
//   },
// };
