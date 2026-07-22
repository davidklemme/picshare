import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getAdminUsers, getParentUsers, getPhotoSubmissions } from "@/lib/db";
import { maskEmail } from "@/lib/mask";
import LogoutButton from "../logout-button";
import DeleteSubmissionButton from "./delete-submission-button";
import EmptySubmissions from "./empty-submissions";
import ResetPasswordButton from "./reset-password-button";
import StatusBadgeButton from "./status-badge-button";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || session.user.role !== "admin") {
    redirect("/signin");
  }

  const [submissions, adminUsers, parentUsers] = await Promise.all([
    getPhotoSubmissions(),
    getAdminUsers(),
    getParentUsers(),
  ]);

  return (
    <main className="page-shell admin-shell">
      <section className="card wide-card">
        <div className="admin-header">
          <div>
            <p className="eyebrow">Admin</p>
            <h1>
              Admin-<em>Nutzer</em>
            </h1>
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
                <th></th>
              </tr>
            </thead>
            <tbody>
              {adminUsers.map((user) => (
                <tr key={user.id}>
                  <td>{user.name}</td>
                  <td>{user.role}</td>
                  <td>{new Date(user.created_at).toLocaleString("de-DE")}</td>
                  <td>
                    {user.id === session.user.id ? null : (
                      <ResetPasswordButton label={user.name} userId={user.id} />
                    )}
                  </td>
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
            <h1>
              Eltern-<em>Konten</em>
            </h1>
            <p className="intro">
              E-Mail-Adressen sind maskiert — genug, um ein anrufendes Elternteil zuzuordnen. Ein
              Zurücksetzen beendet alle Sitzungen des Kontos; das ZIP-Passwort bleibt davon
              unberührt und kann weiterhin nicht wiederhergestellt werden.
            </p>
          </div>
        </div>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>E-Mail</th>
                <th>Registriert</th>
                <th>Einreichung</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {parentUsers.map((user) => (
                <tr key={user.id}>
                  <td>{maskEmail(user.email)}</td>
                  <td>{new Date(user.created_at).toLocaleString("de-DE")}</td>
                  <td>{user.has_submission ? "Ja" : "Nein"}</td>
                  <td>
                    <ResetPasswordButton label={maskEmail(user.email)} userId={user.id} />
                  </td>
                </tr>
              ))}
              {parentUsers.length === 0 ? (
                <tr>
                  <td colSpan={4}>Noch keine Eltern-Konten registriert.</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>

      <section className="card wide-card">
        <div className="admin-header">
          <div>
            <p className="eyebrow">Admin</p>
            <h1>
              Fotoauswahl-<em>Übersicht</em>
            </h1>
            <p className="intro">
              Passwörter und E-Mail-Adressen werden in der Tabelle bewusst nicht angezeigt.
              Telefonnummern sind sichtbar, um Einreichungen mit der Elternliste abzugleichen.
            </p>
          </div>
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
                <th>Status</th>
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
                  <td>
                    <StatusBadgeButton id={submission.id} status={submission.status} />
                  </td>
                  <td>{new Date(submission.created_at).toLocaleString("de-DE")}</td>
                  <td>
                    <DeleteSubmissionButton familyName={submission.family_name} id={submission.id} />
                  </td>
                </tr>
              ))}
              {submissions.length === 0 ? (
                <tr>
                  <td colSpan={8}>
                    <EmptySubmissions />
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
