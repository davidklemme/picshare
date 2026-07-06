import { NextResponse } from "next/server";
import { decryptZipPassword } from "@/lib/crypto";
import { getPhotoSubmissions } from "@/lib/db";

function escapeCsv(value: string) {
  return `"${value.replaceAll('"', '""')}"`;
}

export async function GET() {
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
