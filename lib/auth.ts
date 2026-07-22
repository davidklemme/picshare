import crypto from "crypto";
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

const emailAndPasswordConfig = {
  enabled: true,
  // resetUserPassword() below drives Better Auth's own /reset-password route,
  // which honours this flag — so the target's sessions are dropped as part of
  // the reset and a stolen session can't outlive it.
  revokeSessionsOnPasswordReset: true,
} as const;

// Public-facing instance, mounted at /api/auth/[...all]. Sign-up is disabled
// here so the built-in /sign-up/email endpoint can never be used directly —
// this is the "no self signup" boundary.
export const auth = betterAuth({
  ...sharedConfig,
  emailAndPassword: { ...emailAndPasswordConfig, disableSignUp: true },
});

// Internal-only instance (never mounted as a route). Sign-up is enabled so
// our own gated code paths (parent-signup access-code route, admin invite
// action, seed script) can create users. Do not import this from any public
// route handler.
export const internalAuth = betterAuth({
  ...sharedConfig,
  emailAndPassword: { ...emailAndPasswordConfig, disableSignUp: false },
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

// Shared by the admin-invite action and the admin password-reset action so
// both hand out credentials of the same strength.
export function generateTemporaryPassword(): string {
  return crypto.randomBytes(12).toString("base64url");
}

// Sets a new password for an existing user without knowing the old one.
//
// Better Auth's /reset-password route already does everything we need
// (hashing, creating the credential account if one is somehow missing,
// revoking sessions). It only needs a token, which normally comes from
// /request-password-reset — an endpoint that refuses to run without a
// sendResetPassword transport. Since this app deliberately has no email
// (see README), we mint the token exactly as that endpoint does and hand it
// straight to the route rather than mailing a link.
export async function resetUserPassword(userId: string, newPassword: string) {
  const ctx = await internalAuth.$context;

  // /reset-password trusts the token's user id, so a bad id would leave an
  // orphaned credential account behind. Fail before minting instead.
  if (!(await ctx.internalAdapter.findUserById(userId))) {
    throw new Error(`No user with id ${userId}.`);
  }

  // Short expiry: the token never leaves this function.
  const token = crypto.randomBytes(24).toString("base64url");
  await ctx.internalAdapter.createVerificationValue({
    value: userId,
    identifier: `reset-password:${token}`,
    expiresAt: new Date(Date.now() + 60_000),
  });

  await internalAuth.api.resetPassword({ body: { token, newPassword } });
}
