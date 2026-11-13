"use client"

import React, { Suspense, lazy } from "react"

// Clean default-based lazy imports
const TicketSupport = lazy(() => import("./TicketSupport"))
const AreaStatsCard = lazy(() => import("./AreaStatsCard"))
const DeviceViewStatusCard = lazy(() => import("./DeviceViewStatusCard"))
const NewCustomersCard = lazy(() => import("./NewCustomersCard"))
const NewVsOldVisitors = lazy(() => import("./NewVsOldVisitors"))
const ProgressStatCard = lazy(() => import("./ProgressStatCard"))
const TotalSessionsCard = lazy(() => import("./TotalSessionsCard"))
const TopTrafficChannelsCard = lazy(() => import("./TopTrafficChannelsCard"))
const VisitorsSalesCard = lazy(() => import("./VisitorsSalesCard"))
const VisitorsSalesStackedCard = lazy(() => import("./VisitorsSalesStackedCard"))
const WebsiteVisitorsCard = lazy(() => import("./WebsiteVisitorsCard"))
const RadialStatCard = lazy(() => import("./RadialStatCard"))

// Skeleton
function CardSkeleton({ height = 250 }: { height?: number }) {
  return (
    <div
      className="w-full rounded-xl bg-muted animate-pulse"
      style={{ height }}
    />
  )
}

export default function DataWidgetsPage() {
  return (
    <div className="data-widgets-page">

      {/* Top Grid */}
      <div className="grid grid-cols-12 gap-6">

        <div className="col-span-12 xl:col-span-4">
          <Suspense fallback={<CardSkeleton height={260} />}>
            <TopTrafficChannelsCard />
          </Suspense>
        </div>

        <div className="col-span-12 lg:col-span-6 xl:col-span-4">
          <Suspense fallback={<CardSkeleton height={260} />}>
            <NewVsOldVisitors />
          </Suspense>
        </div>

        <div className="col-span-12 lg:col-span-6 xl:col-span-4">
          <Suspense fallback={<CardSkeleton height={260} />}>
            <TicketSupport />
          </Suspense>
        </div>

        <div className="col-span-12 xl:col-span-4 space-y-6">
          <Suspense fallback={<CardSkeleton height={180} />}>
            <DeviceViewStatusCard />
          </Suspense>
        </div>

        <div className="col-span-12 xl:col-span-8">
          <Suspense fallback={<CardSkeleton height={320} />}>
            <VisitorsSalesCard />
          </Suspense>
        </div>

        <div className="col-span-12">
          <Suspense fallback={<CardSkeleton height={350} />}>
            <VisitorsSalesStackedCard />
          </Suspense>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-4 mt-6">
          <Suspense fallback={<CardSkeleton height={140} />}>
            <ProgressStatCard
              title="Total sessions"
              value="789"
              progress={68}
              badgeText="12% remaining"
              variant="info"
            />
          </Suspense>
          <Suspense fallback={<CardSkeleton height={140} />}>
            <ProgressStatCard
              title="Total revenue"
              value="$12,345"
              progress={82}
              badgeText="18% remaining"
              variant="success"
            />
          </Suspense>
          <Suspense fallback={<CardSkeleton height={140} />}>
            <ProgressStatCard
              title="Total orders"
              value="1,234"
              progress={45}
              badgeText="55% remaining"
              variant="warning"
            />
          </Suspense>
          <Suspense fallback={<CardSkeleton height={140} />}>
            <ProgressStatCard
              title="Total customers"
              value="567"
              progress={30}
              badgeText="70% remaining"
              variant="danger"
            />
          </Suspense>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-4 mt-6">

        <Suspense fallback={<CardSkeleton height={180} />}>
          <WebsiteVisitorsCard />
        </Suspense>

        <Suspense fallback={<CardSkeleton height={180} />}>
          <NewCustomersCard />
        </Suspense>

        <Suspense fallback={<CardSkeleton height={180} />}>
          <TotalSessionsCard />
        </Suspense>

        <Suspense fallback={<CardSkeleton height={180} />}>
          <AreaStatsCard />
        </Suspense>

      </div>

      {/* Radial Stats */}
      <div className="grid gap-6 md:grid-cols-4 mt-6">

        <Suspense fallback={<CardSkeleton height={220} />}>
          <RadialStatCard
  title="Revenue Target"
  value={72}
  label="Achieved"
  color="#7928ca"
  colorTo="#ff0080"
  change={5.2}
  description="Of the $120k quarterly target"
/>
        </Suspense>

        <Suspense fallback={<CardSkeleton height={220} />}>
          <RadialStatCard
  title="Goal Completion"
  value={86}
  label="Completed"
  color="#02a424"
  colorTo="#98ec2d"
  change={8.1}
  description="34 of 40 goals completed"
/>
        </Suspense>

        <Suspense fallback={<CardSkeleton height={220} />}>
          <RadialStatCard
  title="Server Usage"
  value={64}
  label="Used"
  color="#efff09"
  colorTo="#ff1a1a"
  change={-2.4}
  description="Average CPU load this month"
/>
        </Suspense>

        <Suspense fallback={<CardSkeleton height={220} />}>
          <RadialStatCard
  title="Growth Rate"
  value={41}
  label="This Month"
  color="#00c6fb"
  colorTo="#005bea"
  change={3.6}
  description="Compared to last month"
/>
        </Suspense>

      </div>

    </div>
  )
}