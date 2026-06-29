from typing import List

from app.models.input_models import TimetableInput
from app.models.output_models import ConflictReport


def validate_input_data(data: TimetableInput) -> List[ConflictReport]:
    conflicts = []

    department_ids = {department.id for department in data.departments}
    faculty_ids = {faculty.id for faculty in data.faculties}
    time_slot_ids = {slot.id for slot in data.timeSlots}
    subject_ids = {subject.id for subject in data.subjects}

    if not data.subjects:
        conflicts.append(
            ConflictReport(
                type="NO_SUBJECTS_FOUND",
                message="No subjects found for timetable generation.",
                severity="HIGH",
                affectedEntity="subjects",
                suggestedFix="Add subjects before generating timetable."
            )
        )

    if not data.faculties:
        conflicts.append(
            ConflictReport(
                type="NO_FACULTIES_FOUND",
                message="No faculties found for timetable generation.",
                severity="HIGH",
                affectedEntity="faculties",
                suggestedFix="Add faculty records before generating timetable."
            )
        )

    if not data.rooms:
        conflicts.append(
            ConflictReport(
                type="NO_ROOMS_FOUND",
                message="No rooms found for timetable generation.",
                severity="HIGH",
                affectedEntity="rooms",
                suggestedFix="Add classrooms or labs before generating timetable."
            )
        )

    if not data.timeSlots:
        conflicts.append(
            ConflictReport(
                type="NO_TIMESLOTS_FOUND",
                message="No time slots found for timetable generation.",
                severity="HIGH",
                affectedEntity="timeSlots",
                suggestedFix="Add valid time slots before generating timetable."
            )
        )

    for faculty in data.faculties:
        if department_ids and faculty.departmentId not in department_ids:
            conflicts.append(
                ConflictReport(
                    type="INVALID_FACULTY_DEPARTMENT",
                    message=f"Faculty {faculty.id} belongs to an invalid department.",
                    severity="HIGH",
                    affectedEntity=faculty.id,
                    suggestedFix="Map faculty to a valid department."
                )
            )

        for slot_id in faculty.unavailableTimeSlotIds:
            if slot_id not in time_slot_ids:
                conflicts.append(
                    ConflictReport(
                        type="INVALID_FACULTY_UNAVAILABLE_SLOT",
                        message=f"Faculty {faculty.id} has invalid unavailable slot {slot_id}.",
                        severity="MEDIUM",
                        affectedEntity=faculty.id,
                        suggestedFix="Remove invalid unavailable time slot IDs."
                    )
                )

    for subject in data.subjects:
        if department_ids and subject.departmentId not in department_ids:
            conflicts.append(
                ConflictReport(
                    type="INVALID_SUBJECT_DEPARTMENT",
                    message=f"Subject {subject.id} belongs to an invalid department.",
                    severity="HIGH",
                    affectedEntity=subject.id,
                    suggestedFix="Map subject to a valid department."
                )
            )

        eligible_ids = []

        if subject.facultyId:
            eligible_ids.append(subject.facultyId)

        eligible_ids.extend(subject.eligibleFacultyIds)
        eligible_ids = list(dict.fromkeys(eligible_ids))

        if not eligible_ids:
            conflicts.append(
                ConflictReport(
                    type="SUBJECT_WITHOUT_VALID_FACULTY",
                    message=f"Subject {subject.name} has no eligible faculty.",
                    severity="HIGH",
                    affectedEntity=subject.id,
                    suggestedFix="Assign at least one faculty to this subject."
                )
            )

        for faculty_id in eligible_ids:
            if faculty_id not in faculty_ids:
                conflicts.append(
                    ConflictReport(
                        type="SUBJECT_WITH_INVALID_FACULTY",
                        message=f"Subject {subject.name} contains invalid faculty ID {faculty_id}.",
                        severity="HIGH",
                        affectedEntity=subject.id,
                        suggestedFix="Use only valid faculty IDs from the Faculty module."
                    )
                )

    for selection in data.courseSelections:
        for subject_id in selection.selected_subject_ids():
            if subject_id not in subject_ids:
                conflicts.append(
                    ConflictReport(
                        type="INVALID_COURSE_SELECTION_SUBJECT",
                        message=f"Course selection {selection.id} contains invalid subject {subject_id}.",
                        severity="HIGH",
                        affectedEntity=selection.id,
                        suggestedFix="Use only valid subject IDs in course selections."
                    )
                )

    return conflicts
