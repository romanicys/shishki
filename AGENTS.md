# Repository Guidelines

## Project Structure & Module Organization
- **`app/`** houses Next.js routes and layouts. `page.tsx` is the journal-style homefeed; subfolders (`films`, `posts`, `search`, etc.) each export their own pages.
- **`components/`** holds reusable UI: editorial Hero, FilmCard, ArticlePreview, and shared UI primitives under `components/ui/`. Keep all new presentational logic or tailwind-heavy markup here.
- **`lib/`** contains service helpers that fetch films/posts/tags, utilities, and any data adapters.
- **`public/`** stores static assets (images, fonts). Add new editorial assets here and reference them from components.
- **`prisma/`** and `scripts/` relate to data modeling/seeding; touch only when adjusting the database or import logic.
- **`types/`** defines shared DTOs. Extend DTOs alongside API changes to keep typings accurate.

## Build, Test, and Development Commands
- `npm run dev` – fires up Next.js in development mode with Fast Refresh.
- `npm run build` – compiles and optimizes the app for production; use before deploying changes.
- `npm run lint` – runs ESLint across the `app`/`components`/`lib` folder stack (always before merging).
- `npm run start` – serves the production build locally; useful for manual QA once `npm run build` succeeds.

## Coding Style & Naming Conventions
- **Styling** relies on Tailwind v4 and the merged `tw/clsx` helper (`lib/utils.ts`). Favor descriptive utility sets instead of custom CSS files; use `apply` sparingly.
- **Typography**: use `font-display` class for Playfair headings and default system/Space Grotesk for body copy. Keep class lists tidy with `twMerge`.
- **Components**: place props/interface definitions near top, export named functions, and use folder path aliases (`@/components` etc.).
- **Linting**: ESLint is configured via `eslint.config.mjs`; run `npm run lint` after formatting changes.
- **Files**: TypeScript only—avoid `.js` unless absolutely required; capitalize component files (`Hero.tsx`).

## Testing Guidelines
- There is no automated test suite yet. Use `npm run lint` as a proxy for code hygiene.
- When adding tests, align filenames with the tested module (`FilmCard.test.tsx`) and colocate them within the same directory.

## Commit & Pull Request Guidelines
- Follow concise, present-tense commit messages (e.g., “Refine hero gradient” or “Add ArticlePreview component”).
- PR descriptions should summarize the change, mention related issues, and include screenshots or GIFs when the UI is affected.
- Link any relevant issue/EPIC via the description or PR template, and ensure `lint` passes before marking ready for review.

## Configuration & Secrets
- Environment variables are defined in `.env`/.env.example; do not commit secrets. Use `dotenv`-loaded configs in `lib/services`.
- If you alter Prisma models, run `npm run db:generate`/`npm run db:migrate` and update seeds/scripts accordingly.
