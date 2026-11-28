import { profile } from '../data/content'
import { useViewer } from '../lib/viewer'

const YEAR = new Date().getFullYear()

export function Footer() {
  const { name } = useViewer()

  return (
    <footer className="mx-auto max-w-[52rem] px-5 pb-10 sm:px-8">
      <div className="label flex flex-wrap items-center justify-between gap-4 border-t border-ink/15 pt-6">
        <p>
          © {YEAR} {profile.name} · Made in Bohol
          {name ? ` · Thanks for reading, ${name}` : ''}
        </p>
        <a href="#top" className="transition-colors hover:text-ink">
          Back to top ↑
        </a>
      </div>
    </footer>
  )
}
