 import { API_ENDPOINTS } from "../../../config/endpoints";
import ResourcePage from "../../common/ResourcePage";

export default function TimetablesPage() {
  return (
    <ResourcePage
      title="Timetables"
      description="View saved timetable records generated for academic departments and batches."
      endpoints={API_ENDPOINTS.timetables}
      canCreate={false}
      canDelete={false}
      columns={[
        { key: "department", label: "Department" },
        { key: "semester", label: "Semester" },
        { key: "batchYear", label: "Batch Year" },
        { key: "academicYear", label: "Academic Year" },
        { key: "day", label: "Day" },
        { key: "timeSlot", label: "Time Slot" },
        { key: "subject", label: "Subject" },
        { key: "faculty", label: "Faculty" },
        { key: "room", label: "Room" },
      ]}
    />
  );
}