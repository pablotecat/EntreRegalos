# EntreRegalos Agent Guide

## Layout

- This is not an npm workspace: `frontend/` and `backend/` have separate lockfiles and must be installed and checked from their own directories. The root `package.json` has no scripts.
- `frontend/` is a React 18 + Vite SPA. `src/main.tsx` provides React Query and the router; routes are declared in `src/App.tsx`; API calls go through `src/api/client.ts`.
- `backend/` is a NestJS API with Prisma/PostgreSQL. `src/main.ts` sets the `/api/v1` prefix, DTO whitelist validation, cookie parsing, and credentialed CORS. Auth and role guards are global, so endpoints must use `@Public()` deliberately.
- Prisma schema and committed migrations are in `backend/prisma/`. Use the configured PostgreSQL `DATABASE_URL`; do not treat a schema edit as sufficient without an appropriate migration.

## Local Development

- Use Node 20, matching `backend/package.json`, Dockerfiles, and CI.
- Start the full local stack with `docker-compose up`; it exposes the SPA at `http://localhost:3000` and API at `http://localhost:3001/api/v1`. Compose applies migrations and runs the Prisma seed before starting the backend.
- For separate processes, copy `backend/.env.example` to `backend/.env`, then run `npm run start:dev` in `backend/` and `npm run dev` in `frontend/`. Vite runs on port 3000 and proxies `/api` to port 3001.
- The frontend defaults to relative `/api/v1`; set `VITE_API_URL` only when the frontend must call a different API origin.

## Verification

- CI runs, per project, `npm ci`, `npm run lint`, then `npm test`. Run the same focused checks from the changed project directory.
- Frontend: `npm run lint`, `npm test`, `npm run build`. Vitest uses jsdom and `src/test-setup.ts`; focus a test with `npx vitest run src/components/ui/Button.test.tsx`.
- Backend: `npm run lint`, `npm test`, `npm run build`. The lint command includes `--fix`, so inspect its changes before retaining them. Backend Vitest runs in Node and coverage includes only `src/**/*.service.ts`; focus a test with `npx vitest run src/auth/auth.service.spec.ts`.
- Backend tests in CI receive a dedicated PostgreSQL database and JWT environment variables. Unit tests should not require a running database unless they explicitly integrate with it.

## Deployment Constraints

- Production deployment is driven by `.github/workflows/deploy-backend.yml`: build the frontend with `VITE_API_URL=https://entreregalos.helioho.st/api/v1`, copy `frontend/dist` to `backend/public`, build the backend, then run `npx prisma generate` in `backend/`.
- `backend/src/app.module.ts` serves `backend/public` and falls back to its `index.html` for SPA routes while excluding `/api/v1`. Keep that copy step when changing the production build/deploy path.
- HelioHost Passenger loads `backend/app.js`, which sets `PASSENGER=true` and calls the exported `createApp()` from `dist/main`; do not remove the `PASSENGER` guard in `src/main.ts` or make the normal bootstrap unconditional.
