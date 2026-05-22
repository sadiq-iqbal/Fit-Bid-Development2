# FitBid

A full-stack fitness and nutrition bidding platform — Upwork meets MyFitnessPal. Clients post fitness goals, certified trainers and nutritionists compete by submitting bids, and a shared 3-way collaboration dashboard powers every engagement.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080, proxied at `/api`)
- `pnpm --filter @workspace/fitbid run dev` — run the React frontend (port 26261, proxied at `/`)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL`, `SESSION_SECRET`, `REPL_ID`

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite + TailwindCSS + shadcn/ui + wouter (routing) + recharts
- API: Express 5 with Replit Auth (OIDC/PKCE)
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (server), Zod (generated, client)
- API codegen: Orval (from OpenAPI spec in `lib/api-spec/openapi.yaml`)
- Build: esbuild (CJS bundle for server)

## Where things live

- `lib/api-spec/openapi.yaml` — source of truth for all API contracts
- `lib/db/src/schema/fitbid.ts` — all FitBid database tables
- `lib/db/src/schema/auth.ts` — sessions table (Replit Auth required)
- `lib/api-client-react/src/generated/api.ts` — all generated React Query hooks
- `lib/replit-auth-web/src/use-auth.ts` — `useAuth()` hook for frontend auth state
- `artifacts/api-server/src/routes/` — all API route handlers
- `artifacts/fitbid/src/pages/` — all frontend pages

## Architecture decisions

- Contract-first API: OpenAPI spec → Orval codegen → React Query hooks + Zod schemas
- Replit Auth (OIDC PKCE) with database-backed sessions (sessions table via drizzle)
- AuthUser type defined locally in `api-server/src/lib/auth.ts` (not from generated code)
- Codegen script patches `lib/api-zod/src/index.ts` post-orval to avoid TS2308 name collisions
- All server routes use `zod` (not `zod/v4`) for validation
- `req.params` values cast via `String()` to satisfy drizzle's strict string-only eq() types

## Product

- **Clients**: Post fitness goals, set budget & duration, browse bids, accept professionals
- **Professionals** (trainers/nutritionists): Browse posts, submit proposals, track engagements
- **Shared Engagement Dashboard**: 6 tabs — Overview, Workouts, Meals, Progress, Messages, Check-ins
- **Discovery**: Browse professional directory, view profiles & reviews
- **Admin**: Verify professional credentials, view platform stats

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- Do NOT run `pnpm dev` at root — use individual artifact workflows
- After schema changes: run `pnpm --filter @workspace/db run push` then `pnpm --filter @workspace/api-spec run codegen`
- Codegen patches `lib/api-zod/src/index.ts` — do not manually edit that file
- `req.params.xxx` in Express is typed as `string | string[]` — always cast with `String()`
- The `replit-auth-web` lib needs to be composite (`tsconfig.json` with `composite: true`)
- Array columns in drizzle: use `.array()` as method, e.g. `text("tags").array()`

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
- See `.local/skills/replit-auth/SKILL.md` for auth implementation details
