import { API_ENDPOINTS } from "../../../config/endpoints";
import ResourcePage from "../../common/ResourcePage";

export default function RoomsPage() {
  return (
    <ResourcePage
      title="Room Management"
      description="Manage classrooms and labs used for timetable room allocation."
      endpoints={API_ENDPOINTS.rooms}
      columns={[
        { key: "name", label: "Room Name" },
        { key: "roomNumber", label: "Room No" },
        { key: "block", label: "Block" },
        { key: "capacity", label: "Capacity" },
        { key: "type", label: "Type" },
      ]}
      fields={[
        { name: "name", label: "Room Name" },
        { name: "roomNumber", label: "Room Number", required: true },
        { name: "block", label: "Block" },
        { name: "capacity", label: "Capacity", type: "number" },
        { name: "type", label: "Type" },
      ]}
    />
  );
}