"use server";

import { headers } from "next/headers";
import { auth, createUserWithRole, generateTemporaryPassword } from "@/lib/auth";

export type InviteState = {
  ok: boolean;
  message: string;
  temporaryPassword?: string;
};

export async function inviteAdmin(
  _previousState: InviteState,
  formData: FormData,
): Promise<InviteState> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || session.user.role !== "admin") {
    return { ok: false, message: "Nicht autorisiert." };
  }

  const email = String(formData.get("email") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim() || email;

  if (!email) {
    return { ok: false, message: "Bitte eine E-Mail-Adresse angeben." };
  }

  const temporaryPassword = generateTemporaryPassword();

  try {
    await createUserWithRole({ email, password: temporaryPassword, name, role: "admin" });
  } catch {
    return { ok: false, message: "Einladung fehlgeschlagen. E-Mail eventuell bereits vergeben." };
  }

  return {
    ok: true,
    message: `Admin ${email} wurde angelegt. Bitte das Einmal-Passwort sicher übermitteln.`,
    temporaryPassword,
  };
}
