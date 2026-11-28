import { projects } from '../data/content'
import { to } from '../lib/router'
import { useViewer } from '../lib/viewer'
import { NameField } from './NameField'
import { Reveal } from './Reveal'
import { SwarmImage } from './SwarmImage'

export function Home() {
  const { greeting, name } = useViewer()
  const live = projects.filter((p) => p.status === 'Live').length

  return (
    <article aria-labelledby="greeting">
      {/* On phones the sidebar is folded away, so the name gets its big moment here. */}
      <p aria-hidden="true" className="font-dot mb-10 text-[clamp(3.25rem,17vw,5rem)] leading-[0.9] font-black tracking-[-0.02em] lg:hidden">
        Niel
        <br />
        Adrian
      </p>
      <div className="grid gap-10 sm:grid-cols-[1fr_12rem] sm:items-end sm:gap-12">
        <div>
          <p className="label mb-6">00 — {name ? `A tour for ${name}` : 'A short tour'}</p>
          {/* key re-runs the reveal when the name changes */}
          <Reveal
            key={greeting}
            as="h1"
            id="greeting"
            stagger={70}
            className="font-display text-[clamp(2.75rem,8vw,5rem)] leading-[0.95] tracking-[-0.02em] text-balance"
          >
            {greeting}
          </Reveal>
          <Reveal delay={250} className="mt-8 max-w-[32rem] text-lg leading-relaxed text-ink-soft text-pretty">
            I'm Niel, a full-stack developer from Bohol, Philippines. I build software that real people use
            every day: a queue for a campus, surveys for farmers, a till for a pharmacy.
          </Reveal>
          <div className="mt-10">
            <NameField />
          </div>
        </div>

        <SwarmImage
          image="niel"
          alt="Portrait of Niel Adrian Garig, smiling, in a dark sweater"
          sizes="(min-width: 640px) 12rem, 11rem"
          priority
          duration={1800}
          aspect="4 / 5"
          imgClassName="object-[50%_18%]"
          className="mx-auto w-44 rounded-[3px] sm:w-full"
        />
      </div>

      <dl className="mt-16 grid grid-cols-3 border-y border-ink/15 py-6">
        <div>
          <dt className="label">Projects</dt>
          <dd className="font-dot mt-2 text-4xl leading-none font-black">{projects.length}</dd>
        </div>
        <div>
          <dt className="label">Live</dt>
          <dd className="font-dot mt-2 text-4xl leading-none font-black">{live}</dd>
        </div>
        <div>
          <dt className="label">Based in</dt>
          <dd className="font-dot mt-2 text-4xl leading-none font-black">Bohol</dd>
        </div>
      </dl>

      <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3">
        <a
          href={to({ name: 'about' })}
          className="group inline-flex items-center gap-2 rounded-full border border-ink px-5 py-3 text-[0.95rem] font-medium transition-colors hover:bg-ink hover:text-cream"
        >
          {name ? `Start your tour, ${name}` : 'Start the tour'}
          <span aria-hidden="true" className="transition-transform duration-500 ease-out-expo group-hover:translate-x-1">
            →
          </span>
        </a>
        <a href={to({ name: 'work' })} className="text-[0.95rem] underline decoration-ink/30 underline-offset-4 hover:decoration-ink">
          or skip to the work
        </a>
      </div>
    </article>
  )
}
