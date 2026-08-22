from time import perf_counter

from app.models.contracts import (
    ScheduleGenerationRequest,
    ScheduleGenerationResult,
    ScheduleMetrics,
    SchedulerIssue,
    SolverStatus,
)


def solve(request: ScheduleGenerationRequest) -> ScheduleGenerationResult:
    """Phase-1 solver boundary.

    The full CP-SAT model will be implemented only after the V2 academic model and
    constraint catalogue are approved. Returning an explicit UNKNOWN result is safer
    than silently reusing the prototype solver against a changed data contract.
    """
    started = perf_counter()
    requested_sessions = sum(item.weeklySessions for item in request.courseOfferings)
    elapsed_ms = int((perf_counter() - started) * 1000)

    return ScheduleGenerationResult(
        contractVersion="1.0",
        scheduleRunId=request.context.scheduleRunId,
        status=SolverStatus.UNKNOWN,
        entries=[],
        issues=[
            SchedulerIssue(
                code="SOLVER_NOT_IMPLEMENTED",
                severity="WARNING",
                message="CampusSync V2 CP-SAT constraints are not implemented yet.",
            )
        ],
        metrics=ScheduleMetrics(
            requestedSessions=requested_sessions,
            scheduledSessions=0,
            unscheduledSessions=requested_sessions,
            solveTimeMs=elapsed_ms,
        ),
    )
