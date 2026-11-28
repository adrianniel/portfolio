import { useId, useState } from 'react'
import type { FormEvent } from 'react'
import { useViewer } from '../lib/viewer'

/** Lets the visitor tell the site their name, or change it. */
export function NameField() {
  const { name, setName } = useViewer()
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState('')
  const id = useId()

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (!draft.trim()) return
    setName(draft)
    setDraft('')
    setEditing(false)
  }

  if (name && !editing) {
    return (
      <p className="label">
        Not {name}?{' '}
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="underline decoration-1 underline-offset-4 transition-colors hover:text-ink"
        >
          Change name
        </button>
      </p>
    )
  }

  return (
    <form onSubmit={submit} className="flex max-w-sm flex-wrap items-center gap-x-3 gap-y-2">
      <label htmlFor={id} className="label">
        {name ? 'Your name' : 'What should I call you?'}
      </label>
      <span className="flex flex-1 items-center border-b border-ink/30 transition-colors focus-within:border-ink">
        <input
          id={id}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Your first name"
          autoComplete="given-name"
          maxLength={28}
          className="w-full min-w-0 bg-transparent py-1 text-base placeholder:text-ink-soft/60 focus:outline-none"
        />
        <button type="submit" className="label px-1 py-1 transition-colors hover:text-ink" aria-label="Save name">
          Enter ↵
        </button>
      </span>
    </form>
  )
}
