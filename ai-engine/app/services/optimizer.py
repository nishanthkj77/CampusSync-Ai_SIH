from typing import Dict, List

from app.models.input_models import TimetableInput
from app.models.output_models import ConflictReport, OptimizationSummary, TimetableEntry


def build_optimization_summary(
    input_data: TimetableInput,
    timetable: List[TimetableEntry],
    conflicts: List[ConflictReport]
) -> OptimizationSummary:
    total_entries = sum(subject.required_hours() for subject in input_data.subjects)
    scheduled_entries = len(timetable)
    unscheduled_entries = max(total_entries - scheduled_entries, 0)

    hard_conflicts = len([
        conflict for conflict in conflicts
        if conflict.severity == "HIGH"
    ])

    soft_conflicts = len([
        conflict for conflict in conflicts
        if conflict.severity != "HIGH"
    ])

    faculty_workload = calculate_faculty_workload(timetable)
    room_utilization = calculate_room_utilization(timetable)

    if scheduled_entries == total_entries and hard_conflicts == 0:
        generation_status = "SUCCESS"
    elif scheduled_entries > 0:
        generation_status = "PARTIAL_SUCCESS"
    else:
        generation_status = "FAILED"

    return OptimizationSummary(
        totalEntries=total_entries,
        scheduledEntries=scheduled_entries,
        unscheduledEntries=unscheduled_entries,
        hardConflicts=hard_conflicts,
        softConflicts=soft_conflicts,
        facultyWorkloadSummary=faculty_workload,
        roomUtilizationSummary=room_utilization,
        generationStatus=generation_status
    )


def calculate_faculty_workload(
    timetable: List[TimetableEntry]
) -> Dict[str, int]:
    workload: Dict[str, int] = {}

    for entry in timetable:
        workload[entry.facultyId] = workload.get(entry.facultyId, 0) + 1

    return workload


def calculate_room_utilization(
    timetable: List[TimetableEntry]
) -> Dict[str, int]:
    utilization: Dict[str, int] = {}

    for entry in timetable:
        utilization[entry.roomId] = utilization.get(entry.roomId, 0) + 1

    return utilization
