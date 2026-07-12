"use client";

import { useFormState, useFormStatus } from "react-dom";
import { InviteState, inviteAdmin } from "./actions";

const initialState: InviteState = { ok: false, message: "" };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button className="primary-button" disabled={pending} type="submit">
      {pending ? "Wird angelegt ..." : "Admin anlegen"}
    </button>
  );
}

export default function InviteForm() {
  const [state, formAction] = useFormState(inviteAdmin, initialState);

  return (
    <>
      <form action={formAction} className="form">
        <label>
          Name
          <input name="name" placeholder="z. B. Maria Schmidt" type="text" />
        </label>

        <label>
          E-Mail
          <input name="email" required type="email" />
        </label>

        <SubmitButton />
      </form>

      {state.message ? (
        <p className={state.ok ? "success-message" : "error-message"}>{state.message}</p>
      ) : null}

      {state.temporaryPassword ? (
        <div className="warning-box">
          <strong>Einmal-Passwort (wird nur jetzt angezeigt):</strong>
          <p>
            <code>{state.temporaryPassword}</code>
          </p>
        </div>
      ) : null}
    </>
  );
}
