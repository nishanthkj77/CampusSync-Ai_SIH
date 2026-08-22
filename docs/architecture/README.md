# CampusSync V2 architecture

## Request flow

```text
React web app
    |
    | HTTPS / JSON
    v
NestJS API
    |-----------------------> FastAPI scheduler
    |                           |
    |                           v
    |                       OR-Tools CP-SAT
    |
    v
Prisma ORM
    |
    v
PostgreSQL
```

The scheduler receives a fully validated, self-contained generation request and returns a deterministic result. It does not read or write database tables and it does not share temporary `input.json` / `output.json` files between requests.

## Domain boundaries

1. Identity and access
2. Academic structure
3. People
4. Curriculum and course offerings
5. Facilities and time
6. Enrollment and electives
7. Scheduling
8. Audit and observability
