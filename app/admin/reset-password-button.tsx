"use client";

import { useFormState, useFormStatus } from "react-dom";
import { ResetPasswordState, resetPassword } from "./reset-password-action";

const initialState: ResetPasswordState = { ok: false, message: "" };

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button className="secondary-button" disabled={pending} type="submit">
      {pending ? "Wird zurückgesetzt ..." : "Passwort zurücksetzen"}
    </button>
  );
}

export default function ResetPasswordButton({
  label,
  userId,
}: {
  label: string;
  userId: string;
}) {
  const [state, formAction] = useFormState(resetPassword, initialState);

  return (
    <>
      <form
        action={formAction}
        onSubmit={(event) => {
          if (
            !confirm(
              `Passwort von "${label}" wirklich zurücksetzen? Das bestehende Passwort wird ungültig und alle Sitzungen werden beendet.`,
            )
          ) {
            event.preventDefault();
          }
        }}
      >
        <input name="userId" type="hidden" value={userId} />
        <SubmitButton />
      </form>

      {state.message && !state.ok ? <p className="error-message">{state.message}</p> : null}

      {state.temporaryPassword ? (
        <div className="warning-box">
          <strong>Einmal-Passwort (wird nur jetzt angezeigt):</strong>
          <p>
            <code>{state.temporaryPassword}</code>
          </p>
          <p>{state.message}</p>
        </div>
      ) : null}
    </>
  );
}
