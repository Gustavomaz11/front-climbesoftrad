import { Link, useNavigate } from "react-router-dom"
import { useState } from "react"
import { ArrowLeft, ArrowRight, Eye, EyeOff, Sparkles } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function ResetPasswordForm() {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")

  const mismatch = confirm.length > 0 && password !== confirm

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (password !== confirm) return
    // call your reset-password API here (with the token from the email link)
    navigate("/login")
  }

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
          Remembered your password?{" "}
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
        <div className="w-full max-w-md rounded-xl border border-border/80 bg-card/60 p-8 shadow-xl backdrop-blur-lg">
          <div className="text-center">
            <h1 className="text-2xl font-semibold tracking-tight">
              Set a new password.
            </h1>

            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Choose a new password for your Codervent account. Make sure
              it&apos;s at least 8 characters long.
            </p>
          </div>

          {/* Password form */}
          <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
            <div className="grid gap-1.5">
              <Label htmlFor="password" className="text-sm font-medium">
                New password
              </Label>

              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="At least 8 characters"
                  autoComplete="new-password"
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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

            <div className="grid gap-1.5">
              <Label htmlFor="confirm-password" className="text-sm font-medium">
                Confirm new password
              </Label>

              <div className="relative">
                <Input
                  id="confirm-password"
                  type={showConfirm ? "text" : "password"}
                  placeholder="Re-enter your password"
                  autoComplete="new-password"
                  minLength={8}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  aria-invalid={mismatch}
                  className="h-9 pr-9 bg-background px-3"
                  required
                />

                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                  aria-label={
                    showConfirm ? "Hide confirm password" : "Show confirm password"
                  }
                  aria-pressed={showConfirm}
                >
                  {showConfirm ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              </div>

              {mismatch && (
                <p className="text-xs text-destructive">
                  Passwords don&apos;t match.
                </p>
              )}
            </div>

            <Button type="submit" className="mt-1 h-9 bg-linear-to-r from-pink-500 to-purple-600 text-white" disabled={mismatch}>
              Reset password
              <ArrowRight className="h-4 w-4" />
            </Button>
          </form>

          {/* Back link */}
          <div className="mt-6 flex justify-center">
            <Link
              to="/auth/basic/login"
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
            >
              <ArrowLeft className="size-4" />
              Back to sign in
            </Link>
          </div>
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