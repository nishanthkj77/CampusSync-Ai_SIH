from typing import Dict, List, Set, Tuple

from ortools.sat.python import cp_model

from app.config import (
    DAY_ORDER,
    FACULTY_BACK_TO_BACK_PENALTY,
    ROOM_CAPACITY_GAP_PENALTY,
    SAME_SUBJECT_SAME_DAY_PENALTY,
    UNSCHEDULED_SESSION_PENALTY,
)
from app.models.input_models import Faculty, Room, Subject, TimeSlot, TimetableInput
from app.models.output_models import ConflictReport, TimetableEntry, TimetableOutput
from app.services.conflict_detector import (
    build_subject_student_sets,
    detect_conflicts,
    subject_group_key,
    subject_student_count,
)
from app.services.optimizer import build_optimization_summary
from app.utils.validators import validate_input_data


AssignmentKey = Tuple[str, str, str, str, str]


def generate_timetable(input_data: TimetableInput) -> TimetableOutput:
    validation_conflicts = validate_input_data(input_data)
    blocking_conflicts = [
        conflict for conflict in validation_conflicts
        if conflict.severity == "HIGH"
    ]

    if blocking_conflicts:
        return build_failed_output(input_data, validation_conflicts)

    model = cp_model.CpModel()

    faculties = {faculty.id: faculty for faculty in input_data.faculties}
    rooms = {room.id: room for room in input_data.rooms}
    time_slots = {slot.id: slot for slot in input_data.timeSlots}
    subjects = {subject.id: subject for subject in input_data.subjects}

    ordered_slots = sorted(
        input_data.timeSlots,
        key=lambda slot: (DAY_ORDER.get(slot.day, 99), slot.startTime)
    )

    sessions = create_sessions(input_data)
    subject_student_sets = build_subject_student_sets(input_data)

    assignment_vars: Dict[AssignmentKey, cp_model.IntVar] = {}
    scheduled_vars: Dict[str, cp_model.IntVar] = {}

    for session in sessions:
        session_id = session["sessionId"]
        subject = subjects[session["subjectId"]]
        possible_vars = []

        scheduled_var = model.NewBoolVar(f"scheduled__{session_id}")
        scheduled_vars[session_id] = scheduled_var

        eligible_faculty_ids = get_eligible_faculty_ids(subject)

        for faculty_id in eligible_faculty_ids:
            faculty = faculties.get(faculty_id)

            if not faculty:
                continue

            for room in input_data.rooms:
                if not is_room_valid_for_subject(
                    input_data,
                    subject,
                    room,
                    subject_student_sets
                ):
                    continue

                for slot in ordered_slots:
                    if slot.id in faculty.unavailableTimeSlotIds:
                        continue

                    key: AssignmentKey = (
                        session_id,
                        subject.id,
                        faculty.id,
                        room.id,
                        slot.id
                    )

                    var = model.NewBoolVar(
                        f"assign__{session_id}__{faculty.id}__{room.id}__{slot.id}"
                    )

                    assignment_vars[key] = var
                    possible_vars.append(var)

        if possible_vars:
            model.Add(sum(possible_vars) == scheduled_var)
        else:
            model.Add(scheduled_var == 0)

    add_faculty_no_double_booking_constraint(
        model,
        assignment_vars,
        input_data.faculties,
        ordered_slots
    )

    add_room_no_double_booking_constraint(
        model,
        assignment_vars,
        input_data.rooms,
        ordered_slots
    )

    add_group_no_overlap_constraint(
        model,
        assignment_vars,
        input_data.subjects,
        ordered_slots
    )

    add_nep_student_elective_overlap_constraint(
        model,
        assignment_vars,
        subject_student_sets,
        ordered_slots
    )

    add_faculty_max_workload_constraint(
        model,
        assignment_vars,
        input_data.faculties
    )

    penalty_terms = []

    add_unscheduled_penalties(
        penalty_terms,
        scheduled_vars
    )

    add_room_capacity_gap_penalties(
        penalty_terms,
        assignment_vars,
        input_data,
        rooms,
        subjects,
        subject_student_sets
    )

    add_same_subject_same_day_penalties(
        model,
        penalty_terms,
        assignment_vars,
        input_data.subjects,
        ordered_slots
    )

    add_faculty_back_to_back_penalties(
        model,
        penalty_terms,
        assignment_vars,
        input_data.faculties,
        ordered_slots
    )

    if penalty_terms:
        model.Minimize(sum(penalty_terms))

    solver = cp_model.CpSolver()
    solver.parameters.max_time_in_seconds = 15
    solver.parameters.num_search_workers = 1
    solver.parameters.random_seed = 42

    status = solver.Solve(model)

    if status not in [cp_model.OPTIMAL, cp_model.FEASIBLE]:
        conflicts = validation_conflicts + [
            ConflictReport(
                type="SOLVER_FAILED",
                message="Solver could not generate a feasible timetable.",
                severity="HIGH",
                affectedEntity="solver",
                suggestedFix="Check rooms, faculty availability, subject workload, and time slot count."
            )
        ]

        return build_failed_output(input_data, conflicts)

    timetable = extract_timetable(
        solver,
        assignment_vars,
        subjects,
        time_slots
    )

    conflicts = validation_conflicts + detect_conflicts(input_data, timetable)
    summary = build_optimization_summary(input_data, timetable, conflicts)

    return TimetableOutput(
        timetable=timetable,
        conflicts=conflicts,
        optimizationSummary=summary
    )


