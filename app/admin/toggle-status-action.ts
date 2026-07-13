"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { setSubmissionStatus, SubmissionStatus } from "@/lib/db";

export async function toggleSubmissionStatus(formData: FormData) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || session.user.role !== "admin") {
    return;
  }

  const id = Number(formData.get("id"));
  const nextStatus = formData.get("nextStatus") as SubmissionStatus;
  if (!Number.isInteger(id) || (nextStatus !== "pending" && nextStatus !== "reviewed")) {
    return;
  }

  await setSubmissionStatus(id, nextStatus);
  revalidatePath("/admin");
}
