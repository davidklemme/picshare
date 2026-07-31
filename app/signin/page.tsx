import Link from "next/link";
import SignInForm from "./sign-in-form";

export default function SignInPage() {
  return (
    <main className="page-shell">
      <section className="card">
        <p className="eyebrow">Kita-Foto-Auswahlassistent</p>
        <h1>Anmelden</h1>
        <p className="intro">Melde dich mit deinem Account an, um deine Fotoauswahl einzureichen.</p>

        <SignInForm />

        <div className="signup-cta">
          <p>Noch keinen Account?</p>
          <Link href="/signup" className="secondary-button">
            Jetzt registrieren
          </Link>
        </div>
      </section>
    </main>
  );
}
