# CampusSync AI V2

CampusSync AI V2 is a clean rebuild of the university academic scheduling platform. The old repository is treated as a reference prototype; V2 uses one canonical domain model shared across the web app, API, PostgreSQL database, and AI scheduler.

## Architecture

- `apps/web` — React + TypeScript + Vite frontend
- `apps/api` — NestJS + Fastify API
- `apps/scheduler` — FastAPI + Google OR-Tools CP-SAT scheduling service
- `packages/contracts` — shared Zod contracts and TypeScript types
- `database/prisma` — PostgreSQL schema and migrations
- `docs` — architecture decisions and project documentation
- `infra` — deployment infrastructure

## Production baseline

- Node.js 24 LTS
- pnpm 11
- TypeScript 7
- React 19.2
- Vite 8.2
- NestJS 11.2 + Fastify
- Prisma ORM 7.9
- PostgreSQL 18.6
- Python 3.14
- FastAPI 0.141
- OR-Tools 9.15

Only stable releases are used. Beta, RC, canary, and alpha releases are intentionally excluded from the production baseline.

## Core rule

Database models, API DTOs, frontend forms, and scheduler payloads must never evolve independently. Shared contracts are defined first and consumed by all layers.

## Local development

1. Copy `.env.example` to `.env`.
2. Start PostgreSQL with `docker compose up -d postgres`.
3. Install Node dependencies with `pnpm install`.
4. Generate Prisma client with `pnpm db:generate`.
5. Start the web and API with `pnpm dev`.
6. In `apps/scheduler`, run `uv sync` then `uv run fastapi dev app/main.py --port 8000`.
