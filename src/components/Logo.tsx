export default function Logo({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 64 64" aria-hidden="true" focusable="false">
      <rect width="64" height="64" rx="14" fill="#4f46e5" />
      <path d="M14 20h6l4 20h22l4-14H24" fill="none" stroke="#fff" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="28" cy="48" r="3.5" fill="#fff" />
      <circle cx="44" cy="48" r="3.5" fill="#fff" />
    </svg>
  )
}
