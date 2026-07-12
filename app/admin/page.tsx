import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth, EXPORT_OWNER_EMAIL } from "@/lib/auth";
import { getAdminUsers, getPhotoSubmissions } from "@/lib/db";
import LogoutButton from "../logout-button";
import DeleteSubmissionButton from "./delete-submission-button";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || session.user.role !== "admin") {
    redirect("/signin");
  }

  const [submissions, adminUsers] = await Promise.all([getPhotoSubmissions(), getAdminUsers()]);

  return (
    <main className="page-shell admin-shell">
      <section className="card wide-card">
        <div className="admin-header">
          <div>
            <p className="eyebrow">Admin</p>
            <h1>Admin-Nutzer</h1>
            <p className="intro">E-Mail-Adressen werden hier bewusst nicht angezeigt.</p>
          </div>
          <div style={{ display: "flex", gap: "12px" }}>
            <Link className="secondary-button" href="/admin/invite">
              Admin einladen
            </Link>
            <LogoutButton />
          </div>
        </div>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Rolle</th>
                <th>Erstellt</th>
              </tr>
            </thead>
            <tbody>
              {adminUsers.map((user) => (
                <tr key={user.id}>
                  <td>{user.name}</td>
                  <td>{user.role}</td>
                  <td>{new Date(user.created_at).toLocaleString("de-DE")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="card wide-card">
        <div className="admin-header">
          <div>
            <p className="eyebrow">Admin</p>
            <h1>Fotoauswahl-Übersicht</h1>
            <p className="intro">
              Passwörter und E-Mail-Adressen werden in der Tabelle bewusst nicht angezeigt.
              Telefonnummern sind sichtbar, um Einreichungen mit der Elternliste abzugleichen.
            </p>
          </div>
          {session.user.email === EXPORT_OWNER_EMAIL ? (
            <a className="secondary-button" href="/api/admin/export">
              CSV exportieren
            </a>
          ) : null}
        </div>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Familie</th>
                <th>Kind</th>
                <th>Telefon</th>
                <th>Bildnummern</th>
                <th>ZIP-Passwort</th>
                <th>Eingereicht</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {submissions.map((submission) => (
                <tr key={submission.id}>
                  <td>{submission.family_name}</td>
                  <td>{submission.child_name}</td>
                  <td>{submission.phone}</td>
                  <td style={{ whiteSpace: "pre-line" }}>{submission.image_numbers}</td>
                  <td aria-label="Passwort verborgen">********</td>
                  <td>{new Date(submission.created_at).toLocaleString("de-DE")}</td>
                  <td>
                    <DeleteSubmissionButton familyName={submission.family_name} id={submission.id} />
                  </td>
                </tr>
              ))}
              {submissions.length === 0 ? (
                <tr>
                  <td colSpan={7}>Noch keine Einreichungen vorhanden.</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
