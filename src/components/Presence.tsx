import type { Visitor } from '../lib/presence'
import { useVisitors } from '../lib/presence'
import type { Section } from '../lib/router'

/** FNV-1a: a small stable hash, so each visitor id always draws the same face. */
function hash(text: string) {
  let h = 0x811c9dc5
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
  }
  return h >>> 0
}

// Little dot-matrix faces on a 7×7 grid: [column, row] pairs.
const EYES = [
  [[2, 2], [4, 2]],
  [[1, 2], [5, 2]],
  [[2, 2], [4, 2], [2, 1], [4, 1]],
]
const MOUTHS = [
  [[1, 4], [5, 4], [2, 5], [3, 5], [4, 5]], // smile
  [[2, 5], [3, 5], [4, 5]], // calm
  [[3, 4], [2, 5], [4, 5], [3, 6]], // "o"
  [[1, 5], [2, 5], [3, 5], [4, 5], [5, 4]], // smirk
]

/**
 * A dot-matrix face drawn from the visitor's random id: same face per tab,
 * different faces for different people. No names, no photos.
 */
export function Avatar({ id, size = 22, self = false }: { id: string; size?: number; self?: boolean }) {
  const h = hash(id)
  const dots: number[][] = [...EYES[h % EYES.length], ...MOUTHS[(h >>> 3) % MOUTHS.length]]
  // A fringe of "hair" along the top, mirrored so the face stays balanced.
  for (let x = 1; x <= 3; x++) {
    if ((h >>> (8 + x)) & 1) {
      dots.push([x, 0])
      if (x !== 3) dots.push([6 - x, 0])
    }
  }
  const step = 24 / 7.6
  const pos = (n: number) => 1.6 + step / 2 + n * step

  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true" className="block shrink-0">
      <circle cx="12" cy="12" r="11.25" fill={self ? '#16130f' : '#e9e0cc'} stroke="#f2ebdc" strokeWidth="1.5" />
      <circle cx="12" cy="12" r="10.5" fill="none" stroke="#16130f" strokeOpacity={self ? 0 : 0.18} />
      {dots.map(([x, y]) => (
        <circle key={`${x}-${y}`} cx={pos(x)} cy={pos(y)} r="1.25" fill={self ? '#f2ebdc' : '#16130f'} />
      ))}
    </svg>
  )
}

function Heads({ people, size, max }: { people: Visitor[]; size: number; max: number }) {
  // You first, then everyone else.
  const sorted = [...people].sort((a, b) => Number(b.self) - Number(a.self))
  const shown = sorted.slice(0, max)
  const extra = sorted.length - shown.length
  return (
    <span className="flex items-center">
      <span className="flex -space-x-1">
        {shown.map((v) => (
          <Avatar key={v.id} id={v.id} size={size} self={v.self} />
        ))}
      </span>
      {extra > 0 && <span className="label ml-1.5">+{extra}</span>}
    </span>
  )
}

const sentence = (n: number) => (n <= 1 ? 'Just you here right now' : `${n} people are here right now`)

/** "3 people are here right now", with their faces. Empty until connected. */
export function PresenceSummary({ compact = false }: { compact?: boolean }) {
  const visitors = useVisitors()
  if (!visitors || visitors.length === 0) return null
  const n = visitors.length

  if (compact) {
    return (
      <span className="flex items-center gap-1.5" title={sentence(n)}>
        <Heads people={visitors} size={20} max={3} />
        <span className="sr-only">{sentence(n)}</span>
      </span>
    )
  }

  return (
    <div
      data-perch="text"
      data-say={n > 1 ? `You're not alone. ${n} people are here!` : "It's just you and me here."}
      className="flex items-center gap-2.5"
    >
      <Heads people={visitors} size={26} max={5} />
      <p className="text-[0.8rem] leading-tight text-ink-soft">{sentence(n)}</p>
    </div>
  )
}

/** Small heads beside a nav item for the other people reading that section. */
export function SectionHeads({ section }: { section: Section }) {
  const visitors = useVisitors()
  const others = visitors?.filter((v) => !v.self && v.section === section) ?? []
  if (others.length === 0) return null
  const label = others.length === 1 ? '1 other person is here' : `${others.length} other people are here`
  return (
    <span className="flex items-center" title={label}>
      <Heads people={others} size={18} max={3} />
      <span className="sr-only">({label})</span>
    </span>
  )
}
