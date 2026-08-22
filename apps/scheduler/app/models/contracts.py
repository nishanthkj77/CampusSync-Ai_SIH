from enum import StrEnum
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, model_validator


class ContractModel(BaseModel):
    model_config = ConfigDict(extra="forbid", frozen=True)


class DayOfWeek(StrEnum):
    MONDAY = "MONDAY"
    TUESDAY = "TUESDAY"
    WEDNESDAY = "WEDNESDAY"
    THURSDAY = "THURSDAY"
    FRIDAY = "FRIDAY"
    SATURDAY = "SATURDAY"


class CourseType(StrEnum):
    CORE = "CORE"
    ELECTIVE = "ELECTIVE"
    LAB = "LAB"
    PROJECT = "PROJECT"
    SEMINAR = "SEMINAR"
    SKILL = "SKILL"
    VALUE_ADDED = "VALUE_ADDED"


class RoomType(StrEnum):
    CLASSROOM = "CLASSROOM"
    LAB = "LAB"
    SEMINAR_HALL = "SEMINAR_HALL"
    AUDITORIUM = "AUDITORIUM"


class SolverStatus(StrEnum):
    OPTIMAL = "OPTIMAL"
    FEASIBLE = "FEASIBLE"
    INFEASIBLE = "INFEASIBLE"
    UNKNOWN = "UNKNOWN"
    ERROR = "ERROR"


class ScheduleContext(ContractModel):
    scheduleRunId: UUID
    academicTermId: UUID
    departmentId: UUID
    programId: UUID | None = None
    sectionId: UUID | None = None


class TimeSlot(ContractModel):
    id: UUID
    day: DayOfWeek
    startMinute: int = Field(ge=0, le=1439)
    endMinute: int = Field(ge=1, le=1440)
    label: str | None = None

    @model_validator(mode="after")
    def validate_range(self) -> "TimeSlot":
        if self.endMinute <= self.startMinute:
            raise ValueError("endMinute must be greater than startMinute")
        return self


class Faculty(ContractModel):
    id: UUID
    maxWeeklyMinutes: int = Field(gt=0)
    unavailableTimeSlotIds: list[UUID] = Field(default_factory=list)
    preferredTimeSlotIds: list[UUID] = Field(default_factory=list)


class Room(ContractModel):
    id: UUID
    roomType: RoomType
    capacity: int = Field(gt=0)
    unavailableTimeSlotIds: list[UUID] = Field(default_factory=list)


class CourseOffering(ContractModel):
    id: UUID
    offeringCode: str = Field(min_length=1)
    courseCode: str = Field(min_length=1)
    title: str = Field(min_length=1)
    courseType: CourseType
    sectionId: UUID | None = None
    weeklySessions: int = Field(gt=0)
    sessionDurationMinutes: int = Field(gt=0)
    requiresLab: bool
    expectedEnrollment: int = Field(ge=0)
    eligibleFacultyIds: list[UUID] = Field(min_length=1)
    studentIds: list[UUID] = Field(default_factory=list)


class ScheduleEntry(ContractModel):
    courseOfferingId: UUID
    sessionIndex: int = Field(ge=0)
    facultyId: UUID
    roomId: UUID
    timeSlotId: UUID
    sectionId: UUID | None = None


class SchedulingWeights(ContractModel):
    unscheduledSession: int = Field(default=1000, ge=0)
    facultyPreference: int = Field(default=10, ge=0)
    minimizeFacultyGaps: int = Field(default=5, ge=0)
    minimizeStudentGaps: int = Field(default=5, ge=0)
    balanceDailyLoad: int = Field(default=3, ge=0)
    roomStability: int = Field(default=2, ge=0)


class SchedulingRules(ContractModel):
    maxFacultyDailyMinutes: int | None = Field(default=None, gt=0)
    maxSectionDailySessions: int | None = Field(default=None, gt=0)
    enforceRoomCapacity: bool = True
    enforceLabRooms: bool = True
    enforceFacultyAvailability: bool = True
    enforceRoomAvailability: bool = True
    weights: SchedulingWeights = Field(default_factory=SchedulingWeights)


class ScheduleGenerationRequest(ContractModel):
    contractVersion: str = Field(pattern=r"^1\.0$")
    context: ScheduleContext
    courseOfferings: list[CourseOffering] = Field(min_length=1)
    faculty: list[Faculty] = Field(min_length=1)
    rooms: list[Room] = Field(min_length=1)
    timeSlots: list[TimeSlot] = Field(min_length=1)
    lockedEntries: list[ScheduleEntry] = Field(default_factory=list)
    rules: SchedulingRules = Field(default_factory=SchedulingRules)


class SchedulerIssue(ContractModel):
    code: str = Field(min_length=1)
    severity: str = Field(pattern=r"^(INFO|WARNING|ERROR)$")
    message: str = Field(min_length=1)
    courseOfferingId: UUID | None = None
    details: dict[str, object] | None = None


class ScheduleMetrics(ContractModel):
    requestedSessions: int = Field(ge=0)
    scheduledSessions: int = Field(ge=0)
    unscheduledSessions: int = Field(ge=0)
    solveTimeMs: int = Field(ge=0)


class ScheduleGenerationResult(ContractModel):
    contractVersion: str = Field(pattern=r"^1\.0$")
    scheduleRunId: UUID
    status: SolverStatus
    objectiveScore: float | None = None
    entries: list[ScheduleEntry]
    issues: list[SchedulerIssue]
    metrics: ScheduleMetrics
