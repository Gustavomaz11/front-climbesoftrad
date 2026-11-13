"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Link } from "react-router-dom"
import { useTheme } from "next-themes"
import { Sun, Moon, RotateCw, Home, ServerCrash, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function Error500() {
  const { theme, setTheme } = useTheme()
  const [retrying, setRetrying] = useState(false)

  const handleRetry = () => {
    setRetrying(true)
    setTimeout(() => window.location.reload(), 600)
  }

  return (
    <div className="relative isolate min-h-screen flex items-center justify-center px-6 py-16 overflow-hidden bg-background">
      {/* Grid background, faded toward the edges */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-20 bg-[linear-gradient(to_right,rgba(128,128,128,0.14)_1px,transparent_1px),linear-gradient(to_bottom,rgba(128,128,128,0.14)_1px,transparent_1px)] bg-[size:56px_56px] [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_70%)]"
      />

      {/* Soft glow */}
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

      {/* Watermark number */}
      <span
        aria-hidden
        className="pointer-events-none absolute select-none text-[240px] md:text-[380px] font-bold leading-none tracking-tighter text-foreground/4"
      >
        500
      </span>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative w-full max-w-md text-center"
      >
        {/* Icon with pulse ring */}
        <div className="relative mx-auto mb-8 flex h-20 w-20 items-center justify-center">
          <span className="absolute inset-0 animate-ping rounded-2xl bg-destructive/20 [animation-duration:2.5s]" />
          <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl border border-destructive/30 bg-background shadow-lg shadow-destructive/10">
            <ServerCrash className="h-9 w-9 text-destructive" strokeWidth={1.75} />
          </div>
        </div>

        {/* Status chip */}
        <div className="mx-auto mb-5 inline-flex items-center gap-2 rounded-full border bg-background/60 px-3 py-1 text-xs font-medium text-muted-foreground supports-backdrop-filter:backdrop-blur-md">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-destructive opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-destructive" />
          </span>
          Error 500
        </div>

        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-foreground">
          Something broke on our end
        </h1>

        <p className="mx-auto mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
          The server hit an unexpected problem and couldn&apos;t finish your request.
          It&apos;s not you. Try again in a moment, or head back home.
        </p>

        {/* Actions */}
        <div className="mt-8 flex flex-col-reverse items-center justify-center gap-3 sm:flex-row">
          <Button
            variant="outline"
            size="lg"
            onClick={handleRetry}
            disabled={retrying}
            className="w-full rounded-xl sm:w-auto"
          >
            <RotateCw className={retrying ? "animate-spin" : ""} />
            {retrying ? "Retrying..." : "Try again"}
          </Button>

          <Button asChild size="lg" className="w-full rounded-xl sm:w-auto">
            <Link to="/">
              <Home />
              Back to home
            </Link>
          </Button>
        </div>

        {/* Footer help */}
        <div className="mt-10 border-t pt-6">
          <a
            href="mailto:support@example.com"
            className="inline-flex items-center gap-2 text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            <Mail className="h-3.5 w-3.5" />
            Still happening? Contact support
          </a>
        </div>
      </motion.div>
    </div>
  )
}