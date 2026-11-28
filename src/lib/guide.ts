import type { Section } from './router'

/*
 * Maya's brain. She perches on things marked with data-say (the line she
 * says there) and optional data-perch ("text" = end of the first line of
 * text, "center", or "start" by default). She flies along a curved path,
 * follows the page as it scrolls, and on every page switch hops onto the
 * active item in the sidebar first, so she is never swept away with the
 * old view. Plain DOM and requestAnimationFrame: React never re-renders for her.
 */

type Point = { x: number; y: number }
type Spot = HTMLElement | Point

// Where her feet are inside the 44×35 sprite.
const FOOT_X = 21
const FOOT_Y = 34
const TOP_SAFE = 64

export const INTRO = "Hi, I'm Maya! I'll show you around. Follow me."

const ON_SWITCH: Record<Section, string> = {
  home: 'Back to the start!',
  about: 'About Niel, coming up.',
  work: 'To the work! The good part.',
  certificates: 'Certificates. He did his homework.',
  contact: 'Contact! Good choice.',
}

const POKES = [
  'Tweet! That tickles.',
  'Maya birds are everywhere in the Philippines. Like me!',
  'Niel is in Bohol right now. Probably coding.',
  "Psst. The orange button is the one he's hoping you click.",
  'Try the Work page. I hide on every project.',
  "I'm made of one SVG path and a lot of confidence.",
]

const isPoint = (s: Spot): s is Point => !(s instanceof HTMLElement)
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n))
let measurer: CanvasRenderingContext2D | null = null

