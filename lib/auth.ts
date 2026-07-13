import { betterAuth } from "better-auth";
import { getPool, setUserRole } from "./db";

export type Role = "admin" | "parent";

const sharedConfig = {
  database: getPool(),
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

// Shared by every user-creation path (parent-signup route, admin invite
// action, seed script) so role assignment can't be forgotten in one of them.
export async function createUserWithRole(input: {
  email: string;
  password: string;
  name: string;
  role: Role;
}) {
  const result = await internalAuth.api.signUpEmail({
    body: { email: input.email, password: input.password, name: input.name },
  });
  await setUserRole(result.user.id, input.role);
  return result;
}
