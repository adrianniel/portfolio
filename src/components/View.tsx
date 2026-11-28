import type { ReactNode } from 'react'
import { Reveal } from './Reveal'

type Props = {
  number: string
  kicker: string
  title: string
  /** Where the tour goes after this view. */
  next?: { label: string; href: string }
  /** What Pip says on the title. */
  say?: string
  children: ReactNode
}

/** One stop on the tour: a numbered label, a big title, the content, then the next stop. */
export function View({ number, kicker, title, next, say, children }: Props) {
  return (
    <article aria-labelledby="view-title">
      <p className="mb-8 flex items-end justify-between">
        <span className="font-dot text-3xl leading-none font-black">{number}</span>
        <span className="label">{kicker}</span>
      </p>
      <Reveal
        key={title}
        as="h1"
        id="view-title"
        say={say}
        stagger={45}
        className="font-display mb-12 max-w-[36rem] text-[clamp(2.25rem,6vw,3.5rem)] leading-[1.02] tracking-[-0.015em] text-balance"
      >
        {title}
      </Reveal>
      {children}
      {next && (
        <a href={next.href} className="group mt-28 flex items-end justify-between gap-6">
          <span className="label">Next stop</span>
          <span
            data-say={`Next up: ${next.label}. Follow me!`}
            data-perch="text"
            className="font-display text-[clamp(1.75rem,4vw,2.5rem)] leading-none"
          >
            {next.label}{' '}
            <span aria-hidden="true" className="inline-block transition-transform duration-500 ease-out-expo group-hover:translate-x-1.5">
              →
            </span>
          </span>
        </a>
      )}
    </article>
  )
}
