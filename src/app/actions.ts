"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type FormState = { error?: string };

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function addDirector(_prev: FormState, formData: FormData): Promise<FormState> {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { error: "Enter the director's name." };
  if (name.length > 120) return { error: "That name is too long." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // The database only allows rows for the signed-in person's own company, so the
  // company is looked up here rather than trusted from the form.
  const { data: me } = await supabase.from("members").select("company_id").eq("id", user.id).maybeSingle();
  if (!me) return { error: "Your account is not attached to a company." };

  const { error } = await supabase.from("directors").insert({ company_id: me.company_id, name });
  if (error) return { error: error.message };
  revalidatePath("/");
  return {};
}
