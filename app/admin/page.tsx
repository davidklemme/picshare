import { getPhotoSubmissions } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const submissions = await getPhotoSubmissions();

  return (
    <main className="page-shell admin-shell">
      <section className="card wide-card">
        <div className="admin-header">
          <div>
            <p className="eyebrow">Admin</p>
            <h1>Fotoauswahl-Übersicht</h1>
            <p className="intro">Passwörter werden in der Tabelle bewusst nicht angezeigt.</p>
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
