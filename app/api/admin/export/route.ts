import { NextResponse } from "next/server";
import { auth, EXPORT_OWNER_EMAIL } from "@/lib/auth";
import { decryptZipPassword } from "@/lib/crypto";
import { getPhotoSubmissions } from "@/lib/db";

function escapeCsv(value: string) {
  return `"${value.replaceAll('"', '""')}"`;
}

export async function GET(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session || session.user.role !== "admin") {
    return new NextResponse("Nicht autorisiert.", { status: 401 });
  }

  if (session.user.email !== EXPORT_OWNER_EMAIL) {
    console.warn(
      `[export] 🕵️ Busted: admin "${session.user.email}" (id=${session.user.id}) just tried to export every family's decrypted ZIP password. Not today.`,
    );
    return new NextResponse("Nicht autorisiert.", { status: 403 });
  }

  const submissions = await getPhotoSubmissions();
  const rows = submissions.map((submission) => [
    submission.family_name,
    submission.child_name,
    submission.image_numbers,
    decryptZipPassword(submission.encrypted_zip_password),
  ]);

  const csv = [
    ["family_name", "child_name", "image_numbers", "zip_password"],
    ...rows,
  ]
    .map((row) => row.map(escapeCsv).join(","))
    .join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Disposition": 'attachment; filename="formular_export.csv"',
      "Content-Type": "text/csv; charset=utf-8",
    },
  });
}
