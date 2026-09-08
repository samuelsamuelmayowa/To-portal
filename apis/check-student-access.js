import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;

function createJsonResponse(body, status = 200) {
  return Response.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}

export default {
  async fetch(request) {
    if (request.method !== "POST") {
      return createJsonResponse(
        {
          error: "Method not allowed",
        },
        405,
      );
    }

    if (!supabaseUrl || !supabaseSecretKey) {
      console.error("Supabase server environment variables are missing.");

      return createJsonResponse(
        {
          error: "Server configuration error",
        },
        500,
      );
    }

    try {
      const body = await request.json();

      const email =
        typeof body?.email === "string"
          ? body.email.toLowerCase().trim()
          : "";

      const courseId =
        typeof body?.courseId === "string" && body.courseId.trim()
          ? body.courseId.toLowerCase().trim()
          : "splunk";

      if (!email) {
        return createJsonResponse(
          {
            allowed: false,
            error: "Email is required",
          },
          400,
        );
      }

      const supabase = createClient(
        supabaseUrl,
        supabaseSecretKey,
        {
          auth: {
            autoRefreshToken: false,
            persistSession: false,
          },
        },
      );

      const { data, error } = await supabase
        .from("student_access")
        .select("id, status, course_id, expires_at")
        .eq("email", email)
        .eq("course_id", courseId)
        .maybeSingle();

      if (error) {
        console.error("Student access query failed:", error);

        return createJsonResponse(
          {
            allowed: false,
            error: "Unable to check student access",
          },
          500,
        );
      }

      if (!data || data.status !== "active") {
        return createJsonResponse({
          allowed: false,
        });
      }

      const accessHasExpired =
        data.expires_at &&
        new Date(data.expires_at).getTime() < Date.now();

      if (accessHasExpired) {
        return createJsonResponse({
          allowed: false,
        });
      }

      return createJsonResponse({
        allowed: true,
        courseId: data.course_id,
        expiresAt: data.expires_at,
      });
    } catch (error) {
      console.error("Access endpoint failed:", error);

      return createJsonResponse(
        {
          allowed: false,
          error: "Invalid request",
        },
        400,
      );
    }
  },
};