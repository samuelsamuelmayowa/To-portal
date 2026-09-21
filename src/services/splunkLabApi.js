import axios from "axios";

const configuredApiUrl = import.meta.env.VITE_API_URL;

const API_URL = (
  configuredApiUrl ||
  "https://to-backendapi-v1-kctb.onrender.com"
).replace(/\/+$/, "");

if (!configuredApiUrl) {
  console.warn(
    "VITE_API_URL is missing. Using the production Render backend."
  );
}

const client = axios.create({
  baseURL: `${API_URL}/api/splunk-lab`,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
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
