"use client"

import * as React from "react"
import { Link } from "react-router-dom"
import { ArrowRight, Check, Star } from "lucide-react"
import { FaGithub, FaFigma, FaSlack, FaDiscord } from "react-icons/fa6"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"

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

export default function CoverLoginPage() {
  const [loading, setLoading] = React.useState(false)

  // Pick randomly only after mount so server and client render the same
  // testimonial on first paint — avoids a hydration mismatch.
  const [testimonial, setTestimonial] = React.useState(TESTIMONIALS[0])
  React.useEffect(() => {
    setTestimonial(
      TESTIMONIALS[Math.floor(Math.random() * TESTIMONIALS.length)]
    )
  }, [])

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    // TODO: wire up to your auth provider
    await new Promise((r) => setTimeout(r, 1200))
    setLoading(false)
  }

  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      {/* Form side */}
      <div className="flex flex-col justify-center gap-8 px-6 py-10 sm:px-10 lg:px-16">
        <div className="mx-auto w-full max-w-sm">
          <div className="mb-8 space-y-1.5 text-center">
            <div className="mb-7 flex items-center justify-center">
              <Link to="/" className="flex items-center gap-2 text-md font-medium">
                <span className="flex size-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
                  <span className="text-lg font-semibold">A</span>
                </span>
                CoderVent
              </Link>
            </div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Log in to your account
            </h1>
            <p className="text-sm text-muted-foreground">
              Sign in to your workspace to keep going.
            </p>
          </div>

          <div className="grid gap-3">
            <Button variant="outline" className="h-9 w-full bg-background px-3">
              <FaGithub className="size-4.5" />
              Continue with GitHub
            </Button>
            <Button variant="outline" className="h-9 w-full bg-background px-3">
              <GoogleIcon/>
              Continue with Google
            </Button>

          </div>

          <div className="my-6 flex items-center gap-3">
            <Separator className="shrink" />
            <span className="text-xs text-muted-foreground">or</span>
            <Separator className="shrink" />
          </div>

          <form onSubmit={onSubmit} className="grid gap-4">
            <div className="grid gap-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@company.com"
                autoComplete="email"
                className="h-9 bg-background px-3"
                required
              />
            </div>
            <div className="grid gap-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link
                  to="/auth/cover/forgot-password"
                  className="text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                className="h-9 bg-background px-3"
              />
            </div>
            <Button type="submit" className="mt-1 h-9 w-full bg-linear-to-r from-pink-500 to-purple-600 text-white" disabled={loading}>
              {loading ? "Signing in…" : "Sign in"}
              {!loading && <ArrowRight className="size-4" />}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link
              to="/auth/cover/register"
              className="font-medium text-foreground underline-offset-4 hover:underline"
            >
              Sign up
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
        </p>
      </div>

      {/* Visual side — bento grid background with content */}
      <div className="relative hidden overflow-hidden bg-muted/30 lg:flex lg:flex-col lg:justify-center">
        <BentoGrid />
        <div className="relative z-10 flex flex-1 flex-col justify-center gap-8 px-12">
          <span className="inline-flex w-fit items-center rounded-full border bg-background px-3 py-1 text-xs font-medium text-muted-foreground">
            Trusted by 4,000+ product teams
          </span>
          <h2 className="max-w-md text-3xl font-semibold leading-tight text-foreground">
            Everything your team needs, in one workspace.
          </h2>
          <ul className="grid max-w-md gap-4">
            {[
              "Unlimited projects and members",
              "Real-time sync across every device",
              "SOC 2 Type II compliant, always encrypted",
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

function GoogleIcon() {
  return (
    <svg className="size-4.5" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.25 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09a5.99 5.99 0 0 1 0-3.83V7.42H2.18a11 11 0 0 0 0 9.51l3.66 2.84z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.42l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.88z"
      />
    </svg>
  )
}