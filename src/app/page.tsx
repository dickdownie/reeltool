// Placeholder home page. It lists the stage 1 build steps so anyone opening the
// app can see what exists and what is next. Replace once sign-in is built.

const steps = [
  { n: 1, name: "Accounts and the empty library", done: false },
  { n: 2, name: "Upload one spot and play it back", done: false },
  { n: 3, name: "AI analysis of one spot, shown as an editable record", done: false },
  { n: 4, name: "Bulk upload of a director's folder", done: false },
  { n: 5, name: "Brief in, ranked spots out", done: false },
  { n: 6, name: "Reel builder: reorder, swap, share link", done: false },
  { n: 7, name: "Submission and result log", done: false },
];

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-2xl px-6 py-16">
      <h1 className="text-3xl font-semibold tracking-tight">Reel Tool</h1>
      <p className="mt-3 text-base leading-7 opacity-80">
        Builds the right reel for a brief and learns from what happens after it is sent.
        This is the project skeleton. Nothing below is built yet.
      </p>
      <h2 className="mt-10 text-sm font-semibold uppercase tracking-wider opacity-60">
        Stage 1: Fox Den only
      </h2>
      <ol className="mt-4 divide-y divide-current/10 border-y border-current/10">
        {steps.map((s) => (
          <li key={s.n} className="flex items-baseline gap-4 py-3">
            <span className="w-6 text-sm tabular-nums opacity-60">{s.n}</span>
            <span className="flex-1">{s.name}</span>
            <span className="text-sm opacity-60">{s.done ? "Done" : "Not started"}</span>
          </li>
        ))}
      </ol>
    </main>
  );
}
