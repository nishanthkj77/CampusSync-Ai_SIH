 import { API_ENDPOINTS } from "../../../config/endpoints";
import ResourcePage from "../../common/ResourcePage";

export default function ConflictReportsPage() {
  return (
    <ResourcePage
      title="Conflict Reports"
      description="Review saved timetable conflicts detected during academic schedule generation."
      endpoints={API_ENDPOINTS.conflictReports}
      canCreate={false}
      canDelete={false}
      columns={[
        { key: "type", label: "Conflict Type" },
        { key: "message", label: "Message" },
        { key: "severity", label: "Severity" },
        { key: "status", label: "Status" },
        { key: "timetableId", label: "Timetable ID" },
        { key: "createdAt", label: "Created At" },
      ]}
    />
  );
}