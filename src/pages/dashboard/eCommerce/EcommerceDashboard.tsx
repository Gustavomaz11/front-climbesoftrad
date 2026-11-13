"use client"

import { Suspense, lazy } from "react"

// Clean default-based lazy imports
const WelcomeBannerCard = lazy(() => import("./welcome-banner-card"))
const RevenueChartCard = lazy(() => import("./revenue-chart-card"))
const ConversionRate = lazy(() => import("./conversion-rate"))
const SalesOverview = lazy(() => import("./sales-overview"))
const TopCategories = lazy(() => import("./top-categories"))
const TransactionsCard = lazy(() => import("./transactions-card"))
const OrderStatus = lazy(() => import("./order-status"))
const SalesByChannel = lazy(() => import("./sales-by-channel"))
const ProductOrdersTable = lazy(() => import("./product-orders-table"))

// Skeleton fallback
function CardSkeleton({ height = 300 }: { height?: number }) {
  return (
    <div
      className="w-full rounded-xl bg-muted animate-pulse"
      style={{ height }}
    />
  )
}

export default function EcommerceDashboard() {
  return (
    <div className="dashboard-analytics">
      <div className="grid grid-cols-12 gap-6">

        <div className="col-span-12 xl:col-span-6">
          <Suspense fallback={<CardSkeleton height={280} />}>
            <WelcomeBannerCard />
          </Suspense>
        </div>

        <div className="col-span-12 md:col-span-6 xl:col-span-3">
          <Suspense fallback={<CardSkeleton height={220} />}>
            <RevenueChartCard />
          </Suspense>
        </div>

        <div className="col-span-12 md:col-span-6 xl:col-span-3">
          <Suspense fallback={<CardSkeleton height={220} />}>
            <ConversionRate />
          </Suspense>
        </div>

        <div className="col-span-12 xl:col-span-8">
          <Suspense fallback={<CardSkeleton height={300} />}>
            <SalesOverview />
          </Suspense>
        </div>

        <div className="col-span-12 xl:col-span-4">
          <Suspense fallback={<CardSkeleton height={300} />}>
            <TopCategories />
          </Suspense>
        </div>

        <div className="col-span-12 lg:col-span-6 xl:col-span-4 flex">
          <Suspense fallback={<CardSkeleton height={250} />}>
            <TransactionsCard />
          </Suspense>
        </div>

        <div className="col-span-12 lg:col-span-6 xl:col-span-4 flex">
          <Suspense fallback={<CardSkeleton height={250} />}>
            <OrderStatus />
          </Suspense>
        </div>

        <div className="col-span-12 xl:col-span-4 flex">
          <Suspense fallback={<CardSkeleton height={250} />}>
            <SalesByChannel />
          </Suspense>
        </div>

        <div className="col-span-12 xl:col-span-12 flex">
          <Suspense fallback={<CardSkeleton height={380} />}>
            <ProductOrdersTable />
          </Suspense>
        </div>

      </div>
    </div>
  )
}