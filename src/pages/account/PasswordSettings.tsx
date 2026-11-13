"use client"

import * as React from "react"
import { Check, Eye, EyeOff, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

function PasswordInput({
  id,
  label,
  value,
  onChange,
  placeholder,
}: {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
}) {
  const [show, setShow] = React.useState(false)

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <Input
          id={id}
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="pr-10"
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          aria-label={show ? "Hide password" : "Show password"}
          className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2"
        >
          {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </button>
      </div>
    </div>
  )
}

const strengthLabels = ["Too weak", "Weak", "Fair", "Good", "Strong"]
const strengthColors = [
  "bg-muted",
  "bg-red-500",
  "bg-orange-500",
  "bg-yellow-500",
  "bg-green-500",
]

export default function PasswordSettings() {
  const [oldPassword, setOldPassword] = React.useState("")
  const [newPassword, setNewPassword] = React.useState("")
  const [confirmPassword, setConfirmPassword] = React.useState("")

  const rules = [
    { label: "At least 8 characters", ok: newPassword.length >= 8 },
    { label: "One uppercase letter", ok: /[A-Z]/.test(newPassword) },
    { label: "One number", ok: /\d/.test(newPassword) },
    { label: "One special character", ok: /[^A-Za-z0-9]/.test(newPassword) },
  ]
  const score = rules.filter((r) => r.ok).length
  const matches = confirmPassword.length > 0 && confirmPassword === newPassword
  const canSave =
    oldPassword.length > 0 && newPassword.length >= 8 && matches

  return (
    <div className="flex justify-center">
      <Card className="w-full max-w-xl">
        <CardHeader>
          <CardTitle>Password</CardTitle>
          <CardDescription>
            Choose a strong password you don&apos;t use anywhere else.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6 pb-6">
          <PasswordInput
            id="oldPassword"
            label="Current password"
            value={oldPassword}
            onChange={setOldPassword}
            placeholder="Enter current password"
          />

          <div className="space-y-3">
            <PasswordInput
              id="newPassword"
              label="New password"
              value={newPassword}
              onChange={setNewPassword}
              placeholder="Enter new password"
            />

            {newPassword.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="grid flex-1 grid-cols-4 gap-1.5">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className={cn(
                          "h-1.5 rounded-full transition-colors",
                          i <= score ? strengthColors[score] : "bg-muted"
                        )}
                      />
                    ))}
                  </div>
                  <span className="text-muted-foreground w-16 text-right text-xs">
                    {strengthLabels[score]}
                  </span>
                </div>

                <ul className="grid gap-1.5 sm:grid-cols-2">
                  {rules.map((rule) => (
                    <li
                      key={rule.label}
                      className={cn(
                        "flex items-center gap-2 text-xs",
                        rule.ok ? "text-green-600" : "text-muted-foreground"
                      )}
                    >
                      {rule.ok ? (
                        <Check className="size-3.5" />
                      ) : (
                        <X className="size-3.5" />
                      )}
                      {rule.label}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <PasswordInput
              id="confirmPassword"
              label="Confirm new password"
              value={confirmPassword}
              onChange={setConfirmPassword}
              placeholder="Re-enter new password"
            />
            {confirmPassword.length > 0 && (
              <p
                className={cn(
                  "text-xs",
                  matches ? "text-green-600" : "text-destructive"
                )}
              >
                {matches ? "Passwords match" : "Passwords do not match"}
              </p>
            )}
          </div>
        </CardContent>

        <CardFooter className="justify-end gap-2 border-t pt-6">
          <Button
            variant="ghost"
            onClick={() => {
              setOldPassword("")
              setNewPassword("")
              setConfirmPassword("")
            }}
          >
            Cancel
          </Button>
          <Button disabled={!canSave}>Save changes</Button>
        </CardFooter>
      </Card>
    </div>
  )
}