/*
 * Maya's home: an ink branch growing in from the right edge of the screen,
 * with a small nest on it. It is drawn in two layers so she can sit *inside*
 * the nest: the branch and the back wall go behind her, the front of the
 * bowl goes in front of her. Both layers are 130×64 and share one viewBox.
 * Her feet go at (62, 37), marked by the data-home-perch span.
 */

const INK = '#16130f'

/** A small almond leaf at (x, y), turned by `turn` degrees. */
function Leaf({ x, y, turn }: { x: number; y: number; turn: number }) {
  return <path d="M0 0c3-4.2 10-4.2 13.5 0-3.5 4.2-10.5 4.2-13.5 0Z" transform={`translate(${x} ${y}) rotate(${turn})`} />
}

export function NestBack() {
  return (
    <svg viewBox="0 0 130 64" width="130" height="64" aria-hidden="true" className="block overflow-visible" fill={INK}>
      <g fill="none" stroke={INK} strokeLinecap="round">
        {/* The branch, thicker where it comes in from the edge. */}
        <path d="M134 47c-22-5-41 0-64-2-21-2-38-9-64-4" strokeWidth="4.2" />
        <path d="M100 45c3-8 9-13 17-15" strokeWidth="2.2" />
        <path d="M36 41c-3 6-8 10-15 12" strokeWidth="2" />
        <path d="M18 41c-4-3-9-4-13-3" strokeWidth="1.6" />
        {/* The back wall of the nest. */}
        <path d="M45 33.5c4-4.5 29-4.5 34 0" strokeWidth="3" />
      </g>
      <Leaf x={116} y={30} turn={-28} />
      <Leaf x={112} y={34} turn={18} />
      <Leaf x={21} y={53} turn={150} />
      <Leaf x={5} y={38} turn={200} />
      <Leaf x={86} y={47} turn={60} />
    </svg>
  )
}

export function NestFront() {
  return (
    <svg viewBox="0 0 130 64" width="130" height="64" aria-hidden="true" className="block overflow-visible" fill={INK}>
      {/* The bowl, its front rim dipping a little so you can see in. */}
      <path d="M43.5 33c1 14.5 36 14.5 37 0-6.5 3.2-30.5 3.2-37 0Z" />
      <g fill="none" stroke={INK} strokeWidth="1.5" strokeLinecap="round">
        <path d="M41 34.5l7.5-2.6M83 35.5l-7.5-3.5M47 41.5l-5.5 3M77.5 41.5l5.5 2.4M60 45.6l-2 3.4" />
      </g>
    </svg>
  )
}
