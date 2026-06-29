import { useEffect, useState } from "react";
import Card from "../../../components/ui/Card";
import ErrorMessage from "../../../components/ui/ErrorMessage";
import { API_ENDPOINTS } from "../../../config/endpoints";
import { getApiErrorMessage } from "../../../lib/api";
import { listResource, type EndpointList } from "../../../lib/resourceApi";

interface DashboardMetric {
  label: string;
  endpoints: EndpointList;
}

interface DashboardSummaryProps {
  title: string;
  description: string;
  metrics: DashboardMetric[];
}

export default function DashboardSummary({
  title,
  description,
  metrics,
}: DashboardSummaryProps) {
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  async function loadCounts() {
    try {
      setIsLoading(true);
      setError(null);

      const results = await Promise.allSettled(
        metrics.map(async (metric) => {
          const data = await listResource(metric.endpoints);
          return [metric.label, data.length] as const;
        })
      );

      const nextCounts: Record<string, number> = {};

      results.forEach((result, index) => {
        const label = metrics[index].label;

        if (result.status === "fulfilled") {
          nextCounts[result.value[0]] = result.value[1];
        } else {
          nextCounts[label] = 0;
        }
      });

      setCounts(nextCounts);
    } catch (loadError) {
      setError(getApiErrorMessage(loadError));
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadCounts();
  }, []);

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

      {error && <div className="mb-5"><ErrorMessage message={error} /></div>}

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <Card key={metric.label}>
            <p className="text-sm font-bold text-slate-500">{metric.label}</p>
            <h2 className="mt-3 text-3xl font-black text-slate-950">
              {isLoading ? "..." : counts[metric.label] ?? 0}
            </h2>
            <p className="mt-2 text-xs text-slate-500">
              Loaded from backend API
            </p>
          </Card>
        ))}
      </div>

      <Card className="mt-6 border-orange-200 bg-orange-50">
        <h2 className="text-lg font-black text-slate-950">
          CampusSync AI Scope
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-700">
          This dashboard uses only backend-supported modules: departments,
          faculty, students, subjects, rooms, time slots, course selections,
          timetables, and conflict reports.
        </p>
      </Card>
    </div>
  );
}

export const dashboardMetrics = {
  academicMaster: [
    { label: "Departments", endpoints: API_ENDPOINTS.departments },
    { label: "Faculties", endpoints: API_ENDPOINTS.faculties },
    { label: "Students", endpoints: API_ENDPOINTS.students },
    { label: "Subjects", endpoints: API_ENDPOINTS.subjects },
    { label: "Rooms", endpoints: API_ENDPOINTS.rooms },
    { label: "TimeSlots", endpoints: API_ENDPOINTS.timeslots },
    { label: "Course Selections", endpoints: API_ENDPOINTS.courseSelections },
    { label: "Timetables", endpoints: API_ENDPOINTS.timetables },
  ],
  student: [
    { label: "Course Selections", endpoints: API_ENDPOINTS.courseSelections },
    { label: "Timetables", endpoints: API_ENDPOINTS.timetables },
  ],
  faculty: [
    { label: "Subjects", endpoints: API_ENDPOINTS.subjects },
    { label: "Timetables", endpoints: API_ENDPOINTS.timetables },
  ],
  hod: [
    { label: "Departments", endpoints: API_ENDPOINTS.departments },
    { label: "Faculties", endpoints: API_ENDPOINTS.faculties },
    { label: "Students", endpoints: API_ENDPOINTS.students },
    { label: "Timetables", endpoints: API_ENDPOINTS.timetables },
    { label: "Conflict Reports", endpoints: API_ENDPOINTS.conflictReports },
  ],
};