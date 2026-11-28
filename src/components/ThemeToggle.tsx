import { useId } from 'react'
import { toggleTheme, useDark } from '../lib/theme'

/**
 * The sun in the corner. One drawing that morphs: at night the rays fold in,
 * the disc grows, and a shadow slides across it to leave a crescent moon.
 * The look follows <html class="dark"> in CSS, so it is right before React loads.
 */
export function ThemeToggle({ className = '' }: { className?: string }) {
  const dark = useDark()
  const mask = `moon-${useId().replace(/:/g, '')}`

  return (
    <button
      type="button"
      onClick={(e) => {
        const r = e.currentTarget.getBoundingClientRect()
        toggleTheme({ x: r.left + r.width / 2, y: r.top + r.height / 2 })
      }}
      aria-label={dark ? 'Switch to day mode' : 'Switch to night mode'}
      aria-pressed={dark}
      title={dark ? 'Good morning' : 'Good night'}
      className={`theme-toggle grid size-10 place-items-center rounded-full border border-ink/20 text-ink transition-colors hover:border-ink ${className}`}
    >
      <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" className="overflow-visible">
        <mask id={mask}>
          <rect x="-4" y="-4" width="32" height="32" fill="white" />
          <circle className="moon-shadow" cx="25" cy="3" r="6.5" fill="black" />
        </mask>
        <g mask={`url(#${mask})`}>
          <circle className="sun-disc" cx="12" cy="12" r="4.6" fill="currentColor" />
        </g>
        <g className="sun-rays" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
          <path d="M12 2.2v2.3M12 19.5v2.3M2.2 12h2.3M19.5 12h2.3M5.1 5.1l1.6 1.6M17.3 17.3l1.6 1.6M5.1 18.9l1.6-1.6M17.3 6.7l1.6-1.6" />
        </g>
      </svg>
    </button>
  )
}
