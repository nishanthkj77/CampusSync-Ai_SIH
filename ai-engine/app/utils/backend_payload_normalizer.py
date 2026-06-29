def normalize_backend_payload(raw_data):
    return {
        "departments": normalize_departments(force_list(raw_data.get("departments"))),
        "faculties": normalize_faculties(force_list(raw_data.get("faculties"))),
        "students": normalize_students(force_list(raw_data.get("students"))),
        "subjects": normalize_subjects(force_list(raw_data.get("subjects"))),
        "rooms": normalize_rooms(force_list(raw_data.get("rooms"))),
        "timeSlots": normalize_time_slots(force_list(raw_data.get("timeSlots"))),
        "courseSelections": normalize_course_selections(force_list(raw_data.get("courseSelections"))),
    }


def force_list(value):
    if value is None:
        return []

    if isinstance(value, list):
        return value

    if isinstance(value, dict):
        for key in ["data", "items", "records", "results"]:
            nested_value = value.get(key)

            if isinstance(nested_value, list):
                return nested_value

            if isinstance(nested_value, dict):
                return force_list(nested_value)

        return [value]

    return []


def nested_id(item, key):
    value = item.get(key)

    if isinstance(value, dict):
        return value.get("id")

    return value


def normalize_departments(items):
    normalized = []

    for item in items:
        normalized.append({
            "id": str(item.get("id")),
            "name": item.get("name") or item.get("departmentName")
        })

    return normalized


def normalize_faculties(items):
    normalized = []

    for item in items:
        department_id = (
            item.get("departmentId")
            or nested_id(item, "department")
            or "UNKNOWN_DEPARTMENT"
        )

        normalized.append({
            "id": str(item.get("id")),
            "name": item.get("name") or item.get("fullName"),
            "departmentId": str(department_id),
            "maxWeeklyHours": item.get("maxWeeklyHours") or 18,
            "unavailableTimeSlotIds": item.get("unavailableTimeSlotIds") or []
        })

    return normalized


def normalize_students(items):
    normalized = []

    for item in items:
        department_id = (
            item.get("departmentId")
            or nested_id(item, "department")
            or "UNKNOWN_DEPARTMENT"
        )

        normalized.append({
            "id": str(item.get("id")),
            "name": item.get("name") or item.get("fullName"),
            "departmentId": str(department_id),
            "semester": item.get("semester") or 1
        })

    return normalized


def normalize_subjects(items):
    normalized = []

    for item in items:
        faculty_id = item.get("facultyId") or nested_id(item, "faculty")

        eligible_faculty_ids = item.get("eligibleFacultyIds") or []

        if faculty_id and faculty_id not in eligible_faculty_ids:
            eligible_faculty_ids.append(faculty_id)

        department_id = (
            item.get("departmentId")
            or nested_id(item, "department")
            or "UNKNOWN_DEPARTMENT"
        )

        subject_type = (
            item.get("subjectType")
            or item.get("type")
            or item.get("category")
            or "THEORY"
        )

        normalized.append({
            "id": str(item.get("id")),
            "name": item.get("name") or item.get("subjectName") or "Unnamed Subject",
            "code": item.get("code") or item.get("subjectCode"),
            "departmentId": str(department_id),
            "semester": item.get("semester") or item.get("sem") or 1,
            "weeklyHours": item.get("weeklyHours") or item.get("hoursPerWeek") or item.get("credits") or 1,
            "credits": item.get("credits"),
            "subjectType": subject_type,
            "eligibleFacultyIds": eligible_faculty_ids,
            "facultyId": faculty_id,
            "studentGroupId": item.get("studentGroupId"),
            "studentCount": item.get("studentCount")
        })

    return normalized


def normalize_rooms(items):
    normalized = []

    for item in items:
        room_type = (
            item.get("roomType")
            or item.get("type")
            or item.get("category")
            or "THEORY"
        )

        normalized.append({
            "id": str(item.get("id")),
            "name": item.get("name") or item.get("roomNumber"),
            "roomNumber": item.get("roomNumber"),
            "block": item.get("block"),
            "roomType": room_type,
            "capacity": item.get("capacity") or 1
        })

    return normalized


def normalize_time_slots(items):
    normalized = []

    for item in items:
        normalized.append({
            "id": str(item.get("id")),
            "day": item.get("day") or "MONDAY",
            "startTime": item.get("startTime") or item.get("start") or "09:00",
            "endTime": item.get("endTime") or item.get("end") or "10:00",
            "label": item.get("label") or item.get("periodLabel")
        })

    return normalized


def normalize_course_selections(items):
    normalized = []

    for item in items:
        subject_id = (
            item.get("subjectId")
            or nested_id(item, "subject")
        )

        student_id = (
            item.get("studentId")
            or nested_id(item, "student")
        )

        subject_ids = item.get("subjectIds") or []

        if subject_id and subject_id not in subject_ids:
            subject_ids.append(subject_id)

        normalized.append({
            "id": str(item.get("id")),
            "studentId": student_id,
            "studentGroupId": item.get("studentGroupId"),
            "subjectId": subject_id,
            "subjectIds": subject_ids,
            "departmentId": item.get("departmentId"),
            "semester": item.get("semester")
        })

    return normalized
