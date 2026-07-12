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

        <p className="intro">
          Noch keinen Account? <Link href="/signup">Jetzt registrieren</Link>
        </p>
      </section>
    </main>
  );
}
