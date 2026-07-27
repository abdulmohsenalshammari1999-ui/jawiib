export function IrisMark({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <polygon
        points="21,12 16.5,19.79 7.5,19.79 3,12 7.5,4.21 16.5,4.21"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.1"
      />
      <polygon
        points="16.5,12 14.25,15.9 9.75,15.9 7.5,12 9.75,8.1 14.25,8.1"
        fill="none"
        stroke="currentColor"
        strokeWidth="0.6"
        opacity="0.55"
      />
      <circle cx="12" cy="12" r="1.15" fill="currentColor" />
    </svg>
  )
}
