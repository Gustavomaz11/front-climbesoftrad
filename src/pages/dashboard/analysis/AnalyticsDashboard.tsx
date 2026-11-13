"use client"

import React, { Suspense, lazy } from "react"

// Row 1
const VisitorsCard = lazy(() => import("./VisitorsCard"))
const PageViewsCard = lazy(() => import("./PageViewsCard"))
const BounceRateCard = lazy(() => import("./BounceRateCard"))
const SessionDurationCard = lazy(() => import("./SessionDurationCard"))
// Row 2
const TrafficOverviewCard = lazy(() => import("./TrafficOverviewCard"))
const TrafficSourcesCard = lazy(() => import("./TrafficSourcesCard"))
// Row 3
const VisitorsByCountryCard = lazy(() => import("./VisitorsByCountryCard"))
const DevicesCard = lazy(() => import("./DevicesCard"))
const NewVsReturningCard = lazy(() => import("./NewVsReturningCard"))
// Row 4
const TopPagesCard = lazy(() => import("./TopPagesCard"))
const RetentionCard = lazy(() => import("./RetentionCard"))
// Row 5
const ActiveUsersCard = lazy(() => import("./ActiveUsersCard"))
const RecentEventsCard = lazy(() => import("./RecentEventsCard"))

function CardSkeleton({ height = 250 }: { height?: number }) {
  return (
    <div
      className="w-full animate-pulse rounded-xl bg-muted"
      style={{ height }}
    />
  )
}

export default function AnalyticsDashboard() {
  return (
    <div className="analytics-dashboard">
      {/* Row 1: KPI cards */}
      <div className="mb-6 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <Suspense fallback={<CardSkeleton height={190} />}>
          <VisitorsCard />
        </Suspense>
        <Suspense fallback={<CardSkeleton height={190} />}>
          <PageViewsCard />
        </Suspense>
        <Suspense fallback={<CardSkeleton height={190} />}>
          <BounceRateCard />
        </Suspense>
        <Suspense fallback={<CardSkeleton height={190} />}>
          <SessionDurationCard />
        </Suspense>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Row 2: Traffic */}
        <div className="col-span-12 xl:col-span-12">
          <Suspense fallback={<CardSkeleton height={380} />}>
            <TrafficOverviewCard />
          </Suspense>
        </div>
        <div className="col-span-12 xl:col-span-4">
          <Suspense fallback={<CardSkeleton height={380} />}>
            <TrafficSourcesCard />
          </Suspense>
        </div>

        {/* Row 3: Audience */}
        <div className="col-span-12 lg:col-span-6 xl:col-span-4">
          <Suspense fallback={<CardSkeleton height={420} />}>
            <VisitorsByCountryCard />
          </Suspense>
        </div>
        {/* <div className="col-span-12 lg:col-span-6 xl:col-span-4">
          <Suspense fallback={<CardSkeleton height={420} />}>
            <DevicesCard />
          </Suspense>
        </div> */}
        <div className="col-span-12 xl:col-span-4">
          <Suspense fallback={<CardSkeleton height={420} />}>
            <NewVsReturningCard />
          </Suspense>
        </div>

        {/* Row 4: Behavior */}
        <div className="col-span-12 xl:col-span-6">
          <Suspense fallback={<CardSkeleton height={420} />}>
            <TopPagesCard />
          </Suspense>
        </div>
        <div className="col-span-12 xl:col-span-6">
          <Suspense fallback={<CardSkeleton height={420} />}>
            <RetentionCard />
          </Suspense>
        </div>

        {/* Row 5: Realtime */}
        <div className="col-span-12 xl:col-span-4">
          <Suspense fallback={<CardSkeleton height={460} />}>
            <ActiveUsersCard />
          </Suspense>
        </div>
        <div className="col-span-12 xl:col-span-8">
          <Suspense fallback={<CardSkeleton height={460} />}>
            <RecentEventsCard />
          </Suspense>
        </div>
      </div>
    </div>
  )
}