import { useEffect, useRef } from 'react'
import { certificates, profile, projects } from '../data/content'
import { keyOf, sectionOf, to } from '../lib/router'
import type { Route, RouteName } from '../lib/router'
import { Clock } from './Clock'

type Item = { name: Exclude<RouteName, 'project'>; n: string; label: string; count?: number }

const NAV: Item[] = [
  { name: 'home', n: '00', label: 'Home' },
  { name: 'about', n: '01', label: 'About' },
  { name: 'work', n: '02', label: 'Work', count: projects.length },
  { name: 'certificates', n: '03', label: 'Certificates', count: certificates.length },
  { name: 'contact', n: '04', label: 'Contact' },
]

function Status() {
  return (
    <p className="label flex items-center gap-2">
      <span className="relative flex size-2" aria-hidden="true">
        <span className="absolute inline-flex size-full animate-ping rounded-full bg-ink opacity-40 motion-reduce:hidden" />
        <span className="relative inline-flex size-2 rounded-full bg-ink" />
      </span>
      {profile.status}
    </p>
  )
}

function NavList({ active, large = false, onNavigate }: { active: RouteName; large?: boolean; onNavigate?: () => void }) {
  return (
    <ol className={large ? 'space-y-2' : 'space-y-0.5'}>
      {NAV.map((item) => {
        const current = item.name === active
        return (
          <li key={item.name}>
            <a
              href={to({ name: item.name })}
              onClick={onNavigate}
              aria-current={current ? 'page' : undefined}
              className={`group relative flex items-baseline gap-3 transition-colors ${
                large ? 'py-1.5' : 'py-1.5'
              } ${current ? 'text-ink' : 'text-ink-soft hover:text-ink'}`}
            >
              <span
                aria-hidden="true"
                className={`absolute top-1/2 -left-8 h-px bg-ink transition-[width] duration-500 ease-out-expo ${
                  current ? 'w-5' : 'w-0 group-hover:w-2.5'
                } ${large ? 'hidden' : ''}`}
              />
              <span className="label">{item.n}</span>
              <span className={large ? 'font-display text-[2.6rem] leading-none' : 'text-[0.95rem]'}>
                {item.label}
              </span>
              {item.count !== undefined && (
                <span className="label self-start" aria-label={`${item.count} items`}>
                  {item.count}
                </span>
              )}
            </a>
          </li>
        )
      })}
    </ol>
  )
}

export function Sidebar({ route }: { route: Route }) {
  const active = sectionOf(route)
  const drawer = useRef<HTMLDialogElement>(null)
  const close = () => drawer.current?.close()
  const routeKey = keyOf(route)

  // Close the mobile menu whenever the route changes (including back/forward).
  useEffect(() => {
    drawer.current?.close()
  }, [routeKey])

  const hello = active !== 'contact' && (
    <a href={to({ name: 'contact' })} onClick={close} className="btn-ember self-start">
      Say hello
    </a>
  )

  return (
    <>
      {/* Desktop: a quiet column that stays put while the view changes. */}
      <aside
        aria-label="Site"
        className="sticky top-0 hidden h-dvh flex-col border-r border-ink/15 px-8 py-10 lg:flex"
      >
        <a href={to({ name: 'home' })} className="font-dot text-[2.6rem] leading-[0.92] font-black tracking-[-0.02em]">
          <span className="block">Niel</span>
          <span className="block">Adrian</span>
        </a>
        <p className="label mt-4">{profile.role}</p>

        <nav aria-label="Main" className="mt-14">
          <NavList active={active} />
        </nav>

        <div className="mt-auto space-y-5">
          <Status />
          <p className="label">
            Bohol, PH · <Clock timeZone={profile.timeZone} />
          </p>
          <p className="flex gap-4 text-sm">
            <a href={profile.github} target="_blank" rel="noopener" className="underline decoration-ink/30 underline-offset-4 hover:decoration-ink">
              GitHub<span className="sr-only"> (opens in a new tab)</span>
            </a>
            <a href={`mailto:${profile.email}`} className="underline decoration-ink/30 underline-offset-4 hover:decoration-ink">
              Email
            </a>
          </p>
          {hello}
        </div>
      </aside>

      {/* Mobile: a slim bar with a full-screen menu. */}
      <div className="sticky top-0 z-40 flex items-center justify-between border-b border-ink/10 bg-cream/85 px-5 py-3.5 backdrop-blur-md lg:hidden">
        <a href={to({ name: 'home' })} className="font-dot text-[1.4rem] leading-none font-black">
          Niel Adrian
        </a>
        <div className="flex items-center gap-4">
          <span className="label">{NAV.find((i) => i.name === active)?.label}</span>
          <button
            type="button"
            onClick={() => drawer.current?.showModal()}
            className="label rounded-full border border-ink/25 px-3 py-1.5 text-ink transition-colors hover:border-ink"
            aria-haspopup="dialog"
          >
            Menu
          </button>
        </div>
      </div>

      <dialog
        ref={drawer}
        aria-label="Menu"
        className="drawer m-0 h-dvh max-h-none w-full max-w-none bg-cream p-0 text-ink backdrop:bg-ink/40 lg:hidden"
      >
        <div className="grain flex h-full flex-col px-5 py-3.5">
          <div className="flex items-center justify-between">
            <span className="font-dot text-[1.4rem] leading-none font-black">Niel Adrian</span>
            <button
              type="button"
              onClick={close}
              className="label rounded-full border border-ink/25 px-3 py-1.5 text-ink"
              autoFocus
            >
              Close ✕
            </button>
          </div>
          <nav aria-label="Main" className="mt-14">
            <NavList active={active} large onNavigate={close} />
          </nav>
          <div className="mt-auto space-y-4 pb-4">
            <Status />
            <p className="label">
              Bohol, PH · <Clock timeZone={profile.timeZone} />
            </p>
            {hello}
          </div>
        </div>
      </dialog>
    </>
  )
}
