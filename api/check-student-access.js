import { createClient } from "@supabase/supabase-js";

const VALID_COURSE_IDS = new Set(["splunk", "stock-options"]);

function jsonResponse(body, status = 200) {
  return Response.json(body, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

function normalize(value) {
  return String(value || "").trim().toLowerCase();
}

export default {
  async fetch(request) {
    if (request.method !== "POST") {
      return jsonResponse({ allowed: false, error: "Method not allowed" }, 405);
    }

    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;

    if (!supabaseUrl || !supabaseSecretKey) {
      console.error("Supabase server environment variables are missing.");
      return jsonResponse({ allowed: false, error: "Server configuration error" }, 500);
    }

    try {
      const body = await request.json();
      const email = normalize(body?.email);
      const courseId = normalize(body?.courseId);

      if (!email || !email.includes("@")) {
        return jsonResponse({ allowed: false, error: "A valid email is required" }, 400);
      }

      // Do not silently default to Splunk. The requesting portal must identify
      // itself so a Splunk enrollment cannot accidentally authorize Stock.
      if (!VALID_COURSE_IDS.has(courseId)) {
        return jsonResponse({ allowed: false, error: "A valid courseId is required" }, 400);
      }

      const supabase = createClient(supabaseUrl, supabaseSecretKey, {
        auth: { autoRefreshToken: false, persistSession: false },
      });

      const { data, error } = await supabase
        .from("student_access")
        .select("id, status, course_id, expires_at")
        .eq("email", email)
        .eq("course_id", courseId)
        .maybeSingle();

      if (error) {
        console.error("Student access query failed:", error);
        return jsonResponse({ allowed: false, error: "Unable to check student access" }, 500);
      }

      if (!data || data.status !== "active") {
        return jsonResponse({ allowed: false });
      }

      const expiryTime = data.expires_at ? new Date(data.expires_at).getTime() : null;
      const accessHasExpired = Number.isFinite(expiryTime) && expiryTime < Date.now();

      if (accessHasExpired) {
        return jsonResponse({ allowed: false });
      }

      return jsonResponse({
        allowed: true,
        courseId: data.course_id,
        expiresAt: data.expires_at,
      });
    } catch (error) {
      console.error("Access endpoint failed:", error);
      return jsonResponse({ allowed: false, error: "Invalid request" }, 400);
    }
  },
};