def create_sessions(input_data: TimetableInput) -> List[Dict[str, str]]:
    sessions = []

    for subject in input_data.subjects:
        for hour_index in range(subject.required_hours()):
            sessions.append(
                {
                    "sessionId": f"{subject.id}__H{hour_index + 1}",
                    "subjectId": subject.id
                }
            )

    return sessions


def get_eligible_faculty_ids(subject: Subject) -> List[str]:
    faculty_ids = []

    if subject.facultyId:
        faculty_ids.append(subject.facultyId)

    faculty_ids.extend(subject.eligibleFacultyIds)

    return list(dict.fromkeys(faculty_ids))


def is_room_valid_for_subject(
    input_data: TimetableInput,
    subject: Subject,
    room: Room,
    subject_student_sets
) -> bool:
    student_count = subject_student_count(
        input_data,
        subject,
        subject_student_sets
    )

    if room.capacity < student_count:
        return False

    if room.roomType != subject.subjectType:
        return False

    return True


def add_faculty_no_double_booking_constraint(
    model,
    assignment_vars,
    faculties: List[Faculty],
    slots: List[TimeSlot]
):
    for faculty in faculties:
        for slot in slots:
            vars_for_faculty_slot = [
                var
                for key, var in assignment_vars.items()
                if key[2] == faculty.id and key[4] == slot.id
            ]

            if vars_for_faculty_slot:
                model.AddAtMostOne(vars_for_faculty_slot)


def add_room_no_double_booking_constraint(
    model,
    assignment_vars,
    rooms: List[Room],
    slots: List[TimeSlot]
):
    for room in rooms:
        for slot in slots:
            vars_for_room_slot = [
                var
                for key, var in assignment_vars.items()
                if key[3] == room.id and key[4] == slot.id
            ]

            if vars_for_room_slot:
                model.AddAtMostOne(vars_for_room_slot)


def add_group_no_overlap_constraint(
    model,
    assignment_vars,
    subjects: List[Subject],
    slots: List[TimeSlot]
):
    subject_map = {subject.id: subject for subject in subjects}
    group_keys = {subject_group_key(subject) for subject in subjects}

    for group_key in group_keys:
        for slot in slots:
            vars_for_group_slot = []

            for key, var in assignment_vars.items():
                subject_id = key[1]
                subject = subject_map[subject_id]

                if subject_group_key(subject) == group_key and key[4] == slot.id:
                    vars_for_group_slot.append(var)

            if vars_for_group_slot:
                model.AddAtMostOne(vars_for_group_slot)


def add_nep_student_elective_overlap_constraint(
    model,
    assignment_vars,
    subject_student_sets: Dict[str, Set[str]],
    slots: List[TimeSlot]
):
    student_subjects: Dict[str, Set[str]] = {}

    for subject_id, student_ids in subject_student_sets.items():
        for student_id in student_ids:
            student_subjects.setdefault(student_id, set()).add(subject_id)

    for student_id, selected_subject_ids in student_subjects.items():
        for slot in slots:
            vars_for_student_slot = [
                var
                for key, var in assignment_vars.items()
                if key[1] in selected_subject_ids and key[4] == slot.id
            ]

            if vars_for_student_slot:
                model.AddAtMostOne(vars_for_student_slot)


def add_faculty_max_workload_constraint(
    model,
    assignment_vars,
    faculties: List[Faculty]
):
    for faculty in faculties:
        workload_vars = [
            var
            for key, var in assignment_vars.items()
            if key[2] == faculty.id
        ]

        if workload_vars:
            model.Add(sum(workload_vars) <= faculty.maxWeeklyHours)


def add_unscheduled_penalties(
    penalty_terms,
    scheduled_vars
):
    for scheduled_var in scheduled_vars.values():
        penalty_terms.append(
            (1 - scheduled_var) * UNSCHEDULED_SESSION_PENALTY
        )


