"use client"

import { MousePointerClick } from "lucide-react"
import KpiCard from "./KpiCard"

// Placeholder data, replace with real numbers.
export default function PageViewsCard() {
  return (
    <KpiCard
      id="pageviews"
      variant="bars"
      title="Page Views"
      value="84,600"
      subtitle="vs last month"
      change={12.1}
      icon={MousePointerClick}
      from="#00c6fb"
      to="#005bea"
      data={[48, 55, 51, 63, 58, 69, 62, 74, 68, 79, 76, 84.6]}
    />
  )
}