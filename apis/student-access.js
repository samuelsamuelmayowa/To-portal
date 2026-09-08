import { createClient } from "@supabase/supabase-js";

const VALID_STATUSES = new Set([
  "active",
  "suspended",
  "revoked",
]);

function jsonResponse(body, status = 200) {
  return Response.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}

function normalizeEmail(value) {
  return String(value || "").trim().toLowerCase();
}

function normalizeCourseId(value) {
  return String(value || "splunk").trim().toLowerCase();
}

function normalizeExpiry(value) {
  if (!value) return null;

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    throw new Error("The expiry date is invalid.");
  }

  return date.toISOString();
}

function getSupabaseAdmin() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;

  if (!supabaseUrl || !supabaseSecretKey) {
    throw new Error(
      "SUPABASE_URL or SUPABASE_SECRET_KEY is missing.",
    );
  }

  return createClient(
    supabaseUrl,
    supabaseSecretKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}

async function listStudents(supabase) {
  const { data, error } = await supabase
    .from("student_access")
    .select(
      `
        id,
        email,
        full_name,
        course_id,
        status,
        expires_at,
        created_at,
        updated_at
      `,
    )
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    console.error("Failed to list student access records:", error);

    return jsonResponse(
      {
        error: "Unable to load student access records.",
      },
      500,
    );
  }

  return jsonResponse({
    students: data || [],
  });
}

async function createStudent(supabase, request) {
  const body = await request.json();

  const email = normalizeEmail(body?.email);
  const fullName = String(body?.full_name || "").trim();
  const courseId = normalizeCourseId(body?.course_id);
  const status = String(body?.status || "active")
    .trim()
    .toLowerCase();

  if (!email || !email.includes("@")) {
    return jsonResponse(
      {
        error: "Enter a valid student email address.",
      },
      400,
    );
  }

  if (!fullName) {
    return jsonResponse(
      {
        error: "Student full name is required.",
      },
      400,
    );
  }

  if (!courseId) {
    return jsonResponse(
      {
        error: "Course ID is required.",
      },
      400,
    );
  }

  if (!VALID_STATUSES.has(status)) {
    return jsonResponse(
      {
        error: "Invalid student access status.",
      },
      400,
    );
  }

  let expiresAt = null;

  try {
    expiresAt = normalizeExpiry(body?.expires_at);
  } catch (error) {
    return jsonResponse(
      {
        error: error.message,
      },
      400,
    );
  }

  const { data, error } = await supabase
    .from("student_access")
    .insert({
      email,
      full_name: fullName,
      course_id: courseId,
      status,
      expires_at: expiresAt,
    })
    .select()
    .single();

  if (error) {
    console.error("Failed to create student access:", error);

    if (error.code === "23505") {
      return jsonResponse(
        {
          error:
            "This student already has access to the selected course.",
        },
        409,
      );
    }

    return jsonResponse(
      {
        error: "Unable to create student access.",
      },
      500,
    );
  }

  return jsonResponse(
    {
      message: "Student access created successfully.",
      student: data,
    },
    201,
  );
}

async function updateStudent(supabase, request) {
  const body = await request.json();
  const id = String(body?.id || "").trim();

  if (!id) {
    return jsonResponse(
      {
        error: "Student access ID is required.",
      },
      400,
    );
  }

  const updates = {
    updated_at: new Date().toISOString(),
  };

  if (Object.hasOwn(body, "full_name")) {
    const fullName = String(body.full_name || "").trim();

    if (!fullName) {
      return jsonResponse(
        {
          error: "Student full name cannot be empty.",
        },
        400,
      );
    }

    updates.full_name = fullName;
  }

  if (Object.hasOwn(body, "email")) {
    const email = normalizeEmail(body.email);

    if (!email || !email.includes("@")) {
      return jsonResponse(
        {
          error: "Enter a valid student email address.",
        },
        400,
      );
    }

    updates.email = email;
  }

  if (Object.hasOwn(body, "course_id")) {
    const courseId = normalizeCourseId(body.course_id);

    if (!courseId) {
      return jsonResponse(
        {
          error: "Course ID cannot be empty.",
        },
        400,
      );
    }

    updates.course_id = courseId;
  }

  if (Object.hasOwn(body, "status")) {
    const status = String(body.status || "")
      .trim()
      .toLowerCase();

    if (!VALID_STATUSES.has(status)) {
      return jsonResponse(
        {
          error: "Invalid student access status.",
        },
        400,
      );
    }

    updates.status = status;
  }

  if (Object.hasOwn(body, "expires_at")) {
    try {
      updates.expires_at = normalizeExpiry(body.expires_at);
    } catch (error) {
      return jsonResponse(
        {
          error: error.message,
        },
        400,
      );
    }
  }

  const { data, error } = await supabase
    .from("student_access")
    .update(updates)
    .eq("id", id)
    .select()
    .maybeSingle();

  if (error) {
    console.error("Failed to update student access:", error);

    if (error.code === "23505") {
      return jsonResponse(
        {
          error:
            "Another access record already exists for this email and course.",
        },
        409,
      );
    }

    return jsonResponse(
      {
        error: "Unable to update student access.",
      },
      500,
    );
  }

  if (!data) {
    return jsonResponse(
      {
        error: "Student access record was not found.",
      },
      404,
    );
  }

  return jsonResponse({
    message: "Student access updated successfully.",
    student: data,
  });
}

async function deleteStudent(supabase, request) {
  const requestUrl = new URL(request.url);
  const id = String(
    requestUrl.searchParams.get("id") || "",
  ).trim();

  if (!id) {
    return jsonResponse(
      {
        error: "Student access ID is required.",
      },
      400,
    );
  }

  const { data, error } = await supabase
    .from("student_access")
    .delete()
    .eq("id", id)
    .select("id")
    .maybeSingle();

  if (error) {
    console.error("Failed to delete student access:", error);

    return jsonResponse(
      {
        error: "Unable to delete student access.",
      },
      500,
    );
  }

  if (!data) {
    return jsonResponse(
      {
        error: "Student access record was not found.",
      },
      404,
    );
  }

  return jsonResponse({
    message: "Student access deleted successfully.",
    id: data.id,
  });
}

export default {
  async fetch(request) {
    try {
      const supabase = getSupabaseAdmin();

      switch (request.method) {
        case "GET":
          return await listStudents(supabase);

        case "POST":
          return await createStudent(supabase, request);

        case "PATCH":
          return await updateStudent(supabase, request);

        case "DELETE":
          return await deleteStudent(supabase, request);

        default:
          return jsonResponse(
            {
              error: `Method ${request.method} is not allowed.`,
            },
            405,
          );
      }
    } catch (error) {
      console.error("Student access endpoint failed:", error);

      return jsonResponse(
        {
          error: "Student access service is unavailable.",
        },
        500,
      );
    }
  },
};