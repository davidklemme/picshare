"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";

export default function SignInForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");

    const { error: signInError } = await authClient.signIn.email({ email, password });

    setPending(false);
    if (signInError) {
      setError("E-Mail oder Passwort ist falsch.");
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <form className="form" onSubmit={handleSubmit}>
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
          autoComplete="current-password"
          name="password"
          onChange={(event) => setPassword(event.target.value)}
          required
          type="password"
          value={password}
        />
      </label>

      {error ? <p className="error-message">{error}</p> : null}

      <button className="primary-button" disabled={pending} type="submit">
        {pending ? "Wird angemeldet ..." : "Anmelden"}
      </button>
    </form>
  );
}
