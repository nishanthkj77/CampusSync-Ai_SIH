import { API_ENDPOINTS } from "../../../config/endpoints";
import ResourcePage from "../../common/ResourcePage";

export default function DepartmentsPage() {
  return (
    <ResourcePage
      title="Department Management"
      description="Manage academic departments used by the timetable generation system."
      endpoints={API_ENDPOINTS.departments}
      columns={[
        { key: "name", label: "Department Name" },
        { key: "code", label: "Code" },
        { key: "description", label: "Description" },
      ]}
      fields={[
        { name: "name", label: "Department Name", required: true },
        { name: "code", label: "Department Code", required: true },
        { name: "description", label: "Description" },
      ]}
    />
  );
}