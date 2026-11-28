import { useState } from 'react'
import { profile } from '../data/content'
import { Clock } from './Clock'
import { Reveal } from './Reveal'
import { View } from './View'

export function Contact() {
  const [copied, setCopied] = useState(false)

  const mailto = `mailto:${profile.email}?subject=${encodeURIComponent('Hello, Niel')}`

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(profile.email)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      window.location.href = mailto
    }
  }

  return (
    <View number="04" kicker="Contact" title="Let's build something together.">
      <Reveal className="max-w-[32rem] text-lg leading-relaxed text-ink-soft text-pretty">
        I'm open to internships, freelance work and good conversations about software. Write to me and I'll get
        back to you within a day or two.
      </Reveal>

      <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-4">
        <a href={mailto} className="btn-ember px-6! py-3.5! text-base!">
          Send me an email
          <span aria-hidden="true" className="font-mono text-sm">→</span>
        </a>
        <button
          type="button"
          onClick={copy}
          className="text-sm underline decoration-ink/30 underline-offset-4 transition-colors hover:decoration-ink"
        >
          {copied ? 'Copied to clipboard' : profile.email}
        </button>
        <span role="status" className="sr-only">
          {copied ? 'Email address copied' : ''}
        </span>
      </div>

      <dl className="mt-16 grid gap-6 border-t border-ink/15 pt-6 sm:grid-cols-3">
        <div>
          <dt className="label mb-1">GitHub</dt>
          <dd>
            <a href={profile.github} target="_blank" rel="noopener" className="underline decoration-ink/30 underline-offset-4 hover:decoration-ink">
              @{profile.githubHandle}
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          </dd>
        </div>
        <div>
          <dt className="label mb-1">Based in</dt>
          <dd>{profile.location}</dd>
        </div>
        <div>
          <dt className="label mb-1">Local time</dt>
          <dd>
            <Clock timeZone={profile.timeZone} /> <span className="text-ink-soft">(UTC+8)</span>
          </dd>
        </div>
      </dl>
    </View>
  )
}
