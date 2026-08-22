# CampusSync V2 domain model

## Core principle

A permanent course definition is not a scheduled class. CampusSync separates curriculum from a term-specific offering.

```text
Course
  └── CourseOffering
        ├── CourseOfferingFaculty
        ├── StudentEnrollment
        ├── ElectiveBasketOffering
        └── ScheduleEntry
```

## Academic structure

```text
Department
  └── Program
        └── Section

AcademicYear
  └── AcademicTerm
```

`AcademicTerm` scopes time slots, enrollments, availability and every schedule run. Historical schedules therefore cannot collide with a new academic term.

## People

`User` stores application identity and role. `FacultyProfile` and `StudentProfile` store domain-specific attributes. Authentication identity is externalized through `User.authSubject` rather than storing passwords in CampusSync.

## Curriculum

`Course` is the permanent catalogue record: code, title, credits and type.

`CourseOffering` represents a course actually taught in an academic term for a program/semester/section. It contains the scheduling facts: weekly sessions, session duration, expected enrollment, lab requirement and eligible faculty.

## Electives

`ElectiveBasket` groups mutually selectable offerings. `StudentEnrollment` is the source of truth for who attends each offering; the solver can therefore prevent elective clashes based on real student overlap instead of assumptions.

## Facilities and time

`Room` stores type and capacity. `TimeSlot` is term-scoped and stores start/end minute values for solver-friendly arithmetic.

Faculty and room availability are explicit records keyed by academic term and time slot.

## Scheduling

Every generation attempt creates a `ScheduleRun`. Entries and issues always belong to a run.

```text
ScheduleRun
  ├── ScheduleEntry[]
  └── ScheduleIssue[]
```

Faculty and room uniqueness is enforced inside a run, which allows the same Monday 09:00 slot to be reused in future terms without database conflicts.

The scheduler never writes database records directly. It receives a versioned request contract and returns a versioned result contract to the API.
