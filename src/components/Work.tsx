import { projects } from '../data/content'
import type { Project } from '../data/content'
import { useViewer } from '../lib/viewer'
import { Reveal } from './Reveal'
import { Section } from './Section'
import { SwarmImage } from './SwarmImage'

const host = (href: string) => new URL(href).hostname.replace(/^www\./, '')

function ProjectCard({ project, index }: { project: Project; index: number }) {
  const { say } = useViewer()
  const primary = project.links[0]

  const preview = (
    <SwarmImage
      image={project.image}
      alt={`Preview of ${project.name}`}
      sizes="(min-width: 860px) 47rem, calc(100vw - 2.5rem)"
      className="rounded-[3px] ring-1 ring-ink/15"
      imgClassName="transition-transform duration-[1.2s] ease-out-expo group-hover:scale-[1.025]"
    />
  )

  return (
    <article aria-labelledby={`${project.slug}-name`} className="group">
      <p className="label mb-3 flex items-center justify-between gap-4">
        <span>
          {String(index + 1).padStart(2, '0')} / {project.kind}
        </span>
        <span className="flex shrink-0 items-center gap-2 whitespace-nowrap">
          <span
            className={`size-1.5 rounded-full ${project.status === 'Live' ? 'bg-ink' : 'border border-ink'}`}
            aria-hidden="true"
          />
          {project.status} · {project.year}
        </span>
      </p>

      {primary ? (
        <a href={primary.href} target="_blank" rel="noopener" aria-label={`Open ${project.name} (${host(primary.href)})`} className="block">
          {preview}
        </a>
      ) : (
        preview
      )}

      <div className="mt-7 grid gap-6 sm:grid-cols-[1fr_15rem] sm:gap-10">
        <div>
          <h3 id={`${project.slug}-name`} className="font-display text-3xl leading-none tracking-[-0.01em]">
            {project.name}
          </h3>
          <Reveal className="mt-4 leading-relaxed text-ink-soft text-pretty">{project.summary}</Reveal>
          <Reveal key={say(project.note)} className="mt-4 text-[0.95rem] leading-relaxed italic text-pretty">
            {say(project.note)}
          </Reveal>
        </div>

        <div className="space-y-5 sm:pt-1">
          <div>
            <p className="label mb-1.5">Built with</p>
            <p className="text-[0.95rem] leading-snug">{project.stack.join(' · ')}</p>
          </div>
          {project.links.length > 0 && (
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
                    <span aria-hidden="true" className="font-mono text-xs">↗</span>
                    <span className="sr-only">(opens in a new tab)</span>
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </article>
  )
}

export function Work() {
  const { say } = useViewer()

  return (
    <Section id="work" number="02" kicker="Selected work" title={say('Things I have built, {name}.')}>
      <div className="space-y-24 sm:space-y-32">
        {projects.map((project, i) => (
          <ProjectCard key={project.slug} project={project} index={i} />
        ))}
      </div>
    </Section>
  )
}
