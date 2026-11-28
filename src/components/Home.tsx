import { projects } from '../data/content'
import { to } from '../lib/router'
import { Reveal } from './Reveal'
import { SwarmImage } from './SwarmImage'

export function Home() {
  const live = projects.filter((p) => p.status === 'Live').length

  return (
    <article aria-labelledby="home-title">
      <div className="grid gap-10 sm:grid-cols-[1fr_12rem] sm:items-end sm:gap-12">
        <div>
          <p className="label mb-6">00 — Full-stack developer · Bohol, PH</p>
          <h1
            id="home-title"
            data-say="This is Niel's place. Have a look around!"
            data-perch="text"
            className="font-dot text-[clamp(3.4rem,10vw,6.25rem)] leading-[0.88] font-black tracking-[-0.03em]"
          >
            Niel <span className="sm:block xl:inline">Adrian</span>
          </h1>
          <Reveal
            as="p"
            delay={150}
            stagger={50}
            className="font-display mt-8 max-w-[30rem] text-[clamp(1.6rem,3.6vw,2.25rem)] leading-[1.05] tracking-[-0.01em] text-balance"
          >
            I build software people use every day.
          </Reveal>
          <Reveal delay={450} className="mt-6 max-w-[32rem] text-lg leading-relaxed text-ink-soft text-pretty">
            A queue for a campus, surveys for farmers, a till for a pharmacy: what I make ends up in real
            hands, here in Bohol, Philippines.
          </Reveal>
        </div>

        <SwarmImage
          image="niel"
          alt="Niel Adrian Garig, smiling, in a dark sweater"
          sizes="(min-width: 640px) 12rem, 11rem"
          priority
          duration={1800}
          aspect="3 / 4"
          say="That's Niel. He built everything here."
          // A cut-out: no box, head to chest, fading out towards the bottom.
          imgClassName="object-cover object-top [mask-image:linear-gradient(to_bottom,black_72%,transparent)]"
          className="mx-auto w-48 sm:w-full"
        />
      </div>

      <dl
        data-say={`${projects.length} projects, ${live} of them live!`}
        className="mt-16 grid grid-cols-3 border-y border-ink/15 py-6"
      >
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
          data-say="Click here and follow me!"
          data-perch="center"
          className="group inline-flex items-center gap-2 rounded-full border border-ink px-5 py-3 text-[0.95rem] font-medium transition-colors hover:bg-ink hover:text-cream"
        >
          Start the tour
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
