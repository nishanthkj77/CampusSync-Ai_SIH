from fastapi import FastAPI

from app.models.contracts import ScheduleGenerationRequest, ScheduleGenerationResult
from app.solver.engine import solve

app = FastAPI(
    title="CampusSync Scheduler",
    version="0.1.0",
    description="Stateless CP-SAT scheduling service for CampusSync AI V2.",
)


@app.get("/health")
def health() -> dict[str, str]:
    return {
        "service": "campussync-scheduler",
        "status": "ok",
        "version": "0.1.0",
    }


@app.post("/v1/schedules/generate", response_model=ScheduleGenerationResult)
def generate_schedule(request: ScheduleGenerationRequest) -> ScheduleGenerationResult:
    return solve(request)
