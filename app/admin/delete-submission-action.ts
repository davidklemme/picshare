"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { deletePhotoSubmission } from "@/lib/db";

export async function deleteSubmission(formData: FormData) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || session.user.role !== "admin") {
    return;
  }

  const id = Number(formData.get("id"));
  if (!Number.isInteger(id)) {
    return;
  }

  await deletePhotoSubmission(id);
  revalidatePath("/admin");
}
