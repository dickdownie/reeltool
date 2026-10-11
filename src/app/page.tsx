import { redirect } from "next/navigation";
import { isConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "./actions";
import { AddDirectorForm } from "./add-director-form";

// The library: the signed-in person's company and its directors.

function Shell({ children }: { children: React.ReactNode }) {
  return <main className="mx-auto w-full max-w-2xl px-6 py-12">{children}</main>;
}

function SignOutButton() {
  return (
    <form action={signOut}>
      <button type="submit" className="text-sm underline">
        Sign out
      </button>
    </form>
  );
}

export default async function Home() {
  if (!isConfigured) {
    return (
      <Shell>
        <h1 className="text-3xl font-semibold tracking-tight">Reel Tool</h1>
        <p className="mt-3 leading-7 opacity-80">
          This copy of the app is not connected to a database yet. Set
          NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY where the app
          is hosted, then redeploy.
        </p>
      </Shell>
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: me, error: meError } = await supabase
    .from("members")
    .select("role, companies(name)")
    .eq("id", user.id)
    .maybeSingle();

  if (meError) {
    return (
      <Shell>
        <h1 className="text-3xl font-semibold tracking-tight">Reel Tool</h1>
        <p role="alert" className="mt-3 leading-7 text-red-600">
          The library could not be loaded: {meError.message}
        </p>
        <div className="mt-6">
          <SignOutButton />
        </div>
      </Shell>
    );
  }

  if (!me) {
    return (
      <Shell>
        <h1 className="text-3xl font-semibold tracking-tight">Reel Tool</h1>
        <p className="mt-3 leading-7 opacity-80">
          You are signed in as {user.email}, but this account has not been added to a
          company. Ask your company&apos;s owner to invite this email address.
        </p>
        <div className="mt-6">
          <SignOutButton />
        </div>
      </Shell>
    );
  }

  const company = Array.isArray(me.companies) ? me.companies[0] : me.companies;
  const { data: directors, error: dirError } = await supabase
    .from("directors")
    .select("id, name, spots(count)")
    .order("name");

  return (
    <Shell>
      <header className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">{company?.name ?? "Library"}</h1>
          <p className="mt-1 text-sm opacity-70">
            {user.email} · {me.role === "owner" ? "Owner" : "Rep"}
          </p>
        </div>
        <SignOutButton />
      </header>

      <h2 className="mt-10 text-sm font-semibold uppercase tracking-wider opacity-60">Directors</h2>
      {dirError ? (
        <p role="alert" className="mt-4 text-red-600">
          The directors could not be loaded: {dirError.message}
        </p>
      ) : directors && directors.length > 0 ? (
        <ul className="mt-4 divide-y divide-current/10 border-y border-current/10">
          {directors.map((d) => {
            const n = d.spots?.[0]?.count ?? 0;
            return (
              <li key={d.id} className="flex items-baseline justify-between gap-4 py-3">
                <span>{d.name}</span>
                <span className="text-sm tabular-nums opacity-60">
                  {n} {n === 1 ? "spot" : "spots"}
                </span>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="mt-4 opacity-70">No directors yet. Add the first one below.</p>
      )}
      <AddDirectorForm />
    </Shell>
  );
}
