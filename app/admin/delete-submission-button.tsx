"use client";

import { deleteSubmission } from "./delete-submission-action";

export default function DeleteSubmissionButton({ id, familyName }: { id: number; familyName: string }) {
  return (
    <form
      action={deleteSubmission}
      onSubmit={(event) => {
        if (!confirm(`Einreichung von "${familyName}" wirklich löschen?`)) {
          event.preventDefault();
        }
      }}
    >
      <input name="id" type="hidden" value={id} />
      <button className="secondary-button" type="submit">
        Löschen
      </button>
    </form>
  );
}
