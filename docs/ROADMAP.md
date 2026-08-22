# CampusSync AI V2 rebuild roadmap

## Phase 0 — Freeze prototype

- [x] Audit the existing repository
- [x] Treat existing code as reference only
- [x] Define stable technology policy

## Phase 1 — Foundation

- [x] New monorepo layout
- [x] Canonical scheduling contract v1
- [x] New academic PostgreSQL model
- [x] React/Vite web shell
- [x] NestJS/Fastify API shell
- [x] FastAPI scheduler shell
- [x] Versioned ScheduleRun architecture
- [x] Managed-auth architecture decision
- [ ] Generate and commit dependency lockfiles
- [ ] Validate Prisma migration against PostgreSQL 18
- [ ] Add CI after dependency installation is available

## Phase 2 — Identity and academic master data

- [ ] Supabase Auth integration
- [ ] JWT/JWKS verification in NestJS
- [ ] Role + ownership + department-scope guards
- [ ] Department / program / academic-year / term APIs
- [ ] Faculty / student APIs
- [ ] Course / course-offering APIs
- [ ] Room / time-slot / availability APIs
- [ ] Domain-specific management UI

## Phase 3 — Enrollment and curriculum

- [ ] Sections and batches
- [ ] Student enrollment
- [ ] Elective baskets and choices
- [ ] Faculty assignment candidates/preferences
- [ ] Validation and import tools

## Phase 4 — CP-SAT scheduler

- [ ] Solver variable model
- [ ] Faculty overlap hard constraint
- [ ] Room overlap hard constraint
- [ ] Student/section overlap hard constraint
- [ ] Room capacity/type hard constraints
- [ ] Faculty/room availability hard constraints
- [ ] Weekly session fulfilment
- [ ] Consecutive lab periods
- [ ] Daily load limits
- [ ] Soft gap minimization
- [ ] Faculty preference objective
- [ ] Schedule quality metrics
- [ ] Unsatisfiable-problem explanations

## Phase 5 — Scheduling workflow

- [ ] Create/queue schedule run
- [ ] Backend-to-scheduler orchestration
- [ ] Persist generated entries/issues transactionally
- [ ] Lock/manual-adjust workflow
- [ ] Publish/archive workflow
- [ ] Student/faculty timetable views

## Phase 6 — Quality and SIH demo

- [ ] Unit/contract/integration/E2E tests
- [ ] Seeded realistic university dataset
- [ ] Import/export
- [ ] Accessibility and responsive review
- [ ] Docker production images
- [ ] CI/CD and dependency update automation
- [ ] Architecture diagrams and API docs
- [ ] Demo script and failure-mode demo
