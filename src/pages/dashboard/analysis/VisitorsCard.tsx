"use client"

import { Users } from "lucide-react"
import KpiCard from "./KpiCard"

// Placeholder data, replace with real numbers.
export default function VisitorsCard() {
  return (
    <KpiCard
      id="visitors"
      variant="dots"
      title="Total Visitors"
      value="25,300"
      subtitle="Unique visitors this month"
      change={8.4}
      icon={Users}
      from="#7928ca"
      to="#ff0080"
      data={[12.8, 14.6, 13.9, 16.8, 15.7, 19.2, 17.5, 20.9, 19.6, 22.8, 21.7, 25.3]}
    />
  )
}