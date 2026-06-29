import Card from "../../../components/ui/Card";
import EmptyState from "../../../components/ui/EmptyState";

interface RoleDashboardShellProps {
  title: string;
  description: string;
  scope: string;
}

export default function RoleDashboardShell({
  title,
  description,
  scope,
}: RoleDashboardShellProps) {
  return (
    <div>
      <div className="mb-7">
        <p className="text-sm font-bold uppercase tracking-wide text-orange-600">
          Role dashboard
        </p>
        <h1 className="mt-2 text-3xl font-black text-slate-950">{title}</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
          {description}
        </p>
      </div>

      <Card>
        <EmptyState
          title="Dashboard route ready"
          description={scope}
        />
      </Card>
    </div>
  );
}