/** Where the first baseline sits inside a block, and how tall its capitals are. */
function textMetrics(el: HTMLElement) {
  measurer ??= document.createElement('canvas').getContext('2d')
  const cs = getComputedStyle(el)
  const size = parseFloat(cs.fontSize)
  const lineHeight = parseFloat(cs.lineHeight) || size * 1.2
  if (!measurer) return { baseline: lineHeight * 0.8, cap: size * 0.7 }
  measurer.font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`
  const m = measurer.measureText('Hg')
  const ascent = m.fontBoundingBoxAscent
  const descent = m.fontBoundingBoxDescent
  const cap = measurer.measureText('H').actualBoundingBoxAscent
  const baseline = parseFloat(cs.paddingTop) + (lineHeight - (ascent + descent)) / 2 + ascent
  return { baseline, cap }
}

const isShown = (el: Element) => {
  const r = el.getBoundingClientRect()
  return r.width > 0 && r.height > 0
}

export class GuideController {
  private pos: Point
  private spot: Spot | null = null
  private section: Section | null = null
  private seen = new Set<Element>()
  private flight = 0
  private scrollFrame = 0
  private settleTimer = 0
  private nextTimer = 0
  private hideTimer = 0
  private startTimer = 0
  private readonly reduce: boolean
  private readonly bird: HTMLElement
  private readonly bubble: HTMLElement

  constructor(bird: HTMLElement, bubble: HTMLElement) {
    this.bird = bird
    this.bubble = bubble
    this.reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    // Waits just off the right edge until the first flight.
    this.pos = { x: window.innerWidth + 50, y: 140 }
    this.place(this.pos)
    window.addEventListener('scroll', this.onScroll, { passive: true })
    window.addEventListener('resize', this.onScroll)
  }

  destroy() {
    window.removeEventListener('scroll', this.onScroll)
    window.removeEventListener('resize', this.onScroll)
    cancelAnimationFrame(this.flight)
    cancelAnimationFrame(this.scrollFrame)
    for (const t of [this.settleTimer, this.nextTimer, this.hideTimer, this.startTimer]) clearTimeout(t)
  }

  /** Called on first load and on every route change. */
  routeChanged(section: Section) {
    const first = this.section === null
    this.section = section
    this.seen.clear()
    clearTimeout(this.nextTimer)
    clearTimeout(this.startTimer)

    if (first) {
      this.startTimer = window.setTimeout(() => this.tour(INTRO), 1200)
      return
    }
    const nav = this.navSpot()
    // Hop onto the sidebar while the view changes, then go explore it.
    if (nav) this.fly(nav, ON_SWITCH[section], 1000)
    else this.fly({ x: window.innerWidth - 40, y: TOP_SAFE + 40 }, ON_SWITCH[section], 900)
  }

  /** A click on Maya: a little hop and a random line. */
  poke() {
    if (this.flight) return
    this.bird.classList.remove('is-poked')
    void this.bird.offsetWidth
    this.bird.classList.add('is-poked')
    this.say(POKES[Math.floor(Math.random() * POKES.length)])
    this.scheduleNext(9000)
  }

  // --- choosing where to go --------------------------------------------------

  private navSpot(): HTMLElement | null {
    const label = document.querySelector<HTMLElement>('aside a[aria-current="page"] [data-guide-nav]')
    return label && isShown(label) ? label : null
  }

  /** Perches on screen right now: the open view first, then the sidebar. */
  private candidates(): HTMLElement[] {
    const inView = [...document.querySelectorAll<HTMLElement>('#view [data-say]')]
    const aside = [...document.querySelectorAll<HTMLElement>('aside [data-say]')]
    return [...inView, ...aside].filter((el) => isShown(el) && this.visible(this.anchor(el)))
  }

  /** Flies to the next thing worth seeing, or rests if she has said it all. */
  private tour(line?: string) {
    const next = this.candidates().find((el) => !this.seen.has(el) && el !== this.spot)
    if (next) {
      this.seen.add(next)
      this.fly(next, line ?? next.dataset.say ?? '')
      return
    }
    if (this.spot && this.visible(this.anchor(this.spot))) {
      this.scheduleNext(9000)
      return
    }
    // Nothing on screen to sit on: wait in the corner.
    this.fly({ x: window.innerWidth - 44, y: window.innerHeight - 14 }, '', 9000)
  }

  private scheduleNext(ms: number) {
    clearTimeout(this.nextTimer)
    this.nextTimer = window.setTimeout(() => this.tour(), ms)
  }

  // --- geometry ----------------------------------------------------------------

  private anchor(spot: Spot): Point {
    if (isPoint(spot)) return { x: Math.min(spot.x, window.innerWidth - 30), y: Math.min(spot.y, window.innerHeight - 8) }
    const mode = spot.dataset.perch ?? 'start'
    const r = spot.getBoundingClientRect()

    if (mode === 'text') {
      const range = document.createRange()
      range.selectNodeContents(spot)
      const rects = [...range.getClientRects()].filter((x) => x.width > 1)
      if (rects.length) {
        // Right end of the first line of text...
        const top = Math.min(...rects.map((x) => x.top))
        const right = Math.max(...rects.filter((x) => x.top < top + 8).map((x) => x.right))
        // ...and the top of its capital letters, from the font's own metrics.
        const { baseline, cap } = textMetrics(spot)
        const y = r.top + baseline - cap
        return { x: clamp(right - cap * 0.7, r.left + 12, window.innerWidth - 30), y }
      }
    }
    if (mode === 'center') return { x: r.left + r.width / 2, y: r.top + 1 }
    return { x: r.left + Math.min(r.width * 0.7, 150), y: r.top + 1 }
  }

  private visible(p: Point) {
    const inSidebar = p.x < 280 && window.innerWidth >= 1024
    const top = inSidebar ? 40 : TOP_SAFE + 24
    return p.y > top && p.y < window.innerHeight - 6 && p.x > 10 && p.x < window.innerWidth - 10
  }

  // --- moving --------------------------------------------------------------------

  private place(p: Point) {
    this.pos = p
    this.bird.style.transform = `translate3d(${p.x - FOOT_X}px, ${p.y - FOOT_Y}px, 0)`
    if (this.bubble.classList.contains('is-shown')) this.placeBubble()
  }

  private fly(spot: Spot, line: string, then = 8500) {
    cancelAnimationFrame(this.flight)
    this.flight = 0
    this.spot = spot
    this.hideBubble()
    clearTimeout(this.nextTimer)

    const from = { ...this.pos }
    const target = this.anchor(spot)
    const dx = target.x - from.x
    const dist = Math.hypot(dx, target.y - from.y)

    if (this.reduce || dist < 4) {
      this.place(target)
      this.land(line, then)
      return
    }

    this.bird.style.setProperty('--face', dx >= 0 ? '1' : '-1')
    this.bird.classList.remove('is-landing', 'is-poked')
    this.bird.classList.add('is-flying')
    const duration = clamp(dist * 1.15, 450, 1500)
    const lift = Math.min(150, 40 + dist * 0.25)
    const start = performance.now()

    const step = () => {
      const p = Math.min(1, (performance.now() - start) / duration)
      const e = easeInOut(p)
      const to = this.anchor(spot) // keeps up if the page scrolls mid-flight
      const c = { x: (from.x + to.x) / 2, y: Math.min(from.y, to.y) - lift }
      const u = 1 - e
      this.place({
        x: u * u * from.x + 2 * u * e * c.x + e * e * to.x,
        y: u * u * from.y + 2 * u * e * c.y + e * e * to.y,
      })
      if (p < 1) this.flight = requestAnimationFrame(step)
      else {
        this.flight = 0
        this.land(line, then)
      }
    }
    this.flight = requestAnimationFrame(step)
  }

  private land(line: string, then: number) {
    this.bird.classList.remove('is-flying', 'is-landing')
    void this.bird.offsetWidth
    this.bird.classList.add('is-landing')
    this.say(line)
    this.scheduleNext(then)
  }

  // --- talking -------------------------------------------------------------------

  private say(line: string) {
    clearTimeout(this.hideTimer)
    if (!line) {
      this.hideBubble()
      return
    }
    this.bubble.textContent = line
    this.bubble.classList.add('is-shown')
    this.placeBubble()
    this.hideTimer = window.setTimeout(() => this.hideBubble(), 3800 + line.length * 30)
  }

  private hideBubble() {
    this.bubble.classList.remove('is-shown')
  }

  private placeBubble() {
    const w = this.bubble.offsetWidth
    const h = this.bubble.offsetHeight
    const left = clamp(this.pos.x - 24, 8, window.innerWidth - w - 8)
    const top = Math.max(8, this.pos.y - FOOT_Y - h - 4)
    this.bubble.style.transform = `translate3d(${left}px, ${top}px, 0)`
    this.bubble.style.setProperty('--tail', `${clamp(this.pos.x - left - 5, 8, w - 18)}px`)
  }

  // --- scrolling -----------------------------------------------------------------

  private onScroll = () => {
    if (!this.scrollFrame) {
      this.scrollFrame = requestAnimationFrame(() => {
        this.scrollFrame = 0
        if (!this.flight && this.spot) this.place(this.anchor(this.spot))
      })
    }
    clearTimeout(this.settleTimer)
    this.settleTimer = window.setTimeout(this.settled, 400)
  }

  /** After scrolling stops: follow the reader if her perch left the screen. */
  private settled = () => {
    if (this.flight || !this.spot || this.section === null) return
    const offscreen = !this.visible(this.anchor(this.spot))
    const fresh = this.candidates().some((el) => !this.seen.has(el))
    const talking = this.bubble.classList.contains('is-shown')
    if (offscreen || (fresh && !talking)) this.tour()
  }
}
