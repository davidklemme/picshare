import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getAdminUsers, getPhotoSubmissions } from "@/lib/db";

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
          <Link className="secondary-button" href="/admin/invite">
            Admin einladen
          </Link>
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
            </p>
          </div>
          <a className="secondary-button" href="/api/admin/export">
            CSV exportieren
          </a>
        </div>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Familie</th>
                <th>Kind</th>
                <th>Bildnummern</th>
                <th>ZIP-Passwort</th>
                <th>Eingereicht</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map((submission) => (
                <tr key={submission.id}>
                  <td>{submission.family_name}</td>
                  <td>{submission.child_name}</td>
                  <td>{submission.image_numbers}</td>
                  <td aria-label="Passwort verborgen">********</td>
                  <td>{new Date(submission.created_at).toLocaleString("de-DE")}</td>
                </tr>
              ))}
              {submissions.length === 0 ? (
                <tr>
                  <td colSpan={5}>Noch keine Einreichungen vorhanden.</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
