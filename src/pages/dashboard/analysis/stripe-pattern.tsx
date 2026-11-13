type Variant = "stripes" | "fine" | "crosshatch" | "lines" | "grid" | "dots"

export function StripePattern({
  id,
  color,
  size = 8,
  variant = "stripes",
}: {
  id: string
  color: string
  size?: number
  variant?: Variant
}) {
  const rotate = variant === "stripes" || variant === "fine" ? "rotate(45)" : undefined
  const s = variant === "fine" ? Math.min(size, 5) : size

  return (
    <pattern
      id={id}
      width={s}
      height={s}
      patternUnits="userSpaceOnUse"
      patternTransform={rotate}
    >
      <rect width={s} height={s} fill={color} fillOpacity={0.06} />

      {variant === "stripes" && (
        <line x1="0" y1="0" x2="0" y2={s} stroke={color} strokeWidth="2" strokeOpacity={0.35} />
      )}

      {variant === "fine" && (
        <line x1="0" y1="0" x2="0" y2={s} stroke={color} strokeWidth="1" strokeOpacity={0.45} />
      )}

      {variant === "crosshatch" && (
        <path d={`M0 0L${s} ${s}M${s} 0L0 ${s}`} stroke={color} strokeWidth="1" strokeOpacity={0.3} />
      )}

      {variant === "lines" && (
        <line x1="0" y1="0" x2={s} y2="0" stroke={color} strokeWidth="1.5" strokeOpacity={0.35} />
      )}

      {variant === "grid" && (
        <path d={`M${s} 0H0V${s}`} fill="none" stroke={color} strokeWidth="1" strokeOpacity={0.3} />
      )}

      {variant === "dots" && (
        <circle cx={s / 2} cy={s / 2} r="1" fill={color} fillOpacity={0.5} />
      )}
    </pattern>
  )
}