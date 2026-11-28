import { profile } from '../data/content'
import { useViewer } from '../lib/viewer'
import { NameField } from './NameField'
import { Reveal } from './Reveal'
import { SwarmImage } from './SwarmImage'

const TOUR = [
  { n: '01', label: 'About', href: '#about' },
  { n: '02', label: 'Work', href: '#work' },
  { n: '03', label: 'Certificates', href: '#certificates' },
  { n: '04', label: 'Contact', href: '#contact' },
]

export function Hero() {
  const { greeting, name } = useViewer()

  return (
    <section id="top" aria-labelledby="greeting" className="pt-16 sm:pt-24">
      <div className="grid gap-10 sm:grid-cols-[1fr_13rem] sm:items-end sm:gap-12">
        <div>
          <p className="label mb-6">00 — {name ? `A tour for ${name}` : 'A short tour'}</p>
          {/* key re-runs the reveal when the name changes */}
          <Reveal
            key={greeting}
            as="h1"
            id="greeting"
            stagger={70}
            className="font-display text-[clamp(2.75rem,9vw,5.25rem)] leading-[0.95] tracking-[-0.02em] text-balance"
          >
            {greeting}
          </Reveal>
          <Reveal delay={250} className="mt-8 max-w-[34rem] text-lg leading-relaxed text-ink-soft text-pretty">
            I'm Niel, a full-stack developer from Bohol, Philippines. I build software that real people use
            every day: a queue for a campus, surveys for farmers, a till for a pharmacy.
          </Reveal>
        </div>

        <figure className="mx-auto w-48 sm:w-full">
          <SwarmImage
            image="niel"
            alt="Portrait of Niel Adrian Garig, smiling, in a dark sweater"
            sizes="(min-width: 640px) 13rem, 12rem"
            priority
            duration={1800}
            aspect="4 / 5"
            imgClassName="object-[50%_18%]"
            className="rounded-[3px]"
          />
          <figcaption className="label mt-3 flex items-center gap-2">
            <span className="relative flex size-2" aria-hidden="true">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-ink opacity-40 motion-reduce:hidden" />
              <span className="relative inline-flex size-2 rounded-full bg-ink" />
            </span>
            {profile.status}
          </figcaption>
        </figure>
      </div>

      <div className="mt-12">
        <NameField />
      </div>

      <nav aria-label="Tour" className="mt-14">
        <ol className="grid grid-cols-2 border-t border-ink/15 sm:grid-cols-4">
          {TOUR.map((stop) => (
            <li key={stop.href} className="border-b border-ink/15 sm:border-b-0">
              <a
                href={stop.href}
                className="group flex items-baseline gap-3 py-4 pr-4 transition-colors hover:text-ink"
              >
                <span className="label">{stop.n}</span>
                <span className="relative">
                  {stop.label}
                  <span className="absolute -bottom-0.5 left-0 h-px w-0 bg-ink transition-[width] duration-500 ease-out-expo group-hover:w-full" />
                </span>
              </a>
            </li>
          ))}
        </ol>
      </nav>
    </section>
  )
}
