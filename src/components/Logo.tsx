/** The approved Namu logo (namu-brand-design/assets/logo): the Blossom arc with its Sahel dot and the
 *  "namu" wordmark, Sahel fading into ink. Ink follows currentColor so it also works on dark grounds. */
export function Logo({ className, id = "lg" }: { className?: string; id?: string }) {
  return (
    <svg className={className} viewBox="12 14 218 104" role="img" aria-label="Namu">
      <defs>
        <linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#E8935A" /><stop offset="22%" stopColor="currentColor" /><stop offset="100%" stopColor="currentColor" />
        </linearGradient>
      </defs>
      <path d="M 104 65 A 44 44 0 1 0 60 109" stroke="currentColor" strokeWidth="5" strokeLinecap="round" fill="none" />
      <circle cx="60" cy="109" r="6.5" fill="#E8935A" />
      <text x="76" y="99" fontFamily="Georgia, 'Times New Roman', serif" fontSize="40" fill={`url(#${id})`} letterSpacing="2" dominantBaseline="central">namu</text>
    </svg>
  );
}

/** The Blossom alone, for small marks. */
export function Blossom({ className, size = 24 }: { className?: string; size?: number }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 120 120" aria-hidden="true">
      <path d="M 104 60 A 44 44 0 1 0 60 104" stroke="currentColor" strokeWidth="9" strokeLinecap="round" fill="none" />
      <circle cx="60" cy="104" r="11" fill="#E8935A" />
    </svg>
  );
}
