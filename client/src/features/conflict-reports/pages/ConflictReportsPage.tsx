import { API_ENDPOINTS } from "../../../config/endpoints";
import ResourcePage from "../../common/ResourcePage";

export default function ConflictReportsPage() {
  return (
    <ResourcePage
      title="Conflict Reports"
      description="Review conflicts detected by the backend timetable generation logic."
      endpoints={API_ENDPOINTS.conflictReports}
      canCreate={false}
      columns={[
        { key: "type", label: "Conflict Type" },
        { key: "message", label: "Message" },
        { key: "severity", label: "Severity" },
        { key: "status", label: "Status" },
        { key: "timetableId", label: "Timetable ID" },
      ]}
    />
  );
}