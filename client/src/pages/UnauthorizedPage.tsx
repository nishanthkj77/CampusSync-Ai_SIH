import { Link } from "react-router";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import { routes } from "../config/routes";

export default function UnauthorizedPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <Card className="max-w-md text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-sm font-black text-red-600">
          403
        </div>

        <h1 className="mt-5 text-2xl font-black text-slate-950">
          Access denied
        </h1>

        <p className="mt-3 text-sm leading-6 text-slate-600">
          Your role does not have permission to access this CampusSync AI page.
        </p>

        <Link to={routes.dashboard}>
          <Button className="mt-6">Go to dashboard</Button>
        </Link>
      </Card>
    </main>
  );
}