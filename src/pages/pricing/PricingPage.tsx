"use client"

import { useState } from "react"
import { Check, Crown, Rocket, ShieldCheck, Sparkles, Undo2, Zap, Headphones, type LucideIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

type Billing = "monthly" | "yearly"

type Plan = {
  id: string
  name: string
  tagline: string
  icon: LucideIcon
  iconBox: string
  price: Record<Billing, number>
  cta: string
  featured?: boolean
  intro?: string
  features: string[]
}

/* -------------------------------------------------------------------------- */
/*                       Static plan data (replace freely)                    */
/* -------------------------------------------------------------------------- */

const plans: Plan[] = [
  {
    id: "free",
    name: "Free",
    tagline: "Try us out on a quick project or two.",
    icon: Sparkles,
    iconBox: "bg-slate-100 text-slate-600 dark:bg-slate-500/15 dark:text-slate-300",
    price: { monthly: 0, yearly: 0 },
    cta: "Start for free",
    features: ["1 active project", "3 MB upload limit", "5,000 visitors / month"],
  },
  {
    id: "tiny",
    name: "Tiny",
    tagline: "A professional link for personal use.",
    icon: Zap,
    iconBox: "bg-sky-100 text-sky-600 dark:bg-sky-500/15 dark:text-sky-400",
    price: { monthly: 5, yearly: 50 },
    cta: "Get Tiny",
    intro: "Everything in Free, plus",
    features: ["25 MB upload limit", "10,000 visitors / month", "QR codes", "Built-in analytics"],
  },
  {
    id: "solo",
    name: "Solo",
    tagline: "Great for individuals and small projects.",
    icon: Rocket,
    iconBox: "bg-white/15 text-primary-foreground",
    price: { monthly: 13, yearly: 130 },
    cta: "Get Solo",
    featured: true,
    intro: "Everything in Tiny, plus",
    features: [
      "5 active projects",
      "75 MB upload limit",
      "100,000 visitors / month",
      "Custom domains",
      "Password protection",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    tagline: "Built for freelancers and agencies.",
    icon: Crown,
    iconBox: "bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400",
    price: { monthly: 31, yearly: 310 },
    cta: "Get Pro",
    intro: "Everything in Solo, plus",
    features: [
      "Unlimited projects",
      "10 GB upload limit",
      "500,000 visitors / month",
      "Email capture",
      "Team members",
    ],
  },
]

const perks = [
  { icon: Undo2, title: "14-day refund", text: "Not happy? Get your money back, no questions asked." },
  { icon: ShieldCheck, title: "Secure payments", text: "Payments are encrypted and processed by Stripe." },
  { icon: Headphones, title: "Friendly support", text: "Real people reply to every message within a day." },
]

const formatPrice = (n: number) => (Number.isInteger(n) ? `$${n}` : `$${n.toFixed(2)}`)

/* -------------------------------------------------------------------------- */
/*                                    Page                                    */
/* -------------------------------------------------------------------------- */

export default function PricingPage() {
  const [billing, setBilling] = useState<Billing>("yearly")

  return (
    <div className="min-w-0 space-y-14">
      {/* HEADER */}
      <div className="mx-auto max-w-2xl space-y-4 text-center">
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
          Simple pricing, no surprises
        </h1>
        <p className="text-muted-foreground">
          Upgrade to link your custom domain, track visits, edit content and unlock premium
          features. Change or cancel your plan at any time.
        </p>

        {/* Billing switch */}
        <div className="flex justify-center pt-2">
          <div
            role="group"
            aria-label="Billing period"
            className="inline-flex items-center rounded-full border bg-muted/40 p-1"
          >
            {(["monthly", "yearly"] as const).map((option) => (
              <button
                key={option}
                type="button"
                aria-pressed={billing === option}
                onClick={() => setBilling(option)}
                className={`flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium capitalize transition-colors ${
                  billing === option
                    ? "bg-background shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {option}
                {option === "yearly" && (
                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-medium text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400">
                    2 months free
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* PLANS */}
      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {plans.map((plan) => {
          const Icon = plan.icon
          const price = plan.price[billing]
          const monthlyEquivalent = plan.price.yearly / 12
          const featured = !!plan.featured

          return (
            <div
              key={plan.id}
              className={`relative flex flex-col rounded-2xl border p-6 ${
                featured
                  ? "border-primary bg-primary text-primary-foreground shadow-xl"
                  : "bg-card text-card-foreground"
              }`}
            >
              {featured && (
                <Badge className="absolute -top-3 left-6 border-0 bg-amber-400 text-amber-950 hover:bg-amber-400">
                  Most popular
                </Badge>
              )}

              {/* Name */}
              <div className="flex items-center gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${plan.iconBox}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <h2 className="text-lg font-semibold">{plan.name}</h2>
              </div>

              <p
                className={`mt-3 min-h-10 text-sm ${
                  featured ? "text-primary-foreground/80" : "text-muted-foreground"
                }`}
              >
                {plan.tagline}
              </p>

              {/* Price */}
              <div className="mt-6 space-y-1">
                <p className="flex items-baseline gap-1">
                  <span className="text-4xl font-semibold tracking-tight">{formatPrice(price)}</span>
                  <span
                    className={`text-sm ${
                      featured ? "text-primary-foreground/70" : "text-muted-foreground"
                    }`}
                  >
                    {price === 0 ? "forever" : billing === "monthly" ? "/ month" : "/ year"}
                  </span>
                </p>
                <p
                  className={`h-5 text-xs ${
                    featured ? "text-primary-foreground/70" : "text-muted-foreground"
                  }`}
                >
                  {price === 0
                    ? "No credit card required"
                    : billing === "yearly"
                      ? `${formatPrice(Number(monthlyEquivalent.toFixed(2)))} / month, billed yearly`
                      : "Billed monthly"}
                </p>
              </div>

              {/* CTA */}
              <Button
                variant={featured ? "secondary" : plan.id === "free" ? "outline" : "default"}
                className="mt-6 w-full"
              >
                {plan.cta}
              </Button>

              {/* Features */}
              <div
                className={`mt-6 flex-1 border-t pt-6 ${
                  featured ? "border-primary-foreground/20" : ""
                }`}
              >
                <p className="mb-4 text-sm font-medium">{plan.intro ?? "What's included"}</p>
                <ul className="space-y-3 text-sm">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <span
                        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                          featured
                            ? "bg-primary-foreground/20 text-primary-foreground"
                            : "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400"
                        }`}
                      >
                        <Check className="h-3 w-3" strokeWidth={3} />
                      </span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )
        })}
      </div>

      {/* PERKS */}
      <div className="grid gap-6 border-t pt-10 sm:grid-cols-3">
        {perks.map((perk) => {
          const Icon = perk.icon
          return (
            <div key={perk.title} className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border bg-muted/40">
                <Icon className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium">{perk.title}</p>
                <p className="text-sm text-muted-foreground">{perk.text}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}