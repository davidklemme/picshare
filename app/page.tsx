import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getSubmissionForUser } from "@/lib/db";
import PhotoRequestForm from "./photo-request-form";

export const dynamic = "force-dynamic";

export default async function Home() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect("/signin");
  }

  if (session.user.role === "admin") {
    redirect("/admin");
  }

  const existing = await getSubmissionForUser(session.user.id);

  return (
    <PhotoRequestForm
      alreadySubmitted={Boolean(existing)}
      defaultChildName={existing?.child_name ?? ""}
      defaultFamilyName={existing?.family_name ?? ""}
      defaultImageNumbers={existing?.image_numbers ?? ""}
      defaultPhone={existing?.phone ?? ""}
      status={existing?.status ?? null}
    />
  );
}
