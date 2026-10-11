"use client";

import { useActionState, useEffect, useRef } from "react";
import { addDirector, type FormState } from "./actions";

const initial: FormState = {};

export function AddDirectorForm() {
  const [state, action, pending] = useActionState(addDirector, initial);
  const formRef = useRef<HTMLFormElement>(null);
  const wasPending = useRef(false);

  // Clear the box after a successful add.
  useEffect(() => {
    if (wasPending.current && !pending && !state.error) formRef.current?.reset();
    wasPending.current = pending;
  }, [pending, state]);

  return (
    <form ref={formRef} action={action} className="mt-4 flex flex-col gap-2">
      <div className="flex flex-wrap items-end gap-2">
        <label className="flex min-w-0 flex-1 flex-col gap-1 text-sm">
          <span className="font-medium">Add a director</span>
          <input
            name="name"
            type="text"
            required
            maxLength={120}
            placeholder="Full name"
            className="rounded border border-current/30 bg-transparent px-3 py-2 text-base"
          />
        </label>
        <button
          type="submit"
          disabled={pending}
          className="rounded bg-foreground px-4 py-2 text-base font-medium text-background disabled:opacity-50"
        >
          {pending ? "Adding…" : "Add"}
        </button>
      </div>
      {state.error ? (
        <p role="alert" className="text-sm text-red-600">
          {state.error}
        </p>
      ) : null}
    </form>
  );
}
