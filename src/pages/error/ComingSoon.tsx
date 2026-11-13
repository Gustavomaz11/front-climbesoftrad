"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { useTheme } from "next-themes"
import { Sun, Moon, Bell, ArrowRight, Check, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

type TimeLeft = {
  days: number
  hours: number
  minutes: number
  seconds: number
}

const UNITS = ["days", "hours", "minutes", "seconds"] as const
const LAUNCH_IN_DAYS = 5

const pad = (n: number) => String(n).padStart(2, "0")

export default function ComingSoon() {
  const { theme, setTheme } = useTheme()
  const [email, setEmail] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  })

  useEffect(() => {
    const target = new Date()
    target.setDate(target.getDate() + LAUNCH_IN_DAYS)

    const tick = () => {
      const distance = Math.max(target.getTime() - Date.now(), 0)

      setTimeLeft({
        days: Math.floor(distance / 86_400_000),
        hours: Math.floor((distance % 86_400_000) / 3_600_000),
        minutes: Math.floor((distance % 3_600_000) / 60_000),
        seconds: Math.floor((distance % 60_000) / 1000),
      })
    }

    tick()
    const interval = setInterval(tick, 1000)
    return () => clearInterval(interval)
  }, [])

  const handleNotify = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!email) return
    // TODO: send `email` to your API / newsletter provider
    setSubmitted(true)
    setEmail("")
  }

  return (
    <div className="relative isolate min-h-screen flex items-center justify-center px-6 py-16 overflow-hidden bg-background">
      {/* Grid background, faded toward the edges */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-20 bg-[linear-gradient(to_right,rgba(128,128,128,0.14)_1px,transparent_1px),linear-gradient(to_bottom,rgba(128,128,128,0.14)_1px,transparent_1px)] bg-[size:56px_56px] [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_70%)]"
      />

      {/* Glow */}
      <div
        aria-hidden
        className="absolute left-1/2 top-1/3 -z-10 h-130 w-130 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/15 blur-3xl"
      />

      {/* Theme toggle */}
      <div className="absolute top-6 right-6">
        <Button
          variant="outline"
          size="icon"
          aria-label="Toggle theme"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="rounded-full bg-background/60 supports-backdrop-filter:backdrop-blur-md"
        >
          <Sun className="hidden h-4 w-4 dark:block" />
          <Moon className="h-4 w-4 dark:hidden" />
        </Button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative w-full max-w-2xl text-center"
      >
        {/* Badge */}
        <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border bg-background/60 px-3 py-1 text-xs font-medium text-muted-foreground supports-backdrop-filter:backdrop-blur-md">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          Launching soon
        </div>

        {/* Heading */}
        <h1 className="text-4xl md:text-6xl font-semibold tracking-tight text-foreground">
          Something exceptional
          <span className="block bg-linear-to-r from-primary to-primary/50 bg-clip-text text-transparent">
            is almost here
          </span>
        </h1>

        <p className="mx-auto mt-5 max-w-md text-sm md:text-base leading-relaxed text-muted-foreground">
          We&apos;re putting the finishing touches on something new. Leave your
          email and we&apos;ll let you know the moment it goes live.
        </p>

        {/* Countdown */}
        <div className="mt-10 grid grid-cols-4 gap-3 md:gap-4">
          {UNITS.map((unit, i) => (
            <motion.div
              key={unit}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.07, duration: 0.4 }}
              className="rounded-2xl border bg-background/60 py-5 md:py-7 shadow-sm supports-backdrop-filter:backdrop-blur-xl"
            >
              <div className="text-3xl md:text-5xl font-semibold tabular-nums tracking-tight text-foreground">
                {pad(timeLeft[unit])}
              </div>
              <div className="mt-2 text-[10px] md:text-xs font-medium uppercase tracking-widest text-muted-foreground">
                {unit}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Notify form */}
        <div className="mx-auto mt-10 max-w-md">
          {submitted ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center justify-center gap-2 rounded-xl border border-primary/30 bg-primary/10 px-4 py-3 text-sm font-medium text-foreground"
            >
              <Check className="h-4 w-4 text-primary" />
              You&apos;re on the list. We&apos;ll be in touch.
            </motion.div>
          ) : (
            <form
              onSubmit={handleNotify}
              className="flex flex-col gap-3 sm:flex-row"
            >
              <div className="relative flex-1">
                <Bell className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="email"
                  required
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-11 rounded-xl bg-background/60 pl-9"
                />
              </div>

              <Button type="submit" size="lg" className="h-11 rounded-xl px-6">
                Notify me
                <ArrowRight />
              </Button>
            </form>
          )}

          <p className="mt-3 text-xs text-muted-foreground">
            No spam. Unsubscribe anytime.
          </p>
        </div>
      </motion.div>
    </div>
  )
}