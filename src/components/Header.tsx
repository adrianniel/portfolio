import { profile } from '../data/content'
import { Clock } from './Clock'

export function Header() {
  return (
    <header className="mx-auto flex max-w-[52rem] items-center justify-between gap-4 px-5 pt-6 sm:px-8 sm:pt-8">
      <a href="#top" className="group flex items-baseline gap-2" aria-label="Niel Adrian, back to top">
        <span className="font-display text-xl leading-none">Niel Adrian</span>
        <span className="label hidden transition-colors group-hover:text-ink sm:inline">/ developer</span>
      </a>

      <div className="flex items-center gap-5">
        <p className="label hidden items-center gap-2 sm:flex">
          <span>Bohol, PH</span>
          <span aria-hidden="true">·</span>
          <Clock timeZone={profile.timeZone} />
        </p>
        <a href="#contact" className="btn-ember">
          Say hello
        </a>
      </div>
    </header>
  )
}
