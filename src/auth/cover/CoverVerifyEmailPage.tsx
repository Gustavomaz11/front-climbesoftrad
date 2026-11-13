import * as React from "react"
import { Link } from "react-router-dom"
import { ArrowLeft, Check, MailCheck, Star } from "lucide-react"
import { FaFigma, FaSlack, FaDiscord } from "react-icons/fa6"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

const TESTIMONIALS = [
  {
    quote:
      "We swapped our auth screens for this in an afternoon. Looks like it was designed in-house.",
    name: "Priya Nair",
    role: "Founder, Loopwork",
  },
  {
    quote:
      "The kind of detail we'd normally pay a designer three sprints for.",
    name: "Dev Osei",
    role: "CTO, Ferrycode",
  },
]

const RESEND_COOLDOWN = 30 // seconds

export default function CoverVerifyEmailPage() {
  const [loading, setLoading] = React.useState(false)
  const [cooldown, setCooldown] = React.useState(0)

  // TODO: replace with the email the user signed up with
  // (e.g. from router state, useSearchParams, or your auth store)
  const email = "you@company.com"

  const [testimonial] = React.useState(
    () => TESTIMONIALS[Math.floor(Math.random() * TESTIMONIALS.length)]
  )

  React.useEffect(() => {
    if (cooldown <= 0) return
    const id = setTimeout(() => setCooldown((c) => c - 1), 1000)
    return () => clearTimeout(id)
  }, [cooldown])

  async function onResend() {
    setLoading(true)
    // TODO: wire up to your auth provider
    await new Promise((r) => setTimeout(r, 1200))
    setLoading(false)
    setCooldown(RESEND_COOLDOWN)
  }

  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      {/* Form side */}
      <div className="flex flex-col justify-center gap-8 px-6 py-10 sm:px-10 lg:px-16">
        <div className="mx-auto w-full max-w-sm">
          <div className="mb-8 space-y-1.5 text-center">

            <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-foreground/10">
              <MailCheck className="size-6 text-foreground" />
            </div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Verify your email
            </h1>
            <p className="text-sm text-muted-foreground">
              We sent a verification link to{" "}
              <span className="font-medium text-foreground">{email}</span>.
              Click the link in the email to activate your account.
            </p>
          </div>

          <div className="grid gap-4">
            <Button
              type="button"
              variant="outline"
              className="h-9 w-full"
              onClick={onResend}
              disabled={loading || cooldown > 0}
            >
              {loading
                ? "Sending…"
                : cooldown > 0
                  ? `Resend email in ${cooldown}s`
                  : "Resend verification email"}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              Didn&apos;t get the email? Check your spam folder or{" "}
              <Link
                to="/auth/cover/register"
                className="font-medium text-foreground underline-offset-4 hover:underline"
              >
                use a different email
              </Link>
            </p>
          </div>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            <Link
              to="/auth/cover/login"
              className="inline-flex items-center gap-1.5 font-medium text-foreground underline-offset-4 hover:underline"
            >
              <ArrowLeft className="size-3.5" />
              Back to sign in
            </Link>
          </p>
        </div>

        <p className="text-center text-xs text-muted-foreground">
          By continuing, you agree to our{" "}
          <Link to="#" className="underline underline-offset-2 hover:text-foreground">
            Terms
          </Link>{" "}
          and{" "}
          <Link to="#" className="underline underline-offset-2 hover:text-foreground">
            Privacy Policy
          </Link>
          .
        </p>
      </div>

      {/* Visual side — bento grid background with content */}
      <div className="relative hidden overflow-hidden bg-muted/30 lg:flex lg:flex-col lg:justify-center">
        <BentoGrid />
        <div className="relative z-10 flex flex-1 flex-col justify-center gap-8 px-12">
          <span className="inline-flex w-fit items-center rounded-full border bg-background px-3 py-1 text-xs font-medium text-muted-foreground">
            Almost there
          </span>
          <h2 className="max-w-md text-3xl font-semibold leading-tight text-foreground">
            Confirm your email to get started.
          </h2>
          <ul className="grid max-w-md gap-4">
            {[
              "Open the email we just sent you",
              "Click the verification link inside",
              "The link expires after 24 hours",
            ].map((item) => (
              <li key={item} className="flex items-start gap-3">
                <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-foreground/10">
                  <Check className="size-3 text-foreground" />
                </span>
                <span className="text-sm text-muted-foreground">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative z-10 p-12 pt-0 text-foreground/80">
          <blockquote className="max-w-md space-y-4 rounded-2xl border bg-background/70 p-6 shadow-lg backdrop-blur-sm">
            <div className="flex gap-1 text-foreground">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="size-3.5 fill-current" />
              ))}
            </div>
            <p className="text-lg font-medium leading-relaxed text-foreground">
              {testimonial.quote}
            </p>
            <footer className="flex items-center gap-3">
              <span className="flex size-8 items-center justify-center rounded-full bg-foreground text-xs font-medium text-background">
                {testimonial.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </span>
              <span>
                <span className="block text-sm font-medium text-foreground">
                  {testimonial.name}
                </span>
                <span className="block text-xs text-muted-foreground">
                  {testimonial.role}
                </span>
              </span>
            </footer>
          </blockquote>
        </div>
      </div>
    </div>
  )
}

function BentoGrid() {
  const cell = 60 // px, keep in sync with the background-size below

  const accents = [
    { top: 0, left: 6, color: "bg-emerald-500/15", Icon: FaFigma },
    { top: 9, left: 8, color: "bg-blue-500/15", Icon: FaSlack },
    { top: 10, left: 0, color: "bg-amber-500/15", Icon: FaDiscord },
  ]

  return (
    <div className="absolute inset-0">
      {/* Grid lines — follow the theme's --border (or --grid-line if set) */}
      <div
        className="absolute inset-0 [background-image:linear-gradient(to_right,var(--grid-line,var(--border))_1px,transparent_1px),linear-gradient(to_bottom,var(--grid-line,var(--border))_1px,transparent_1px)]"
        style={{ backgroundSize: `${cell}px ${cell}px` }}
      />

      {accents.map(({ Icon, ...a }, i) => (
        <div
          key={i}
          className={cn("absolute rounded-xl border border-border", a.color)}
          style={{
            top: a.top * cell,
            left: a.left * cell,
            width: cell,
            height: cell,
          }}
        >
          <div className="flex size-full items-center justify-center text-foreground/70">
            <Icon className="size-6" />
          </div>
        </div>
      ))}
    </div>
  )
}