import { useRef, useState } from 'react'
import type { PointerEvent } from 'react'
import { projects } from '../data/content'
import type { Project } from '../data/content'
import { to } from '../lib/router'
import { Reveal } from './Reveal'
import { SwarmImage } from './SwarmImage'
import { View } from './View'

const pad = (n: number) => String(n).padStart(2, '0')
const host = (href: string) => new URL(href).hostname.replace(/^www\./, '')

function StatusDot({ project }: { project: Project }) {
  return (
    <span
      aria-hidden="true"
      className={`inline-block size-1.5 shrink-0 rounded-full ${project.status === 'Live' ? 'bg-ink' : 'border border-ink'}`}
    />
  )
}

const PEEK_WIDTH = 288

/** The index: one row per project, with a short note that follows the pointer. */
function WorkList() {
  const [hovered, setHovered] = useState<string | null>(null)
  // Keeps the last project's text while the card fades out.
  const [last, setLast] = useState(0)
  const peek = useRef<HTMLDivElement>(null)

  const follow = (e: PointerEvent) => {
    if (!peek.current) return
    // Sit to the right of the pointer, or flip to the left near the edge.
    const right = e.clientX + 28 + PEEK_WIDTH < window.innerWidth - 16
    const x = right ? e.clientX + 28 : e.clientX - 28 - PEEK_WIDTH
    peek.current.style.transform = `translate3d(${x}px, ${e.clientY - 36}px, 0)`
  }
  const shown = projects[last]

  return (
    <View
      number="02"
      kicker="Selected work"
      title="Things I have built."
      say="Everything Niel has built. Pick one!"
      next={{ label: 'Certificates', href: to({ name: 'certificates' }) }}
    >
      <ol className="border-t border-ink/15" onPointerMove={follow} onPointerLeave={() => setHovered(null)}>
        {projects.map((project, i) => (
          <li key={project.slug} className="border-b border-ink/15">
            <a
              href={to({ name: 'project', slug: project.slug })}
              onPointerEnter={() => {
                setHovered(project.slug)
                setLast(i)
              }}
              className="group grid grid-cols-[2.25rem_minmax(0,1fr)_auto] items-center gap-x-4 py-6 sm:gap-x-6 sm:py-7"
            >
              <span className="font-dot text-xl leading-none font-black">{pad(i + 1)}</span>
              <span>
                <span
                  data-say={project.guide}
                  data-perch="text"
                  className="font-display block text-[clamp(1.6rem,4.2vw,2.3rem)] leading-none tracking-[-0.01em] transition-transform duration-500 ease-out-expo group-hover:translate-x-1.5">
                  {project.name}
                </span>
                <span className="mt-2.5 flex items-center gap-2 text-sm text-ink-soft">
                  <StatusDot project={project} />
                  <span className="truncate">
                    {project.status} · {project.year} · {project.kind}
                  </span>
                </span>
                {/* Touch screens cannot hover, so the short note sits in the row. */}
                <span className="mt-2.5 hidden max-w-[30rem] text-[0.95rem] leading-snug text-pretty no-hover:block">
                  {project.short}
                </span>
              </span>
              <span
                aria-hidden="true"
                className="hidden font-mono text-sm transition-transform duration-500 ease-out-expo group-hover:translate-x-1 can-hover:inline"
              >
                →
              </span>
            </a>
          </li>
        ))}
      </ol>
      <p data-say="Hover a row to peek inside." data-perch="text" className="label mt-5 hidden can-hover:block">
        Hover to peek · click to open
      </p>

      <div
        ref={peek}
        aria-hidden="true"
        className="pointer-events-none fixed top-0 left-0 z-30 hidden transition-transform duration-300 ease-out-expo can-hover:block motion-reduce:transition-none"
      >
        <div
          style={{ width: PEEK_WIDTH }}
          className={`rounded-[4px] border border-ink bg-cream px-4 pt-3 pb-3.5 shadow-[0_18px_40px_-24px_rgb(22_19_15/0.55)] transition-[opacity,scale] duration-300 ease-out-expo ${
            hovered ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
          }`}
        >
          <p className="label flex items-center justify-between gap-3">
            <span>
              {pad(last + 1)} · {shown.kind}
            </span>
            <span className="flex items-center gap-1.5">
              <StatusDot project={shown} />
              {shown.year}
            </span>
          </p>
          <p key={shown.slug} className="peek-in mt-2.5 text-[0.95rem] leading-snug text-pretty">
            {shown.short}
          </p>
          <p className="label mt-3 truncate">{shown.stack.slice(0, 3).join(' · ')}</p>
        </div>
      </div>
    </View>
  )
}

