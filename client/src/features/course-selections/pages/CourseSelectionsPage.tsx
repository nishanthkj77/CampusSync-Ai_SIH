import { API_ENDPOINTS } from "../../../config/endpoints";
import ResourcePage from "../../common/ResourcePage";

export default function CourseSelectionsPage() {
  return (
    <ResourcePage
      title="Course Selection"
      description="Manage student course selections required for NEP-based timetable planning."
      endpoints={API_ENDPOINTS.courseSelections}
      columns={[
        { key: "student", label: "Student" },
        { key: "studentId", label: "Student ID" },
        { key: "subject", label: "Subject" },
        { key: "subjectId", label: "Subject ID" },
        { key: "semester", label: "Semester" },
        { key: "status", label: "Status" },
      ]}
      fields={[
        { name: "studentId", label: "Student ID", required: true },
        { name: "subjectId", label: "Subject ID", required: true },
        { name: "semester", label: "Semester", type: "number" },
        { name: "status", label: "Status" },
      ]}
    />
  );
}