from typing import Dict, List, Set, Tuple

from app.models.input_models import Subject, TimetableInput
from app.models.output_models import ConflictReport, TimetableEntry


def detect_conflicts(
    input_data: TimetableInput,
    timetable: List[TimetableEntry]
) -> List[ConflictReport]:
    conflicts: List[ConflictReport] = []

    subjects = {subject.id: subject for subject in input_data.subjects}
    faculties = {faculty.id: faculty for faculty in input_data.faculties}
    rooms = {room.id: room for room in input_data.rooms}
    time_slots = {slot.id: slot for slot in input_data.timeSlots}

    faculty_slot_map: Dict[Tuple[str, str], TimetableEntry] = {}
    room_slot_map: Dict[Tuple[str, str], TimetableEntry] = {}
    group_slot_map: Dict[Tuple[str, str], TimetableEntry] = {}
    duplicate_map: Dict[Tuple[str, str, str, str], TimetableEntry] = {}

    scheduled_hours: Dict[str, int] = {}
    faculty_workload: Dict[str, int] = {}

    subject_student_sets = build_subject_student_sets(input_data)
    student_slot_map: Dict[Tuple[str, str], TimetableEntry] = {}

    for entry in timetable:
        subject = subjects.get(entry.subjectId)
        room = rooms.get(entry.roomId)

        if entry.facultyId not in faculties:
            conflicts.append(
                ConflictReport(
                    type="INVALID_FACULTY",
                    message="Timetable entry contains invalid faculty.",
                    severity="HIGH",
                    affectedEntity=entry.facultyId,
                    suggestedFix="Replace with a valid faculty."
                )
            )

        if entry.roomId not in rooms:
            conflicts.append(
                ConflictReport(
                    type="INVALID_ROOM",
                    message="Timetable entry contains invalid room.",
                    severity="HIGH",
                    affectedEntity=entry.roomId,
                    suggestedFix="Replace with a valid room."
                )
            )

        if entry.timeSlotId not in time_slots:
            conflicts.append(
                ConflictReport(
                    type="INVALID_TIME_SLOT",
                    message="Timetable entry contains invalid time slot.",
                    severity="HIGH",
                    affectedEntity=entry.timeSlotId,
                    suggestedFix="Replace with a valid time slot."
                )
            )

        faculty_key = (entry.facultyId, entry.timeSlotId)
        room_key = (entry.roomId, entry.timeSlotId)
        duplicate_key = (
            entry.subjectId,
            entry.facultyId,
            entry.roomId,
            entry.timeSlotId
        )

        if faculty_key in faculty_slot_map:
            conflicts.append(
                ConflictReport(
                    type="FACULTY_DOUBLE_BOOKING",
                    message="Faculty is assigned to more than one class at the same time.",
                    severity="HIGH",
                    affectedEntity=entry.facultyId,
                    suggestedFix="Move one class to another available time slot."
                )
            )
        else:
            faculty_slot_map[faculty_key] = entry

        if room_key in room_slot_map:
            conflicts.append(
                ConflictReport(
                    type="ROOM_DOUBLE_BOOKING",
                    message="Room is assigned to more than one class at the same time.",
                    severity="HIGH",
                    affectedEntity=entry.roomId,
                    suggestedFix="Assign one class to another available room."
                )
            )
        else:
            room_slot_map[room_key] = entry

        if subject:
            group_key = (subject_group_key(subject), entry.timeSlotId)

            if group_key in group_slot_map:
                conflicts.append(
                    ConflictReport(
                        type="STUDENT_COURSE_OVERLAP",
                        message="Student group has more than one class at the same time.",
                        severity="HIGH",
                        affectedEntity=subject_group_key(subject),
                        suggestedFix="Move one subject to another time slot."
                    )
                )
            else:
                group_slot_map[group_key] = entry

            selected_students = subject_student_sets.get(subject.id, set())

            for student_id in selected_students:
                student_key = (student_id, entry.timeSlotId)

                if student_key in student_slot_map:
                    conflicts.append(
                        ConflictReport(
                            type="NEP_ELECTIVE_OVERLAP",
                            message="A student has two selected multidisciplinary or elective subjects at the same time.",
                            severity="HIGH",
                            affectedEntity=student_id,
                            suggestedFix="Move one selected subject to another time slot."
                        )
                    )
                else:
                    student_slot_map[student_key] = entry

            scheduled_hours[subject.id] = scheduled_hours.get(subject.id, 0) + 1

        if duplicate_key in duplicate_map:
            conflicts.append(
                ConflictReport(
                    type="DUPLICATE_ALLOCATION",
                    message="Duplicate timetable allocation found.",
                    severity="MEDIUM",
                    affectedEntity=entry.subjectId,
                    suggestedFix="Remove duplicate timetable entry."
                )
            )
        else:
            duplicate_map[duplicate_key] = entry

        if subject and room:
            student_count = subject_student_count(
                input_data,
                subject,
                subject_student_sets
            )

            if room.capacity < student_count:
                conflicts.append(
                    ConflictReport(
                        type="ROOM_CAPACITY_MISMATCH",
                        message="Room capacity is smaller than student count.",
                        severity="HIGH",
                        affectedEntity=room.id,
                        suggestedFix="Assign a room with higher capacity."
                    )
                )

            if room.roomType != subject.subjectType:
                conflicts.append(
                    ConflictReport(
                        type="ROOM_TYPE_MISMATCH",
                        message="Theory/lab subject is assigned to wrong room type.",
                        severity="HIGH",
                        affectedEntity=room.id,
                        suggestedFix="Assign theory subjects to classrooms and lab subjects to labs."
                    )
                )

        faculty_workload[entry.facultyId] = faculty_workload.get(entry.facultyId, 0) + 1

    for subject in input_data.subjects:
        required_hours = subject.required_hours()
        actual_hours = scheduled_hours.get(subject.id, 0)

        if actual_hours < required_hours:
            conflicts.append(
                ConflictReport(
                    type="UNSCHEDULED_SUBJECT",
                    message=f"Subject {subject.name} has only {actual_hours}/{required_hours} scheduled hours.",
                    severity="HIGH",
                    affectedEntity=subject.id,
                    suggestedFix="Add more time slots, rooms, or faculty availability."
                )
            )

    for faculty in input_data.faculties:
        workload = faculty_workload.get(faculty.id, 0)

        if workload > faculty.maxWeeklyHours:
            conflicts.append(
                ConflictReport(
                    type="FACULTY_WORKLOAD_OVERLOAD",
                    message=f"Faculty {faculty.id} has {workload} hours, exceeding max {faculty.maxWeeklyHours}.",
                    severity="MEDIUM",
                    affectedEntity=faculty.id,
                    suggestedFix="Redistribute some subjects to other eligible faculty."
                )
            )

    return conflicts


def build_subject_student_sets(input_data: TimetableInput) -> Dict[str, Set[str]]:
    subject_students: Dict[str, Set[str]] = {}

    for selection in input_data.courseSelections:
        if not selection.studentId:
            continue

        for subject_id in selection.selected_subject_ids():
            subject_students.setdefault(subject_id, set()).add(selection.studentId)

    return subject_students


def subject_student_count(
    input_data: TimetableInput,
    subject: Subject,
    subject_student_sets: Dict[str, Set[str]]
) -> int:
    if subject.studentCount and subject.studentCount > 0:
        return subject.studentCount

    selected_students = subject_student_sets.get(subject.id, set())

    if selected_students:
        return len(selected_students)

    count = 0

    for student in input_data.students:
        if (
            student.departmentId == subject.departmentId
            and student.semester == subject.semester
        ):
            count += 1

    return max(count, 1)


def subject_group_key(subject: Subject) -> str:
    if subject.studentGroupId:
        return subject.studentGroupId

    return f"{subject.departmentId}__SEM_{subject.semester}"