def add_room_capacity_gap_penalties(
    penalty_terms,
    assignment_vars,
    input_data,
    rooms,
    subjects,
    subject_student_sets
):
    for key, var in assignment_vars.items():
        subject_id = key[1]
        room_id = key[3]

        subject = subjects[subject_id]
        room = rooms[room_id]

        student_count = subject_student_count(
            input_data,
            subject,
            subject_student_sets
        )

        capacity_gap = room.capacity - student_count

        if capacity_gap > 50:
            penalty_terms.append(var * ROOM_CAPACITY_GAP_PENALTY * 3)
        elif capacity_gap > 25:
            penalty_terms.append(var * ROOM_CAPACITY_GAP_PENALTY)


def add_same_subject_same_day_penalties(
    model,
    penalty_terms,
    assignment_vars,
    subjects: List[Subject],
    slots: List[TimeSlot]
):
    days = sorted(
        {slot.day for slot in slots},
        key=lambda day: DAY_ORDER.get(day, 99)
    )

    slot_map = {slot.id: slot for slot in slots}

    for subject in subjects:
        for day in days:
            vars_for_subject_day = [
                var
                for key, var in assignment_vars.items()
                if key[1] == subject.id and slot_map[key[4]].day == day
            ]

            if not vars_for_subject_day:
                continue

            count_var = model.NewIntVar(
                0,
                subject.required_hours(),
                f"count__{subject.id}__{day}"
            )

            excess_var = model.NewIntVar(
                0,
                subject.required_hours(),
                f"excess__{subject.id}__{day}"
            )

            model.Add(count_var == sum(vars_for_subject_day))
            model.Add(excess_var >= count_var - 1)

            penalty_terms.append(excess_var * SAME_SUBJECT_SAME_DAY_PENALTY)


def add_faculty_back_to_back_penalties(
    model,
    penalty_terms,
    assignment_vars,
    faculties: List[Faculty],
    slots: List[TimeSlot]
):
    slots_by_day: Dict[str, List[TimeSlot]] = {}

    for slot in slots:
        slots_by_day.setdefault(slot.day, []).append(slot)

    for day in slots_by_day:
        slots_by_day[day] = sorted(
            slots_by_day[day],
            key=lambda slot: slot.startTime
        )

    for faculty in faculties:
        occupied = {}

        for slot in slots:
            slot_vars = [
                var
                for key, var in assignment_vars.items()
                if key[2] == faculty.id and key[4] == slot.id
            ]

            occupied_var = model.NewBoolVar(
                f"occupied__{faculty.id}__{slot.id}"
            )

            if slot_vars:
                model.Add(sum(slot_vars) == occupied_var)
            else:
                model.Add(occupied_var == 0)

            occupied[slot.id] = occupied_var

        for day_slots in slots_by_day.values():
            for index in range(len(day_slots) - 1):
                current_slot = day_slots[index]
                next_slot = day_slots[index + 1]

                back_to_back_var = model.NewBoolVar(
                    f"back_to_back__{faculty.id}__{current_slot.id}__{next_slot.id}"
                )

                model.AddBoolAnd([
                    occupied[current_slot.id],
                    occupied[next_slot.id]
                ]).OnlyEnforceIf(back_to_back_var)

                model.AddBoolOr([
                    occupied[current_slot.id].Not(),
                    occupied[next_slot.id].Not()
                ]).OnlyEnforceIf(back_to_back_var.Not())

                penalty_terms.append(
                    back_to_back_var * FACULTY_BACK_TO_BACK_PENALTY
                )


def extract_timetable(
    solver,
    assignment_vars,
    subjects,
    time_slots
) -> List[TimetableEntry]:
    entries = []

    for key, var in assignment_vars.items():
        if solver.Value(var) != 1:
            continue

        session_id, subject_id, faculty_id, room_id, slot_id = key

        subject = subjects[subject_id]
        slot = time_slots[slot_id]

        entries.append(
            TimetableEntry(
                departmentId=subject.departmentId,
                semester=subject.semester,
                subjectId=subject.id,
                subjectName=subject.name,
                facultyId=faculty_id,
                roomId=room_id,
                timeSlotId=slot.id,
                day=slot.day,
                startTime=slot.startTime,
                endTime=slot.endTime
            )
        )

    entries.sort(
        key=lambda entry: (
            entry.departmentId,
            entry.semester,
            DAY_ORDER.get(entry.day, 99),
            entry.startTime,
            entry.subjectName
        )
    )

    return entries


def build_failed_output(
    input_data: TimetableInput,
    conflicts: List[ConflictReport]
) -> TimetableOutput:
    summary = build_optimization_summary(
        input_data=input_data,
        timetable=[],
        conflicts=conflicts
    )

    return TimetableOutput(
        timetable=[],
        conflicts=conflicts,
        optimizationSummary=summary
    )
