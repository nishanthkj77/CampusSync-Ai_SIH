from typing import List, Optional
from pydantic import BaseModel, Field, field_validator


class Department(BaseModel):
    id: str
    name: Optional[str] = None


class Faculty(BaseModel):
    id: str
    name: Optional[str] = None
    departmentId: str = "UNKNOWN_DEPARTMENT"
    maxWeeklyHours: int = Field(default=18, ge=1)
    unavailableTimeSlotIds: List[str] = Field(default_factory=list)


class Student(BaseModel):
    id: str
    name: Optional[str] = None
    departmentId: str = "UNKNOWN_DEPARTMENT"
    semester: int = 1


class Subject(BaseModel):
    id: str
    name: str
    code: Optional[str] = None
    departmentId: str = "UNKNOWN_DEPARTMENT"
    semester: int = 1
    weeklyHours: Optional[int] = None
    credits: Optional[int] = None
    subjectType: str = "THEORY"
    eligibleFacultyIds: List[str] = Field(default_factory=list)
    facultyId: Optional[str] = None
    studentGroupId: Optional[str] = None
    studentCount: Optional[int] = None

    @field_validator("subjectType")
    @classmethod
    def normalize_subject_type(cls, value: str) -> str:
        value = (value or "THEORY").upper()

        if "LAB" in value:
            return "LAB"

        return "THEORY"

    def required_hours(self) -> int:
        if self.weeklyHours and self.weeklyHours > 0:
            return self.weeklyHours

        if self.credits and self.credits > 0:
            return self.credits

        return 1


class Room(BaseModel):
    id: str
    name: Optional[str] = None
    roomNumber: Optional[str] = None
    block: Optional[str] = None
    roomType: str = "THEORY"
    capacity: int = Field(default=1, ge=1)

    @field_validator("roomType")
    @classmethod
    def normalize_room_type(cls, value: str) -> str:
        value = (value or "THEORY").upper()

        if "LAB" in value:
            return "LAB"

        return "THEORY"


class TimeSlot(BaseModel):
    id: str
    day: str
    startTime: str
    endTime: str
    label: Optional[str] = None

    @field_validator("day")
    @classmethod
    def normalize_day(cls, value: str) -> str:
        return value.upper()


class CourseSelection(BaseModel):
    id: str
    studentId: Optional[str] = None
    studentGroupId: Optional[str] = None
    subjectId: Optional[str] = None
    subjectIds: List[str] = Field(default_factory=list)
    departmentId: Optional[str] = None
    semester: Optional[int] = None

    def selected_subject_ids(self) -> List[str]:
        selected = []

        if self.subjectId:
            selected.append(self.subjectId)

        selected.extend(self.subjectIds)

        return list(dict.fromkeys(selected))


class TimetableInput(BaseModel):
    departments: List[Department] = Field(default_factory=list)
    faculties: List[Faculty] = Field(default_factory=list)
    students: List[Student] = Field(default_factory=list)
    subjects: List[Subject] = Field(default_factory=list)
    rooms: List[Room] = Field(default_factory=list)
    timeSlots: List[TimeSlot] = Field(default_factory=list)
    courseSelections: List[CourseSelection] = Field(default_factory=list)
