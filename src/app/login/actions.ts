"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

// email is handed back so the form can keep it filled in after a failed attempt.
export type LoginState = { error?: string; notice?: string; email?: string };

function read(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  return { email, password };
}

export async function signIn(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const { email, password } = read(formData);
  if (!email || !password) return { error: "Enter your email and password.", email };
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: error.message, email };
  redirect("/");
}

export async function signUp(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const { email, password } = read(formData);
  if (!email || !password) return { error: "Enter your email and choose a password.", email };
  if (password.length < 8) return { error: "Use a password of at least 8 characters.", email };
  const origin = (await headers()).get("origin") ?? "";
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { emailRedirectTo: `${origin}/auth/callback` },
  });
  if (error) return { error: error.message, email };
  // With email confirmation on, there is no session until the link is clicked.
  if (!data.session) return { notice: `Check ${email} for a confirmation link, then come back and sign in.`, email };
  redirect("/");
}
