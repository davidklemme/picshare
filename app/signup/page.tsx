import Link from "next/link";
import SignUpForm from "./sign-up-form";

export default function SignUpPage() {
  return (
    <main className="page-shell">
      <section className="card">
        <p className="eyebrow">Kita-Foto-Auswahlassistent</p>
        <h1>Registrieren</h1>
        <p className="intro">
          Erstelle einen Account mit dem Zugangscode, den du vom Elternvertreter (EVT) erhalten hast.
        </p>

        <SignUpForm />

        <p className="intro">
          Bereits registriert? <Link href="/signin">Jetzt anmelden</Link>
        </p>
      </section>
    </main>
  );
}
