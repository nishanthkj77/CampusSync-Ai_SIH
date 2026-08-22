# ADR 0002 — Supabase for managed Postgres and authentication

Status: Accepted for V2 baseline

## Decision

Use Supabase as the managed PostgreSQL host and identity provider for staging/production. Local development uses PostgreSQL 18 in Docker so developers can work offline and run migrations safely.

The browser uses Supabase Auth only for identity/session management. Application tables are not queried directly from the browser. The NestJS API remains the business-data boundary and connects to PostgreSQL through Prisma.

## Authentication flow

1. User signs in through Supabase Auth.
2. Web app receives a short-lived access token.
3. Web app sends the token to the NestJS API in `Authorization: Bearer ...`.
4. API verifies the token against the project's JWKS.
5. API maps JWT `sub` to `User.authSubject`.
6. API loads application role and resource scope from PostgreSQL.
7. Authorization is enforced by role + ownership + department/program scope.

Users never choose their own application role during registration.

## Why

- No custom password storage or reset flows in the API.
- Standards-based JWT verification.
- Managed PostgreSQL with backups and a visual dashboard.
- Prisma keeps the application independent from Supabase-specific table APIs.
- The backend remains the single location for business rules and authorization.
