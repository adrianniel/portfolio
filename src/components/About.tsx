import { profile, stack } from '../data/content'
import { useViewer } from '../lib/viewer'
import { Reveal } from './Reveal'
import { Section } from './Section'

export function About() {
  const { say } = useViewer()

  return (
    <Section id="about" number="01" kicker="About" title={say('A little about me, {name}.')}>
      <div className="grid gap-12 sm:grid-cols-[1fr_14rem]">
        <div className="space-y-6 text-lg leading-relaxed text-pretty">
          <Reveal>
            I'm a computer science student at BISU and a developer at {profile.lab}, where we build software
            for the people around us in Bohol.
          </Reveal>
          <Reveal className="text-ink-soft">
            I like the whole stack: React and Next.js on the web, Expo and React Native on phones, Tauri on the
            desktop, and Node.js with Express, NestJS and Prisma behind them. Most of what I ship is used by
            people who just want their day to go a little smoother.
          </Reveal>
          <Reveal className="text-ink-soft">
            Right now I'm building iQueue, so students can stop standing in line at campus offices.
          </Reveal>
        </div>

        <dl className="space-y-5">
          {stack.map((g) => (
            <div key={g.group}>
              <dt className="label mb-1.5">{g.group}</dt>
              <dd className="text-[0.95rem] leading-snug">{g.items.join(' · ')}</dd>
            </div>
          ))}
        </dl>
      </div>
    </Section>
  )
}
