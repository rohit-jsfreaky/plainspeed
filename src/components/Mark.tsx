/** The Plainspeed mark: a gauge, its needle pointing to fast. */
export function Mark({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <rect width="24" height="24" rx="6" fill="var(--ink)" />
      <path d="M6 15.5a6 6 0 1 1 12 0" fill="none" stroke="var(--blue)" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M12 15.5l3.2-4.2" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}
