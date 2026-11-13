"use client"

import { Timer } from "lucide-react"
import KpiCard from "./KpiCard"

// Placeholder data, replace with real numbers.
export default function SessionDurationCard() {
  return (
    <KpiCard
      id="session"
      variant="dots"
      title="Avg. Session"
      value="4m 32s"
      subtitle="Time on site per visit"
      change={6.3}
      icon={Timer}
      from="#17ad37"
      to="#98ec2d"
      data={[3.2, 3.5, 3.3, 3.9, 3.6, 4.1, 3.8, 4.3, 4.1, 4.4, 4.2, 4.53]}
    />
  )
}