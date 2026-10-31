
import { getAuth } from "firebase/auth";

// Your Render backend URL
// Never put your Resend API key in frontend code.
const API_URL = (
  import.meta.env.VITE_BACKEND_API ||
  import.meta.env.VITE_API_URL ||
  "https://to-backendapi-v1-kctb.onrender.com"
).replace(/\/+$/, "");

/**
 * Send a simulated Splunk alert email through the backend.
 * Only authenticated Google users can receive notifications.
 */
export async function sendSimulatedAlertEmail(alert, outcome) {
  const user = getAuth().currentUser;

  if (
    !user ||
    user.providerData.every(
      (provider) => provider.providerId !== "google.com"
    )
  ) {
    throw new Error(
      "Email notifications require a verified Google sign-in."
    );
  }

  // Get Firebase authentication token
  const idToken = await user.getIdToken();

  // Send alert details to the backend
  const response = await fetch(
    `${API_URL}/api/splunk-alerts/notify`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
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
    }
  );

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      data.message ||
      `Unable to send notification (${response.status}).`
    );
  }

  return data;
}
