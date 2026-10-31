import { getAuth } from "firebase/auth";
import { app } from "../../firebase.config";
// Requests go through the Render backend. Never ship RESEND_API_KEY to Vite.
const API_URL = (import.meta.env.VITE_BACKEND_API || import.meta.env.VITE_API_URL || "https://to-backendapi-v1-kctb.onrender.com").replace(/\/+$/, "");

export async function sendSimulatedAlertEmail(alert, outcome) {
  const user = getAuth(app).currentUser;
  if (!user || user.providerData.every((provider) => provider.providerId !== "google.com")) {
    throw new Error("Email notifications require a verified Google sign-in.");
  }
  const idToken = await user.getIdToken();
  const res = await fetch(`${API_URL}/api/splunk-alerts/notify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      idToken,
      alertName: alert.name,
      spl: alert.spl,
      operator: alert.operator,
      threshold: alert.threshold,
      metric: alert.metric || "events",
      observed: outcome.observed,
      triggered: outcome.triggered,
    }),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.message || `Unable to send notification (${res.status}).`);
  return body;
}
