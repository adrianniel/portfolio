/**
 * Maya, a little Eurasian tree sparrow ("maya" in the Philippines), drawn as
 * an ink silhouette facing right. Parts are split so CSS can animate them:
 * the head tilts, the wing only shows (and flaps) in flight, the legs tuck in.
 * Feet touch the ground at (19, 31) in the 40×32 viewBox.
 */
export function Bird() {
  return (
    <svg viewBox="0 0 40 32" width="44" height="35" className="guide-svg block overflow-visible" fill="#16130f">
      <g className="guide-legs" stroke="#16130f" strokeWidth="1.3" strokeLinecap="round" fill="none">
        <path d="M17.2 25.6 16.4 31M15 31h3" />
        <path d="M20.6 25.4 21 31M19.6 31h3" />
      </g>
      <path
        className="guide-body"
        d="M25 9c5 3 6 9 2 13.5-4 4-11 5-15.5 2.5L1.5 29.5 0.5 27l9.5-5.5C13 15.5 19 11 25 9Z"
      />
      <g className="guide-head">
        <circle cx="29" cy="10.5" r="5.4" />
        <path d="M33.8 9.8 38.6 11.4 33.8 12.9Z" />
        <circle cx="30.7" cy="9.3" r="0.85" fill="#f2ebdc" />
      </g>
      <path className="guide-wing" d="M22 15C19 8 13 3.5 7 3c2.5 5 6.5 9.5 10.5 14Z" />
    </svg>
  )
}
