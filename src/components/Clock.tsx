import { useEffect, useState } from 'react'

const fmt = (tz: string) =>
  new Intl.DateTimeFormat('en-US', { timeZone: tz, hour: 'numeric', minute: '2-digit' })

/** Live local time in a time zone, refreshed every 20 seconds. */
export function Clock({ timeZone, className = '' }: { timeZone: string; className?: string }) {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 20_000)
    return () => window.clearInterval(id)
  }, [])

  return (
    <time dateTime={now.toISOString()} className={className}>
      {fmt(timeZone).format(now)}
    </time>
  )
}
