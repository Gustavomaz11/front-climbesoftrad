import { Link } from "react-router-dom"
import { ArrowRight, CheckCircle2, Sparkles } from "lucide-react"

import { Button } from "@/components/ui/button"

export function PasswordResetSuccess() {
  return (
    <div className="relative flex min-h-screen w-full flex-col isolate bg-background/0 text-foreground">
      {/* Background texture — muted */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      >
        {/* Muted tone wash */}
        <div className="absolute left-1/2 top-0 h-[460px] w-[680px] -translate-x-1/2 -translate-y-1/3 rounded-full bg-muted-foreground/10 blur-3xl" />
        <div className="absolute right-[12%] bottom-0 h-[320px] w-[320px] translate-y-1/3 rounded-full bg-muted-foreground/10 blur-3xl" />

        {/* Film grain (below the grid) */}
        <svg className="absolute inset-0 h-full w-full opacity-[0.1] dark:opacity-[0.05]">
          <filter id="auth4-grain">
            <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="3" stitchTiles="stitch" />
            <feColorMatrix type="saturate" values="0" />
          </filter>
          <rect width="100%" height="100%" filter="url(#auth4-grain)" />
        </svg>

        {/* Grid lines — follow the theme's --border */}
        <div className="absolute inset-0 [background-image:linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] [background-size:40px_40px]" />
      </div>

      {/* Header */}
      <header className="flex flex-col items-center justify-between gap-4 px-8 py-6 md:flex-row">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-foreground text-background">
            <Sparkles className="size-5" />
          </div>

          <span className="text-lg font-semibold">Codervent</span>
        </div>

        <div className="text-sm text-muted-foreground">
          Need help?{" "}
          <Link
            to="/contact"
            className="font-medium text-foreground hover:underline"
          >
            Contact support
          </Link>
        </div>
      </header>

      {/* Main */}
      <main className="flex flex-1 flex-col items-center justify-center px-4 pb-10">
        <div className="w-full max-w-md rounded-xl border border-border/60 bg-card/80 p-8 shadow-xl backdrop-blur-lg">
          <div className="text-center">
            <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-full border border-border/60 bg-background">
              <CheckCircle2 className="size-5 text-emerald-600 dark:text-emerald-400" />
            </div>

            <h1 className="text-2xl font-semibold tracking-tight">
              Password reset.
            </h1>

            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Your password has been updated. You can now sign in to your
              Codervent account with your new password.
            </p>
          </div>

          {/* Action */}
          <div className="mt-8">
            <Button asChild className="h-9 w-full bg-linear-to-r from-pink-500 to-purple-600 text-white">
              <Link to="/login">
                Continue to sign in
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          {/* Help */}
          <p className="mt-6 text-center text-xs leading-relaxed text-muted-foreground">
            Didn&apos;t make this change? Reset your password again or{" "}
            <Link
              to="/contact"
              className="underline hover:text-foreground"
            >
              contact support
            </Link>
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="flex flex-col items-center gap-5 px-4 pb-8 text-center">
        <p className="text-sm text-muted-foreground">
          Join thousands of developers building faster with Codervent
        </p>

        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 opacity-60 grayscale">
          <span className="text-base font-semibold tracking-tight">
            ANTHROPIC
          </span>

          <span className="flex items-center gap-1.5 text-base font-semibold">
            <span className="text-foreground">⚡</span>
            supabase
          </span>

          <span className="text-base font-bold">
            NVIDIA.
          </span>

          <span className="text-base font-semibold italic">
            Resend
          </span>

          <span className="flex items-center gap-1.5 text-base font-medium">
            <span>✦</span>
            OpenAI
          </span>
        </div>
      </footer>
    </div>
  )
}