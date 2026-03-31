# FullProduct.dev / GREEN Stack

This project was kickstarted with FullProduct.dev's universal app starterkit:

## Core conventions

- **Zod schemas as single source of truth**: Use `schema()` from `@green-stack/schemas`. APIs, types, db models and docs derive from these to stay in sync.
- **Workspace-defined routes**: Define routes in `features/*/routes/`. Run `npm run link:routes` to re-export to Expo/Next.
- **Universal UI**: Use `View`, `Text`, `Image` from `@app/ui` with Nativewind compatible `className` instead of HTML primitives.
- **Expo + Next.js**: Most UI must work on **web (Next.js)** and **mobile (Expo)**. Routing, images, and some APIs use **React Portability Patterns** (shared types + `*.next` / `*.expo` implementations injected at app roots)—not only `.web.ts` / `.ios.ts` splits. See [React Portability Patterns](https://fullproduct.dev/docs/portability-patterns).
- **Feature-first colocation**: Routes, resolvers, schemas, screens live together in `features/*/` or `packages/*/` workspaces instead of being split by frontend/backend.
- **Portable workspaces and dependencies**: Expo/native packages used only by a `features/*/` or `packages/*/` workspace belong in **that workspace’s `package.json`**, not on `apps/expo`. Use **`npm run add:dependencies`** to install SDK-compatible versions via `expo install`, the script will then move the resolved versions to the target workspace (see `.cursor/rules/workspace-expo-dependencies.mdc`).

## Detailed docs (reference when relevant)

- [Project structure](https://fullproduct.dev/docs/project-structure)
- [Routing](https://fullproduct.dev/docs/universal-routing)
- [React Portability Patterns](https://fullproduct.dev/docs/portability-patterns)
- [Data resolvers & APIs](https://fullproduct.dev/docs/data-resolvers)
- [Data fetching](https://fullproduct.dev/docs/data-fetching)
- [Schemas & single sources of truth](https://fullproduct.dev/docs/single-sources-of-truth)
- [Universal styling](https://fullproduct.dev/docs/write-once-styles)
- [Form management](https://fullproduct.dev/docs/form-management)
- [Generators](https://fullproduct.dev/docs/generators)
- [Workspace drivers](https://fullproduct.dev/docs/workspace-drivers)
- [Env vars + App config](https://fullproduct.dev/docs/app-config)
- [Automatic docgen](https://fullproduct.dev/docs/automatic-docgen)

---
# Code Style
---

When updating or recreating files:
- always maintain the same code style and tab spacing of the existing files

### Comments

- **Preserve all existing comments** in any file you edit. Do not delete or shorten them unless you are **deleting or rewriting the exact lines they refer to**—then update those comments to match the new behavior.
- **Treat inline and block comments as part of the API** of the file: moving code should move comments with it; refactors must **re-home** comments, not drop them for brevity.

### Type Safety

- Try to never use `any` unless absolutely necessary. Attempt to use generics instead or inference instead.
- If we need a type and can extract a type from a Zod schema, we should. Check our single sources of truth docs for more info about that.

### File layout (section dividers)

- Use section dividers like `/* --- Section name ------------------------------------------------------------- */` padded to **~100 characters** (match surrounding files).
- Prefer this **order** when it fits: **constants** → **types** → **implementation** (add other sections such as styles or exports as needed).

---
# Plans
---

Wherever possible, think of a plan and good feeback loop for the code you'll be writing.

Make the plan extremely concise. Sacrifice grammar for the sake of concision.

At the end of each plan, give me a list of unresolved questions to answer, if any.

A good feedback loop could be a test suite to run red green iterations with, or look at some of our scripts to run to help test everything still works as expected.

---
# Checks
---

### Testing and regression checks

To see whether all apps are still working as expected, run the relevant commands to check:

- `npm run test` runs all bun tests in `@green-stack/core`.
- `npm run typecheck` runs `typecheck` in every workspace that defines it (via Turbo, parallel + cached).
- `npm run typecheck:web` and `typecheck:mobile` scope to one app.
- `npm run build:web` runs the Next.js production build for `@app/next` (`apps/next`).
- `npm run build:mobile` runs `expo export` for `@app/expo` (`apps/expo`).
- `npm run build` runs the full Turbo `build` pipeline for the monorepo.
