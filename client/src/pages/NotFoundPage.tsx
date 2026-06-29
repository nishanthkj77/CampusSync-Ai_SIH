import { Link } from "react-router";
import Button from "../components/ui/Button";
import { routes } from "../config/routes";

export default function NotFoundPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#020617] px-4 text-white">
      <section className="w-full max-w-md text-center">
        <p className="text-sm font-bold uppercase tracking-[0.35em] text-orange-400">
          CampusSync AI
        </p>

        <h1 className="mt-5 text-7xl font-black">404</h1>

        <p className="mt-4 text-sm leading-6 text-slate-300">
          The requested page does not exist in this frontend.
        </p>

        <Link to={routes.dashboard}>
          <Button variant="ai" className="mt-8">
            Back to dashboard
          </Button>
        </Link>
      </section>
    </main>
  );
}