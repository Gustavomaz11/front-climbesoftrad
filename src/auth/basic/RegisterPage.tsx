import { Link } from "react-router-dom"
import { useState } from "react"
import { ArrowRight, Eye, EyeOff, Sparkles } from "lucide-react"
import { FaGithub } from "react-icons/fa6"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false)

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
          Already have an account?{" "}
          <Link
            to="/auth/basic/login"
            className="font-medium text-foreground hover:underline"
          >
            Sign in
          </Link>
        </div>
      </header>

      {/* Main */}
      <main className="flex flex-1 flex-col items-center justify-center px-4 pb-10">
        <div className="w-full max-w-md rounded-xl border border-border/60 bg-card/80 p-8 shadow-xl backdrop-blur-lg">
          <div className="text-center">
            <h1 className="text-2xl font-semibold tracking-tight">
              Create your account.
            </h1>

            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Sign up to start your Codervent account and begin
              building faster.
            </p>
          </div>

          {/* Social signup */}
          <div className="mt-8 flex flex-col gap-3">
            <Button variant="outline" className="h-9">
              <GoogleIcon />
              Sign up with Google
            </Button>

            <Button variant="outline" className="h-9">
              <FaGithub className="size-4.5" />
              Sign up with GitHub
            </Button>
          </div>

          {/* Divider */}
          <div className="my-6 flex items-center gap-3">
            <Separator className="flex-1" />

            <span className="text-xs text-muted-foreground">
              or sign up with email
            </span>

            <Separator className="flex-1" />
          </div>

          {/* Name + email + password form */}
          <form className="flex flex-col gap-4">
            <div className="grid gap-1.5">
              <Label htmlFor="name" className="text-sm font-medium">
                Full name
              </Label>

              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                autoComplete="name"
                className="h-9 bg-background px-3"
                required
              />
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="email" className="text-sm font-medium">
                Email address
              </Label>

              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                className="h-9 bg-background px-3"
                required
              />
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="password" className="text-sm font-medium">
                Password
              </Label>

              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="At least 8 characters"
                  autoComplete="new-password"
                  minLength={8}
                  className="h-9 pr-9 bg-background px-3"
                  required
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  aria-pressed={showPassword}
                >
                  {showPassword ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              </div>
            </div>

            <Button type="submit" className="mt-1 h-9 bg-linear-to-r from-pink-500 to-purple-600 text-white">
              Create account
              <ArrowRight className="h-4 w-4" />
            </Button>
          </form>

          {/* Terms */}
          <p className="mt-6 text-center text-xs leading-relaxed text-muted-foreground">
            By creating an account, you agree to Codervent&apos;s{" "}
            <Link
              to="/terms"
              className="underline hover:text-foreground"
            >
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link to="/privacy" className="underline hover:text-foreground">
              Privacy Policy
            </Link>
            .
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