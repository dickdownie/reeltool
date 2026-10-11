"use client";

import { useActionState, useState } from "react";
import { signIn, signUp, type LoginState } from "./actions";

const initial: LoginState = {};

export function LoginForm() {
  const [mode, setMode] = useState<"in" | "up">("in");
  const [inState, inAction, inPending] = useActionState(signIn, initial);
  const [upState, upAction, upPending] = useActionState(signUp, initial);
  const state = mode === "in" ? inState : upState;
  const pending = mode === "in" ? inPending : upPending;

  return (
    <form action={mode === "in" ? inAction : upAction} className="mt-8 flex flex-col gap-4">
      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium">Email</span>
        <input
          name="email"
          type="email"
          autoComplete="email"
          required
          defaultValue={state.email ?? ""}
          className="rounded border border-current/30 bg-transparent px-3 py-2 text-base"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium">Password</span>
        <input
          name="password"
          type="password"
          autoComplete={mode === "in" ? "current-password" : "new-password"}
          required
          minLength={mode === "up" ? 8 : undefined}
          className="rounded border border-current/30 bg-transparent px-3 py-2 text-base"
        />
      </label>
      {state.error ? (
        <p role="alert" className="text-sm text-red-600">
          {state.error}
        </p>
      ) : null}
      {state.notice ? (
        <p role="status" className="text-sm">
          {state.notice}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="rounded bg-foreground px-4 py-2 text-base font-medium text-background disabled:opacity-50"
      >
        {pending ? "One moment…" : mode === "in" ? "Sign in" : "Create account"}
      </button>
      <button
        type="button"
        onClick={() => setMode(mode === "in" ? "up" : "in")}
        className="self-start text-sm underline"
      >
        {mode === "in" ? "First time here? Create an account" : "Already have an account? Sign in"}
      </button>
    </form>
  );
}
