import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    "Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY."
  );
}

export const supabase = createClient(
  supabaseUrl,
  supabaseKey
);

export async function ensureVisitorSession() {
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError) {
    throw sessionError;
  }

  if (session) {
    return session;
  }

  const { data, error } =
    await supabase.auth.signInAnonymously();

  if (error) {
    throw error;
  }

  if (!data.session) {
    throw new Error(
      "Supabase did not create a visitor session."
    );
  }

  return data.session;
}



// import { createClient } from "@supabase/supabase-js";

// const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
// const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// if (!supabaseUrl || !supabaseKey) {
//   throw new Error(
//     "Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY."
//   );
// }

// export const supabase = createClient(
//   supabaseUrl,
//   supabaseKey
// );

// export async function ensureVisitorSession() {
//   const {
//     data: { session },
//     error: sessionError,
//   } = await supabase.auth.getSession();

//   if (sessionError) {
//     throw sessionError;
//   }

//   if (session) {
//     return session;
//   }

//   const {
//     data,
//     error,
//   } = await supabase.auth.signInAnonymously();

//   if (error) {
//     throw error;
//   }

//   return data.session;
// }