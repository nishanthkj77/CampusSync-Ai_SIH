const stack = [
  "React 19.2",
  "Vite 8.2",
  "NestJS 11.2",
  "Prisma 7.9",
  "PostgreSQL 18.6",
  "Python 3.14",
  "OR-Tools 9.15",
];

export function App() {
  return (
    <main className="min-h-screen bg-slate-950 px-6 py-16 text-slate-100">
      <div className="mx-auto max-w-5xl">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-cyan-300">
          CampusSync AI V2
        </p>
        <h1 className="mt-4 max-w-3xl text-5xl font-semibold tracking-tight">
          Clean academic scheduling architecture, rebuilt from the domain up.
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
          Phase 1 establishes one canonical model for academics, APIs, the UI,
          and the CP-SAT scheduler before feature development begins.
        </p>

        <section className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {stack.map((item) => (
            <div
              key={item}
              className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5"
            >
              <span className="text-sm text-slate-400">Stable baseline</span>
              <div className="mt-2 text-lg font-medium">{item}</div>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}
