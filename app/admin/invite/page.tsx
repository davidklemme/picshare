import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import InviteForm from "./invite-form";

export const dynamic = "force-dynamic";

export default async function InviteAdminPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || session.user.role !== "admin") {
    redirect("/signin");
  }

  return (
    <main className="page-shell">
      <section className="card">
        <p className="eyebrow">Admin</p>
        <h1>
          Admin <em>einladen</em>
        </h1>
        <p className="intro">
          Legt ein neues Admin-Konto mit einem Einmal-Passwort an. Kein Selbst-Signup möglich.
        </p>

        <InviteForm />
      </section>
    </main>
  );
}
