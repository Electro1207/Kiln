export function Mark({ className = "size-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden>
      <rect width="32" height="32" rx="8" className="fill-accent" />
      <path d="M9 25V12a7 7 0 0 1 14 0v13" fill="none" strokeWidth="3" className="stroke-on-accent" />
      <path d="M13 25v-6h6v6" className="fill-on-accent" />
    </svg>
  );
}
