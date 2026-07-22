"use server";

import { headers } from "next/headers";
import { auth, generateTemporaryPassword, resetUserPassword } from "@/lib/auth";

export type ResetPasswordState = {
  ok: boolean;
  message: string;
  temporaryPassword?: string;
};

export async function resetPassword(
  _previousState: ResetPasswordState,
  formData: FormData,
): Promise<ResetPasswordState> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || session.user.role !== "admin") {
    return { ok: false, message: "Nicht autorisiert." };
  }

  const userId = String(formData.get("userId") ?? "");
  if (!userId) {
    return { ok: false, message: "Kein Konto ausgewählt." };
  }

  // Resetting your own password here would revoke your own session mid-action
  // and drop you back on /signin holding a password you haven't read yet.
  if (userId === session.user.id) {
    return {
      ok: false,
      message: "Das eigene Passwort lässt sich hier nicht zurücksetzen.",
    };
  }

  const temporaryPassword = generateTemporaryPassword();

  try {
    await resetUserPassword(userId, temporaryPassword);
  } catch (error) {
    // Unlike the invite action, a silent failure here strands a locked-out
    // parent with no trace of why — the admin only sees "fehlgeschlagen".
    console.error("Password reset failed", error);
    return { ok: false, message: "Zurücksetzen fehlgeschlagen." };
  }

  // No revalidatePath: nothing on /admin changes, and a refresh would drop the
  // one-time password out of the form state before it can be read.
  return {
    ok: true,
    message: "Passwort zurückgesetzt. Alle bestehenden Sitzungen wurden beendet.",
    temporaryPassword,
  };
}
