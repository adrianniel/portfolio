import { profile } from '../data/content'
import { useViewer } from '../lib/viewer'

const YEAR = new Date().getFullYear()

export function Footer() {
  const { name } = useViewer()

  return (
    <footer className="label mt-28 flex max-w-[46rem] flex-wrap items-center justify-between gap-4 border-t border-ink/15 pt-6">
      <p>
        © {YEAR} {profile.name} · Made in Bohol
        {name ? ` · Thanks for reading, ${name}` : ''}
      </p>
      <button
        type="button"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="transition-colors hover:text-ink"
      >
        Back to top ↑
      </button>
    </footer>
  )
}
