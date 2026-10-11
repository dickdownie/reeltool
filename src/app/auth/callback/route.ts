import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

// The link in the confirmation email lands here. It trades the one-time code in
// the link for a signed-in session, then sends the person to the library.
export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const home = new URL("/", request.url);
  const login = new URL("/login", request.url);
  if (!code) return NextResponse.redirect(login);
  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  return NextResponse.redirect(error ? login : home);
}
