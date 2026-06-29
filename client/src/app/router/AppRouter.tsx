import { Navigate, Route, Routes } from "react-router";
import { routes } from "../../config/routes";

function SetupCheckPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <section className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">
          CampusSync AI
        </p>

        <h1 className="mt-3 text-3xl font-bold text-slate-950">
          Frontend setup completed
        </h1>

        <p className="mt-4 text-slate-600">
          React, TypeScript, Vite, Tailwind CSS, React Router, and Axios are
          configured successfully.
        </p>

        <div className="mt-6 rounded-xl bg-slate-100 p-4 text-sm text-slate-700">
          Backend API Base URL:
          <span className="ml-2 font-semibold">
            {import.meta.env.VITE_API_BASE_URL}
          </span>
        </div>
      </section>
    </main>
  );
}

export default function AppRouter() {
  return (
    <Routes>
      <Route path={routes.root} element={<SetupCheckPage />} />
      <Route path="*" element={<Navigate to={routes.root} replace />} />
    </Routes>
  );
}