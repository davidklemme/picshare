export default function SuccessCheck({ small = false }: { small?: boolean }) {
  const size = small ? 16 : 22;
  return (
    <svg
      className={small ? "success-check success-check--small" : "success-check"}
      fill="none"
      height={size}
      viewBox="0 0 24 24"
      width={size}
    >
      <circle cx="12" cy="12" r="10" strokeWidth="2" />
      <path d="M7.5 12.5l3 3 6-6.5" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
    </svg>
  );
}
