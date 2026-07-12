"use client";

import { useEffect, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { SubmissionStatus } from "@/lib/db";
import LogoutButton from "./logout-button";
import SuccessCheck from "./success-check";
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
  defaultPhone,
  defaultImageNumbers,
  alreadySubmitted,
  status,
}: {
  defaultFamilyName: string;
  defaultChildName: string;
  defaultPhone: string;
  defaultImageNumbers: string;
  alreadySubmitted: boolean;
  status: SubmissionStatus | null;
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
  const passwordsMatch = !passwordError && Boolean(password) && Boolean(confirmation);

  return (
    <main className="page-shell">
      <section className="card">
        <div className="admin-header">
          <div>
            <p className="eyebrow">Kita-Foto-Auswahlassistent</p>
            <h1>Fotoauswahl einreichen</h1>
          </div>
          <LogoutButton />
        </div>
        <p className="intro">
          Trage deine Kontaktdaten, die gewünschten Bildnummern und ein persönliches ZIP-Passwort ein.
        </p>

        <div className="warning-box">
          <strong>So funktioniert&apos;s:</strong>
          <p>
            Du wählst hier die Bildnummern der gewünschten Fotos deines Kindes aus und vergibst ein
            eigenes ZIP-Passwort. Deine Auswahl und das (verschlüsselt gespeicherte) Passwort werden
            genutzt, um dir später ein passwortgeschütztes ZIP mit genau diesen Fotos bereitzustellen.
            Niemand außer dir kennt dein ZIP-Passwort im Klartext — es wird ausschließlich kurz
            entschlüsselt, um dein persönliches Foto-Paket zu erstellen.
          </p>
        </div>

        {alreadySubmitted && status ? (
          <div className={`status-note status-note--${status}`}>
            {status === "reviewed" ? <SuccessCheck small /> : null}
            <span>
              {status === "reviewed"
                ? "Deine Auswahl wurde geprüft."
                : "Deine Auswahl ist eingegangen und wird schnellstmöglich geprüft."}{" "}
              Ein erneutes Absenden überschreibt deine bisherige Auswahl und dein bisheriges Passwort.
            </span>
          </div>
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
            Telefonnummer
            <input
              defaultValue={defaultPhone}
              name="phone"
              placeholder="z. B. 0151 23456789"
              required
              type="tel"
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
            Möglichkeit, das Passwort zurückzusetzen. Bitte gut merken! Verwende hier bitte ein
            <strong> einmaliges Passwort</strong>, das du sonst nirgendwo nutzt — nicht dein
            E-Mail- oder Online-Banking-Passwort.
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
          {passwordsMatch ? (
            <p className="password-match-hint">
              <SuccessCheck small /> Passwörter stimmen überein
            </p>
          ) : null}
          {state.message ? (
            <p className={state.ok ? "success-message" : "error-message"}>
              {state.ok ? <SuccessCheck /> : null}
              <span>{state.message}</span>
            </p>
          ) : null}

          <SubmitButton disabled={isPasswordInvalid} />
        </form>
      </section>
    </main>
  );
}
