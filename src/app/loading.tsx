// Shown for a moment while a page checks who is signed in and loads their data.
// Every page here depends on the signed-in person, so none can be prepared ahead.
export default function Loading() {
  return (
    <main className="mx-auto w-full max-w-2xl px-6 py-12">
      <p className="opacity-60">Loading…</p>
    </main>
  );
}
