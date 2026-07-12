export default function EmptySubmissions() {
  return (
    <div className="empty-state">
      <svg fill="none" height="56" viewBox="0 0 64 64" width="56">
        <rect height="40" rx="6" stroke="currentColor" strokeWidth="2" width="48" x="8" y="14" />
        <path d="M8 40l12-12 10 9 8-7 18 15" stroke="currentColor" strokeLinejoin="round" strokeWidth="2" />
        <circle cx="22" cy="24" fill="currentColor" r="3" />
      </svg>
      <p>
        Noch keine Einreichungen. Sobald die ersten Familien ihre Auswahl abschicken, erscheinen sie
        hier.
      </p>
    </div>
  );
}
