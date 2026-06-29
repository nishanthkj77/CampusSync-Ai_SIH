import { API_ENDPOINTS } from "../../../config/endpoints";
import ResourcePage from "../../common/ResourcePage";

export default function FacultiesPage() {
  return (
    <ResourcePage
      title="Faculty Management"
      description="Manage faculty records for workload balancing and timetable allocation."
      endpoints={API_ENDPOINTS.faculties}
      columns={[
        { key: "name", label: "Name" },
        { key: "email", label: "Email" },
        { key: "designation", label: "Designation" },
        { key: "department", label: "Department" },
        { key: "departmentId", label: "Department ID" },
      ]}
      fields={[
        { name: "name", label: "Faculty Name", required: true },
        { name: "email", label: "Email", type: "email", required: true },
        { name: "designation", label: "Designation" },
        { name: "departmentId", label: "Department ID" },
      ]}
    />
  );
}