/** One project on its own page. */
function ProjectView({ slug }: { slug: string }) {
  const index = projects.findIndex((p) => p.slug === slug)

  if (index < 0) {
    return (
      <View number="02" kicker="Work" title="That project is not here.">
        <a href={to({ name: 'work' })} className="underline decoration-ink/30 underline-offset-4 hover:decoration-ink">
          See all work →
        </a>
      </View>
    )
  }

  const project = projects[index]
  const following = projects[index + 1]
  const primary = project.links[0]

  const preview = (
    <SwarmImage
      key={project.slug}
      image={project.image}
      alt={`Preview of ${project.name}`}
      sizes="(min-width: 1024px) 46rem, calc(100vw - 2.5rem)"
      priority
      say={primary ? 'Click the picture to open it live.' : 'Not public yet. Ask Niel for a demo!'}
      className="rounded-[3px] ring-1 ring-ink/15"
      imgClassName="transition-transform duration-[1.2s] ease-out-expo group-hover:scale-[1.025]"
    />
  )

  return (
    <>
      <a
        href={to({ name: 'work' })}
        className="label group mb-10 inline-flex items-center gap-2 transition-colors hover:text-ink"
      >
        <span aria-hidden="true" className="transition-transform duration-500 ease-out-expo group-hover:-translate-x-1">
          ←
        </span>
        All work
      </a>
      <View
        number={pad(index + 1)}
        kicker={project.kind}
        title={project.name}
        say={project.guide}
        next={
          following
            ? { label: following.name, href: to({ name: 'project', slug: following.slug }) }
            : { label: 'Certificates', href: to({ name: 'certificates' }) }
        }
      >
        <p className="label -mt-6 mb-10 flex items-center gap-2">
          <StatusDot project={project} />
          {project.status} · {project.year}
        </p>

        {primary ? (
          <a
            href={primary.href}
            target="_blank"
            rel="noopener"
            aria-label={`Open ${project.name} (${host(primary.href)}, opens in a new tab)`}
            className="group block"
          >
            {preview}
          </a>
        ) : (
          preview
        )}

        <div className="mt-10 grid gap-8 sm:grid-cols-[1fr_14rem] sm:gap-12">
          <div>
            <Reveal className="text-lg leading-relaxed text-pretty">{project.summary}</Reveal>
            <Reveal className="mt-5 leading-relaxed text-ink-soft italic text-pretty">{project.note}</Reveal>
          </div>

          <div className="space-y-6">
            <div data-say="Built with all of this." data-perch="text">
              <p className="label mb-1.5">Built with</p>
              <p className="text-[0.95rem] leading-snug">{project.stack.join(' · ')}</p>
            </div>
            <div>
              <p className="label mb-1.5">Links</p>
              {project.links.length > 0 ? (
                <ul className="space-y-1.5">
                  {project.links.map((link) => (
                    <li key={link.href}>
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener"
                        className="inline-flex items-baseline gap-1.5 underline decoration-ink/30 decoration-1 underline-offset-4 transition-colors hover:decoration-ink"
                      >
                        {link.label}
                        <span aria-hidden="true" className="font-mono text-xs">
                          ↗
                        </span>
                        <span className="sr-only">(opens in a new tab)</span>
                      </a>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-[0.95rem] text-ink-soft">Not public yet. Ask me for a demo.</p>
              )}
            </div>
          </div>
        </div>
      </View>
    </>
  )
}

export function Work({ slug }: { slug?: string }) {
  return slug ? <ProjectView slug={slug} /> : <WorkList />
}
