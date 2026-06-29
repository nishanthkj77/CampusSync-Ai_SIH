import type { ReactNode } from "react";

interface AuthLayoutProps {
  eyebrow: string;
  title: string;
  subtitle: string;
  children: ReactNode;
}

export default function AuthLayout({
  eyebrow,
  title,
  subtitle,
  children,
}: AuthLayoutProps) {
  return (
    <main className="min-h-screen bg-[#020617] px-4 py-6 text-white">
      <section className="mx-auto grid min-h-[calc(100vh-3rem)] w-full max-w-6xl overflow-hidden rounded-[2rem] border border-white/10 bg-white shadow-2xl lg:grid-cols-[1.05fr_0.95fr]">
        <aside className="relative hidden overflow-hidden bg-[#020617] p-10 lg:block">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.08)_1px,transparent_1px)] bg-[size:44px_44px]" />
          <div className="absolute -right-24 top-20 h-72 w-72 rounded-full bg-orange-500/20 blur-3xl" />
          <div className="absolute bottom-0 left-0 h-80 w-80 rounded-full bg-blue-600/20 blur-3xl" />

          <div className="relative z-10 flex h-full flex-col justify-between">
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-500 font-black text-slate-950">
                  CS
                </div>

                <div>
                  <h1 className="text-xl font-black">
                    Campus<span className="text-orange-400">Sync AI</span>
                  </h1>
                  <p className="text-xs text-slate-400">
                    NEP Timetable Generation System
                  </p>
                </div>
              </div>

              <div className="mt-16 max-w-xl">
                <p className="text-sm font-semibold uppercase tracking-[0.35em] text-blue-300">
                  SIH 2026
                </p>

                <h2 className="mt-5 text-5xl font-black leading-tight">
                  One timetable.
                  <br />
                  Every campus.
                  <br />
                  <span className="text-orange-400">Zero conflicts.</span>
                </h2>

                <p className="mt-6 text-base leading-8 text-slate-300">
                  AI-based timetable generation aligned with NEP 2020 for
                  multidisciplinary education structures.
                </p>
              </div>
            </div>

            <div className="grid gap-3 rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
              <div>
                <p className="text-sm font-semibold text-white">
                  Intelligent scheduling
                </p>
                <p className="mt-1 text-xs leading-5 text-slate-400">
                  Balance faculty, rooms, subjects, time slots, and course
                  selections.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3 border-t border-white/10 pt-4">
                <div>
                  <p className="text-lg font-black text-orange-400">AI</p>
                  <p className="text-xs text-slate-400">Optimization</p>
                </div>
                <div>
                  <p className="text-lg font-black text-blue-300">NEP</p>
                  <p className="text-xs text-slate-400">Aligned</p>
                </div>
                <div>
                  <p className="text-lg font-black text-green-300">RBAC</p>
                  <p className="text-xs text-slate-400">Secured</p>
                </div>
              </div>
            </div>
          </div>
        </aside>

        <section className="flex items-center justify-center bg-slate-50 px-5 py-10 text-slate-950 sm:px-8">
          <div className="w-full max-w-md">
            <p className="text-sm font-bold uppercase tracking-wide text-orange-600">
              {eyebrow}
            </p>

            <h2 className="mt-2 text-3xl font-black text-slate-950">
              {title}
            </h2>

            <p className="mt-3 text-sm leading-6 text-slate-600">
              {subtitle}
            </p>

            {children}
          </div>
        </section>
      </section>
    </main>
  );
}