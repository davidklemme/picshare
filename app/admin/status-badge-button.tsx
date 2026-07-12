"use client";

import { SubmissionStatus } from "@/lib/db";
import { toggleSubmissionStatus } from "./toggle-status-action";

export default function StatusBadgeButton({ id, status }: { id: number; status: SubmissionStatus }) {
  const nextStatus: SubmissionStatus = status === "pending" ? "reviewed" : "pending";

  return (
    <form action={toggleSubmissionStatus}>
      <input name="id" type="hidden" value={id} />
      <input name="nextStatus" type="hidden" value={nextStatus} />
      <button
        className={status === "reviewed" ? "status-badge status-badge--reviewed" : "status-badge status-badge--pending"}
        title={status === "pending" ? "Als geprüft markieren" : "Als ausstehend markieren"}
        type="submit"
      >
        {status === "reviewed" ? "Geprüft" : "Ausstehend"}
      </button>
    </form>
  );
}
