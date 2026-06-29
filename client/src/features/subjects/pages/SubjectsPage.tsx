import { API_ENDPOINTS } from "../../../config/endpoints";
import ResourcePage from "../../common/ResourcePage";

export default function SubjectsPage() {
  return (
    <ResourcePage
      title="Subject Management"
      description="Manage subject records used by course mapping and timetable generation."
      endpoints={API_ENDPOINTS.subjects}
      columns={[
        { key: "name", label: "Subject Name" },
        { key: "code", label: "Code" },
        { key: "credits", label: "Credits" },
        { key: "type", label: "Type" },
        { key: "department", label: "Department" },
      ]}
      fields={[
        { name: "name", label: "Subject Name", required: true },
        { name: "code", label: "Subject Code", required: true },
        { name: "credits", label: "Credits", type: "number" },
        { name: "type", label: "Type" },
        { name: "departmentId", label: "Department ID" },
      ]}
    />
  );
}