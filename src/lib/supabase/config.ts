// Where the Supabase project lives. Both values are safe to expose to the browser:
// the key only lets someone try to sign in, and the database's row level security
// decides what a signed-in person can see.

export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  "";

export const isConfigured = supabaseUrl !== "" && supabaseKey !== "";
