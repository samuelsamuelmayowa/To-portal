
import { createClient } from "@supabase/supabase-js";

const VALID_COURSE_IDS = new Set([
  "splunk",
  "stock-options",
]);

const VALID_SPLUNK_COHORTS = new Set([
  "legacy",
  "splunk-2026-oct",
]);

function jsonResponse(body, status = 200) {
  return Response.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}

function normalize(value) {
  return String(value || "").trim().toLowerCase();
}

export default {
  async fetch(request) {
    if (request.method !== "POST") {
      return jsonResponse(
        { allowed: false, error: "Method not allowed" },
        405
      );
    }

    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;

    if (!supabaseUrl || !supabaseSecretKey) {
      console.error("Supabase configuration missing");

      return jsonResponse(
        { allowed: false, error: "Server configuration error" },
        500
      );
    }

    try {
      const body = await request.json();

      const email = normalize(body?.email);
      const courseId = normalize(body?.courseId);

      if (!email || !email.includes("@")) {
        return jsonResponse(
          { allowed: false, error: "Valid email required" },
          400
        );
      }

      if (!VALID_COURSE_IDS.has(courseId)) {
        return jsonResponse(
          { allowed: false, error: "Invalid course ID" },
          400
        );
      }

      // IMPORTANT:
      // The signed-in user's identity must be verified
      // before trusting this email. See security note below.

      const supabase = createClient(
        supabaseUrl,
        supabaseSecretKey,
        {
          auth: {
            autoRefreshToken: false,
            persistSession: false,
          },
        }
      );

      const { data, error } = await supabase
        .from("student_access")
        .select(
          "id, status, course_id, expires_at, cohort_id"
        )
        .eq("email", email)
        .eq("course_id", courseId)
        .maybeSingle();

      if (error) {
        console.error("Student access query failed:", error);

        return jsonResponse(
          { allowed: false, error: "Access check failed" },
          500
        );
      }

      if (!data || data.status !== "active") {
        return jsonResponse({ allowed: false });
      }

      if (data.expires_at) {
        const expiryTime = Date.parse(data.expires_at);

        if (
          !Number.isFinite(expiryTime) ||
          expiryTime <= Date.now()
        ) {
          return jsonResponse({ allowed: false });
        }
      }

      let cohortId = null;

      if (courseId === "splunk") {
        cohortId = normalize(data.cohort_id);

        // Never grant Splunk access for an unknown cohort.
        if (!VALID_SPLUNK_COHORTS.has(cohortId)) {
          return jsonResponse({
            allowed: false,
            error: "Student cohort not assigned",
          }, 403);
        }
      }

      return jsonResponse({
        allowed: true,
        courseId: data.course_id,
        cohortId,
        expiresAt: data.expires_at,
      });

    } catch (error) {
      console.error("Access endpoint failed:", error);

      return jsonResponse(
        { allowed: false, error: "Invalid request" },
        400
      );
    }
  },
};


// import { createClient } from "@supabase/supabase-js";

// const VALID_COURSE_IDS = new Set(["splunk", "stock-options"]);

// function jsonResponse(body, status = 200) {
//   return Response.json(body, {
//     status,
//     headers: { "Cache-Control": "no-store" },
//   });
// }

// function normalize(value) {
//   return String(value || "").trim().toLowerCase();
// }

// export default {
//   async fetch(request) {
//     if (request.method !== "POST") {
//       return jsonResponse({ allowed: false, error: "Method not allowed" }, 405);
//     }

//     const supabaseUrl = process.env.SUPABASE_URL;
//     const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;

//     if (!supabaseUrl || !supabaseSecretKey) {
//       console.error("Supabase server environment variables are missing.");
//       return jsonResponse({ allowed: false, error: "Server configuration error" }, 500);
//     }

//     try {
//       const body = await request.json();
//       const email = normalize(body?.email);
//       const courseId = normalize(body?.courseId);

//       if (!email || !email.includes("@")) {
//         return jsonResponse({ allowed: false, error: "A valid email is required" }, 400);
//       }

//       // Do not silently default to Splunk. The requesting portal must identify
//       // itself so a Splunk enrollment cannot accidentally authorize Stock.
//       if (!VALID_COURSE_IDS.has(courseId)) {
//         return jsonResponse({ allowed: false, error: "A valid courseId is required" }, 400);
//       }

//       const supabase = createClient(supabaseUrl, supabaseSecretKey, {
//         auth: { autoRefreshToken: false, persistSession: false },
//       });

//       const { data, error } = await supabase
//         .from("student_access")
//         .select("id, status, course_id, expires_at")
//         .eq("email", email)
//         .eq("course_id", courseId)
//         .maybeSingle();

//       if (error) {
//         console.error("Student access query failed:", error);
//         return jsonResponse({ allowed: false, error: "Unable to check student access" }, 500);
//       }

//       if (!data || data.status !== "active") {
//         return jsonResponse({ allowed: false });
//       }

//       const expiryTime = data.expires_at ? new Date(data.expires_at).getTime() : null;
//       const accessHasExpired = Number.isFinite(expiryTime) && expiryTime < Date.now();

//       if (accessHasExpired) {
//         return jsonResponse({ allowed: false });
//       }

//       return jsonResponse({
//         allowed: true,
//         courseId: data.course_id,
//         expiresAt: data.expires_at,
//       });
//     } catch (error) {
//       console.error("Access endpoint failed:", error);
//       return jsonResponse({ allowed: false, error: "Invalid request" }, 400);
//     }
//   },
// };
