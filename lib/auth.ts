import { betterAuth } from "better-auth";
import { Pool } from "pg";

const sharedConfig = {
  database: new Pool({ connectionString: process.env.DATABASE_URL }),
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL,
  user: {
    additionalFields: {
      role: {
        type: "string",
        input: false,
        defaultValue: "parent",
      },
    },
  },
} as const;

// Public-facing instance, mounted at /api/auth/[...all]. Sign-up is disabled
// here so the built-in /sign-up/email endpoint can never be used directly —
// this is the "no self signup" boundary.
export const auth = betterAuth({
  ...sharedConfig,
  emailAndPassword: { enabled: true, disableSignUp: true },
});

// Internal-only instance (never mounted as a route). Sign-up is enabled so
// our own gated code paths (parent-signup access-code route, admin invite
// action, seed script) can create users. Do not import this from any public
// route handler.
export const internalAuth = betterAuth({
  ...sharedConfig,
  emailAndPassword: { enabled: true, disableSignUp: false },
});

export type Role = "admin" | "parent";
