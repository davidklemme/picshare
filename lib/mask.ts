// The admin tables deliberately don't show e-mail addresses (a screenshot of
// /admin shouldn't be a harvestable parent mailing list). For the password
// reset an admin still has to match a caller to a row, so parent accounts show
// a masked address: enough to confirm "yes, that's you", not enough to write to.
export function maskEmail(email: string): string {
  const at = email.lastIndexOf("@");
  if (at <= 0) {
    return "…";
  }

  const local = email.slice(0, at);
  const domain = email.slice(at);
  return `${local.slice(0, 2)}…${domain}`;
}
