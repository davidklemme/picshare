"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";

export default function SignUpForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [accessCode, setAccessCode] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Das Passwort muss mindestens 8 Zeichen lang sein.");
      return;
    }
    if (password !== passwordConfirm) {
      setError("Die Passwörter stimmen nicht überein.");
      return;
    }

    setPending(true);
    const response = await fetch("/api/parent-signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, accessCode }),
    });
    setPending(false);

    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      setError(body.message ?? "Registrierung fehlgeschlagen.");
      return;
    }

    const { error: signInError } = await authClient.signIn.email({ email, password });
    if (signInError) {
      setError("Account erstellt, Anmeldung fehlgeschlagen. Bitte melde dich manuell an.");
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <form className="form" onSubmit={handleSubmit}>
      <label>
        Zugangscode
        <input
          name="accessCode"
          onChange={(event) => setAccessCode(event.target.value)}
          placeholder="vom EVT erhalten"
          required
          type="text"
          value={accessCode}
        />
      </label>

      <label>
        E-Mail
        <input
          autoComplete="email"
          name="email"
          onChange={(event) => setEmail(event.target.value)}
          required
          type="email"
          value={email}
        />
      </label>

      <label>
        Passwort
        <input
          autoComplete="new-password"
          minLength={8}
          name="password"
          onChange={(event) => setPassword(event.target.value)}
          required
          type="password"
          value={password}
        />
      </label>

      <label>
        Passwort bestätigen
        <input
          autoComplete="new-password"
          minLength={8}
          name="passwordConfirm"
          onChange={(event) => setPasswordConfirm(event.target.value)}
          required
          type="password"
          value={passwordConfirm}
        />
      </label>

      {error ? <p className="error-message">{error}</p> : null}

      <button className="primary-button" disabled={pending} type="submit">
        {pending ? "Wird registriert ..." : "Registrieren"}
      </button>
    </form>
  );
}
