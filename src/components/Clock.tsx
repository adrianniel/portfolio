import { useSyncExternalStore } from 'react'

const fmt = (tz: string) =>
  new Intl.DateTimeFormat('en-US', { timeZone: tz, hour: 'numeric', minute: '2-digit' })

// One shared ticking clock for every <Clock>, refreshed every 20 seconds.
let now: Date | null = null
const getNow = () => (now ??= new Date())
function subscribe(listener: () => void) {
  const id = window.setInterval(() => {
    now = new Date()
    listener()
  }, 20_000)
  return () => window.clearInterval(id)
}

/** Live local time in a time zone. Empty in the prerendered HTML. */
export function Clock({ timeZone, className = '' }: { timeZone: string; className?: string }) {
  const date = useSyncExternalStore(subscribe, getNow, () => null)

  return (
    <time dateTime={date?.toISOString()} className={`inline-block min-w-[7ch] ${className}`}>
      {date ? fmt(timeZone).format(date) : ' '}
    </time>
  )
}
