"use client";

import { useEffect, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { SubmissionState, submitPhotoRequest } from "./actions";

const initialState: SubmissionState = { ok: false, message: "" };

function SubmitButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button className="primary-button" disabled={disabled || pending} type="submit">
      {pending ? "Wird gespeichert ..." : "Auswahl absenden"}
    </button>
  );
}

export default function PhotoRequestForm({
  defaultFamilyName,
  defaultChildName,
  defaultImageNumbers,
  alreadySubmitted,
}: {
  defaultFamilyName: string;
  defaultChildName: string;
  defaultImageNumbers: string;
  alreadySubmitted: boolean;
}) {
  const [state, formAction] = useFormState(submitPhotoRequest, initialState);
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [passwordError, setPasswordError] = useState("");

  useEffect(() => {
    if (!password && !confirmation) {
      setPasswordError("");
    } else if (password.length > 0 && password.length < 6) {
      setPasswordError("Das Passwort muss mindestens 6 Zeichen lang sein.");
    } else if (confirmation && password !== confirmation) {
      setPasswordError("Die Passwörter stimmen nicht überein.");
    } else {
      setPasswordError("");
    }
  }, [password, confirmation]);

  const isPasswordInvalid = Boolean(passwordError) || !password || !confirmation;

  return (
    <main className="page-shell">
      <section className="card">
        <p className="eyebrow">Kita-Foto-Auswahlassistent</p>
        <h1>Fotoauswahl einreichen</h1>
        <p className="intro">
          Trage deine Kontaktdaten, die gewünschten Bildnummern und ein persönliches ZIP-Passwort ein.
        </p>
        {alreadySubmitted ? (
          <p className="intro">
            Du hast bereits eine Auswahl eingereicht. Ein erneutes Absenden überschreibt deine
            bisherige Auswahl und dein bisheriges Passwort.
          </p>
        ) : null}

        <form action={formAction} className="form">
          <label>
            Familienname
            <input
              defaultValue={defaultFamilyName}
              name="familyName"
              placeholder="z. B. Müller"
              required
              type="text"
            />
          </label>

          <label>
            Vorname des Kindes
            <input
              defaultValue={defaultChildName}
              name="childName"
              placeholder="z. B. Sarah"
              required
              type="text"
            />
          </label>

          <label>
            Bildnummern
            <textarea
              defaultValue={defaultImageNumbers}
              name="imageNumbers"
              placeholder="z. B. 102, 115, 208"
              required
              rows={4}
            />
          </label>

          <div className="warning-box">
            <strong>Wichtig:</strong> Dieses Passwort schützt dein späteres Foto-Paket. Es gibt keine
            Möglichkeit, das Passwort zurückzusetzen. Bitte gut merken!
          </div>

          <label>
            Dein ZIP-Passwort
            <input
              minLength={6}
              name="zipPassword"
              onChange={(event) => setPassword(event.target.value)}
              required
              type="password"
              value={password}
            />
          </label>

          <label>
            Passwort bestätigen
            <input
              minLength={6}
              name="zipPasswordConfirm"
              onChange={(event) => setConfirmation(event.target.value)}
              required
              type="password"
              value={confirmation}
            />
          </label>

          {passwordError ? <p className="error-message">{passwordError}</p> : null}
          {state.message ? (
            <p className={state.ok ? "success-message" : "error-message"}>{state.message}</p>
          ) : null}

          <SubmitButton disabled={isPasswordInvalid} />
        </form>
      </section>
    </main>
  );
}
