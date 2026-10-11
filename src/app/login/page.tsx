import { redirect } from "next/navigation";
import { isConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import { LoginForm } from "./login-form";

export default async function LoginPage() {
  if (!isConfigured) redirect("/");
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) redirect("/");

  return (
    <main className="mx-auto w-full max-w-sm px-6 py-20">
      <h1 className="text-3xl font-semibold tracking-tight">Reel Tool</h1>
      <p className="mt-2 text-sm opacity-70">Sign in to your company&apos;s library.</p>
      <LoginForm />
    </main>
  );
}
