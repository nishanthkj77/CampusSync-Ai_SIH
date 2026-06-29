import Card from "../components/ui/Card";
import EmptyState from "../components/ui/EmptyState";

interface RequiredModulePageProps {
  title: string;
  description: string;
}

export default function RequiredModulePage({
  title,
  description,
}: RequiredModulePageProps) {
  return (
    <div>
      <div className="mb-7">
        <p className="text-sm font-bold uppercase tracking-wide text-orange-600">
          CampusSync AI module
        </p>
        <h1 className="mt-2 text-3xl font-black text-slate-950">{title}</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
          {description}
        </p>
      </div>

      <Card>
        <EmptyState
          title={`${title} route ready`}
          description="This required module will be implemented with backend API integration in its dedicated development step."
        />
      </Card>
    </div>
  );
}