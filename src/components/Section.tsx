import type { ReactNode } from 'react'
import { Reveal } from './Reveal'

type Props = {
  id: string
  number: string
  kicker: string
  title: string
  children: ReactNode
}

/** A numbered stop on the tour, with a hairline rule above it. */
export function Section({ id, number, kicker, title, children }: Props) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="mt-28 scroll-mt-8 border-t border-ink/15 pt-10 sm:mt-36">
      <p className="label mb-8 flex justify-between">
        <span>{number}</span>
        <span>{kicker}</span>
      </p>
      <Reveal
        key={title}
        as="h2"
        id={`${id}-title`}
        stagger={45}
        className="font-display mb-12 max-w-[36rem] text-[clamp(2rem,5.5vw,3.25rem)] leading-[1.02] tracking-[-0.015em] text-balance"
      >
        {title}
      </Reveal>
      {children}
    </section>
  )
}
