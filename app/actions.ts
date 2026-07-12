"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { encryptZipPassword } from "@/lib/crypto";
import { insertPhotoSubmission } from "@/lib/db";

export type SubmissionState = {
  ok: boolean;
  message: string;
};

export async function submitPhotoRequest(
  _previousState: SubmissionState,
  formData: FormData,
): Promise<SubmissionState> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || session.user.role !== "parent") {
    return { ok: false, message: "Bitte melde dich an." };
  }

  const familyName = String(formData.get("familyName") ?? "").trim();
  const childName = String(formData.get("childName") ?? "").trim();
  const imageNumbers = String(formData.get("imageNumbers") ?? "").trim();
  const zipPassword = String(formData.get("zipPassword") ?? "");
  const zipPasswordConfirm = String(formData.get("zipPasswordConfirm") ?? "");

  if (!familyName || !childName || !imageNumbers || !zipPassword || !zipPasswordConfirm) {
    return { ok: false, message: "Bitte fülle alle Felder aus." };
  }

  if (zipPassword.length < 6) {
    return { ok: false, message: "Das ZIP-Passwort muss mindestens 6 Zeichen lang sein." };
  }

  if (zipPassword !== zipPasswordConfirm) {
    return { ok: false, message: "Die Passwörter stimmen nicht überein." };
  }

  const encryptedZipPassword = encryptZipPassword(zipPassword);
  await insertPhotoSubmission({
    userId: session.user.id,
    familyName,
    childName,
    imageNumbers,
    encryptedZipPassword,
  });
  revalidatePath("/admin");
  revalidatePath("/");

  return {
    ok: true,
    message: "Danke! Deine Fotoauswahl wurde gespeichert. Bitte merke dir dein ZIP-Passwort gut.",
  };
}
