# Picshare Coding Standards

Adapted from KOMPLYT's coding standards for this project's stack (raw `pg`, no ORM; no Jira). When in doubt, follow these.

## Core Principles

1. **Security first** — never trust input, sanitize everything, fail closed.
2. **Early exit** — guard clauses over nested conditionals.
3. **Immutability** — prefer `const`, avoid mutation.
4. **Composition** — small functions that do one thing.

## TypeScript Patterns

### Early exit (guard clauses)

```typescript
// BAD
function process(user: User | null) {
  if (user) {
    if (user.isActive) {
      return doSomething(user);
    }
  }
}

// GOOD
function process(user: User | null) {
  if (!user) throw new Error("No user");
  if (!user.isActive) throw new Error("Inactive");
  return doSomething(user);
}
```

### Type shapes

This codebase consistently uses `type` for object shapes as well as unions/intersections (see `PhotoSubmission`, `AdminUser`, `SubmissionState`, `InviteState`). Keep using `type` for new object shapes rather than mixing in `interface` — consistency matters more than which one.

## Security Standards

- **Parameterized queries only.** Never interpolate values into SQL strings — always `$1, $2, ...` placeholders (see `lib/db.ts`).
- **No secrets in code.** Read from `process.env`, throw if missing. Never commit `.env*` files (already gitignored).
- **Validate all external input** in server actions and route handlers before use.
- **Auth is a real boundary, not cosmetic.** Middleware only does an optimistic cookie-presence check (Edge runtime can't reach Postgres). Every protected Server Component and route handler must independently call `auth.api.getSession()` and check `role` — that's the actual enforcement point.
- **Timing-safe comparison** for any secret-equality check (access codes, tokens) — use `crypto.timingSafeEqual`, not `===`.

## Next.js Patterns

- **Server Components by default.** Only add `"use client"` on the interactive leaf that needs it, not its parent.
- **No `useEffect` + `fetch` for data loading.** Fetch in Server Components and pass data as props. `useEffect` is fine for pure client-side derived UI state (e.g. live password-confirmation validation), not for loading data that could be fetched server-side.
- **Mutations via Server Actions** where possible; plain `fetch` in an event handler is fine for cases a Server Action can't cover (e.g. calls that must run before a client-side sign-in).
- **Data access lives in `lib/`**, not inlined in page files — pages and route handlers import the same functions from `lib/db.ts` / `lib/auth.ts`.

## Naming Conventions

| Context           | Convention  | Example                   |
| ------------------ | ----------- | -------------------------- |
| Database columns   | snake_case  | `created_at`, `user_id`    |
| TypeScript         | camelCase   | `createdAt`, `userId`      |
| Constants          | UPPER_SNAKE | `IV_LENGTH`                |
| Types/Interfaces   | PascalCase  | `PhotoSubmission`          |
| Files (components) | kebab-case  | `sign-in-form.tsx`         |
| Files (other)      | kebab-case  | `auth-client.ts`           |

Note: Better Auth's own tables (`user`, `session`, `account`) use camelCase columns (`createdAt`) — that's the library's convention, not ours; leave it as-is rather than fighting the generated schema.

## Comments

Explain WHY, not WHAT. Skip comments that restate what the code already says.

```typescript
// GOOD — non-obvious constraint
// Neon requires the pooled endpoint for serverless functions to avoid
// exhausting direct connections.

// BAD — restates the code
// Loop through users
for (const user of users) { ... }
```

## Git Workflow

See the global instructions — feature branch, PR, wait for approval before merge. No exceptions, including "small" fixes.
