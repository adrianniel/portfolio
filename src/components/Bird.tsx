/**
 * Pip, drawn as an ink hummingbird silhouette facing right, sitting fairly
 * upright like a perched hummingbird does. Parts are split so CSS can animate
 * them: the head turns and preens, the eye blinks, the tail flicks, the body
 * breathes, and in flight the folded wing gives way to two blurred wings.
 * Feet touch the perch at (18.5, 31) in the 40×40 viewBox.
 */
export function Bird() {
  return (
    <svg viewBox="0 0 40 40" width="40" height="40" className="guide-svg block overflow-visible" fill="currentColor">
      {/* Flight: a faint blur of the wing sweep plus two fast-beating wings. */}
      <g className="hb-wings">
        <path className="hb-blur" d="M20.5 17.5C14 13 9 6 9.5 1.5 15 4 19.5 10 21.5 17Z" />
        <path className="hb-wing hb-wing-a" d="M20.5 17.5C17.5 9 14.5 3.5 11 1.2c1.2 5 4.2 11 8.3 17Z" />
        <path className="hb-wing hb-wing-b" d="M20.5 17.5C17.5 9 14.5 3.5 11 1.2c1.2 5 4.2 11 8.3 17Z" />
      </g>

      <g className="hb-legs" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" fill="none">
        <path d="M17 27.5v3.5M15.8 31h2.6" />
        <path d="M19.8 27v4M18.8 31h2.6" />
      </g>

      <path className="hb-tail" d="M12.5 25.5 6.2 33.6l2.3.3 2-2.6-.6 3.9 2.4-.7 2.5-6.6Z" />

      <g className="hb-body">
        <path d="M22.6 14.6c3.6 2.4 3.3 8.8-1.2 12.1-3 2.2-7 2.6-9.6 1.3 1.4-4.6 5.2-11.6 10.8-13.4Z" />
        {/* The folded wing runs down the back and past the tail, like a blade. */}
        <path className="hb-wing-folded" d="M21.4 17.2c-3.6 3.4-8.4 9-12.2 13.6 4.6-2.4 9.4-6.4 13-11.2Z" />
      </g>

      <g className="hb-head">
        <circle cx="24.6" cy="12.6" r="4.3" />
        {/* The long, straight beak. */}
        <path d="M28.2 11.3 39.4 9.6v.7l-11 3.1Z" />
        <circle className="hb-eye fill-cream" cx="25.9" cy="11.6" r="0.8" />
      </g>
    </svg>
  )
}
