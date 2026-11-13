export function StripePattern({
  id,
  color,
}: {
  id: string
  color: string
}) {
  return (
    <pattern id={id} width="8" height="8" patternUnits="userSpaceOnUse">
      <rect width="8" height="8" fill={color} fillOpacity={0.08} />
      <circle cx="2" cy="2" r="1.2" fill={color} fillOpacity={0.5} />
      <circle cx="6" cy="6" r="1.2" fill={color} fillOpacity={0.5} />
    </pattern>
  )
}