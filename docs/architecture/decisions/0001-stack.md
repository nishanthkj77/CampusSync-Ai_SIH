# ADR 0001 — CampusSync V2 technology baseline

Status: Accepted

## Decision

CampusSync V2 uses a TypeScript monorepo for the web/API/contracts, PostgreSQL for relational persistence, and a separate Python optimization service for CP-SAT scheduling.

### Web

React 19.2, Vite 8.2, React Router 8, TanStack Query 5, React Hook Form 7, Zod 4, Tailwind CSS 4.

### API

NestJS 11 on Fastify. The API is the only service allowed to persist application data. Authentication, authorization, validation, audit logging, transactions, and scheduler orchestration live here.

### Database

PostgreSQL 18.6 with Prisma ORM 7.9. Course definitions are separated from term-specific course offerings. Timetables are versioned through ScheduleRun records.

### Scheduler

Python 3.14, FastAPI 0.141, Pydantic, Google OR-Tools 9.15 CP-SAT. The scheduler is stateless and never connects directly to PostgreSQL.

## Stability policy

"Latest" means the newest production-stable release that is compatible with the rest of the stack. Alpha, beta, RC, canary and nightly versions are not used in production.
