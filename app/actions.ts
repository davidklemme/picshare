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

const NUMBERS_PER_LINE = 5;
const MAX_RANGE_SPAN = 500;

// Parses "102, 007-010, 208" into individual numbers, expanding dash-ranges
// and preserving zero-padding (e.g. photo filenames like IMG_007.jpg), then
// dedupes by numeric value, sorts ascending, and wraps at NUMBERS_PER_LINE.
function formatImageNumbers(raw: string): string {
  const matches = raw.match(/\d+\s*-\s*\d+|\d+/g) ?? [];
  const displayByValue = new Map<number, string>();

  for (const match of matches) {
    const rangeParts = match.split("-").map((part) => part.trim());
    if (rangeParts.length === 2) {
      const [startStr, endStr] = rangeParts;
      const start = Number(startStr);
      const end = Number(endStr);
      const [from, to] = start <= end ? [start, end] : [end, start];
      // A huge span is almost certainly a typo (e.g. "100-100000" meant to
      // be two separate numbers), not an intentional request - don't expand it.
      if (to - from > MAX_RANGE_SPAN) {
        if (!displayByValue.has(start)) displayByValue.set(start, startStr);
        if (!displayByValue.has(end)) displayByValue.set(end, endStr);
        continue;
      }
      const width = Math.max(startStr.length, endStr.length);
      for (let n = from; n <= to; n++) {
        if (!displayByValue.has(n)) displayByValue.set(n, String(n).padStart(width, "0"));
      }
    } else {
      const value = Number(match);
      if (!displayByValue.has(value)) displayByValue.set(value, match);
    }
  }

  const sorted = Array.from(displayByValue.entries()).sort(([a], [b]) => a - b);
  const lines: string[] = [];
  for (let i = 0; i < sorted.length; i += NUMBERS_PER_LINE) {
    lines.push(
      sorted
        .slice(i, i + NUMBERS_PER_LINE)
        .map(([, display]) => display)
        .join(", "),
    );
  }
  return lines.join("\n");
}

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
  const phone = String(formData.get("phone") ?? "").trim();
  const imageNumbersRaw = String(formData.get("imageNumbers") ?? "").trim();
  const zipPassword = String(formData.get("zipPassword") ?? "");
  const zipPasswordConfirm = String(formData.get("zipPasswordConfirm") ?? "");

  if (!familyName || !childName || !phone || !imageNumbersRaw || !zipPassword || !zipPasswordConfirm) {
    return { ok: false, message: "Bitte fülle alle Felder aus." };
  }

  if (zipPassword.length < 6) {
    return { ok: false, message: "Das ZIP-Passwort muss mindestens 6 Zeichen lang sein." };
  }

  if (zipPassword !== zipPasswordConfirm) {
    return { ok: false, message: "Die Passwörter stimmen nicht überein." };
  }

  const imageNumbers = formatImageNumbers(imageNumbersRaw);
  if (!imageNumbers) {
    return { ok: false, message: "Bitte gib mindestens eine gültige Bildnummer an." };
  }

  const encryptedZipPassword = encryptZipPassword(zipPassword);
  await insertPhotoSubmission({
    userId: session.user.id,
    familyName,
    childName,
    phone,
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
