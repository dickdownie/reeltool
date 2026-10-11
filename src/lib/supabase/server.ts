import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { connection } from "next/server";
import { supabaseKey, supabaseUrl } from "./config";

// A Supabase client for server code (pages, server actions, route handlers).
// A new one must be made for every request; never share it between requests.
export async function createClient() {
  // Everything here depends on who is asking, so it must run per request and never
  // while a page is being prepared ahead of time. (The Supabase client also reads
  // the clock when it starts, which is not allowed during that preparation.)
  await connection();
  const cookieStore = await cookies();
  return createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Pages cannot set cookies while rendering. The proxy refreshes the
          // session on every request, so this is safe to ignore here.
        }
      },
    },
  });
}
