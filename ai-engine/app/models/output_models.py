from typing import Dict, List
from pydantic import BaseModel


class TimetableEntry(BaseModel):
    departmentId: str
    semester: int
    subjectId: str
    subjectName: str
    facultyId: str
    roomId: str
    timeSlotId: str
    day: str
    startTime: str
    endTime: str


class ConflictReport(BaseModel):
    type: str
    message: str
    severity: str
    affectedEntity: str
    suggestedFix: str
    status: str = "OPEN"


class OptimizationSummary(BaseModel):
    totalEntries: int
    scheduledEntries: int
    unscheduledEntries: int
    hardConflicts: int
    softConflicts: int
    facultyWorkloadSummary: Dict[str, int]
    roomUtilizationSummary: Dict[str, int]
    generationStatus: str


class TimetableOutput(BaseModel):
    timetable: List[TimetableEntry]
    conflicts: List[ConflictReport]
    optimizationSummary: OptimizationSummary
