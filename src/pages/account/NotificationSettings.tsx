"use client"

import * as React from "react"
import { Bell, ShieldAlert } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"

type Setting = {
  id: string
  title: string
  description: string
}

const groups: {
  title: string
  icon: React.ComponentType<{ className?: string }>
  items: Setting[]
}[] = [
  {
    title: "General",
    icon: Bell,
    items: [
      {
        id: "newForYou",
        title: "New for you",
        description: "Product updates and recommendations picked for you",
      },
      {
        id: "accountActivity",
        title: "Account activity",
        description: "Changes and actions on your account",
      },
      {
        id: "weeklyReports",
        title: "Weekly reports",
        description: "A summary of your activity every week",
      },
    ],
  },
  {
    title: "Security",
    icon: ShieldAlert,
    items: [
      {
        id: "newBrowser",
        title: "New browser sign-in",
        description: "Get alerted when a new browser is used to sign in",
      },
      {
        id: "newDevice",
        title: "New device linked",
        description: "Get alerted when a new device is linked to your account",
      },
    ],
  },
]

const defaults: Record<string, boolean> = {
  newForYou: true,
  accountActivity: false,
  weeklyReports: false,
  newBrowser: false,
  newDevice: true,
}

export default function NotificationSettings() {
  const [settings, setSettings] = React.useState(defaults)

  const isDirty = React.useMemo(
    () => Object.keys(defaults).some((key) => settings[key] !== defaults[key]),
    [settings]
  )

  return (
    <div className="flex justify-center">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Notification Settings</CardTitle>
          <CardDescription>
            Choose what you want to be notified about.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-8 pb-6">
          {groups.map((group) => (
            <section key={group.title} className="space-y-3">
              <div className="text-muted-foreground flex items-center gap-2 text-xs font-medium tracking-wide uppercase">
                <group.icon className="size-4" />
                {group.title}
              </div>

              <div className="divide-y rounded-lg border">
                {group.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between gap-4 p-4"
                  >
                    <div className="space-y-0.5">
                      <Label htmlFor={item.id} className="text-sm font-medium">
                        {item.title}
                      </Label>
                      <p className="text-muted-foreground text-xs">
                        {item.description}
                      </p>
                    </div>
                    <Switch
                      id={item.id}
                      checked={settings[item.id]}
                      onCheckedChange={(checked) =>
                        setSettings((prev) => ({ ...prev, [item.id]: checked }))
                      }
                    />
                  </div>
                ))}
              </div>
            </section>
          ))}
        </CardContent>

        <CardFooter className="justify-end gap-2 border-t pt-6">
          <Button
            variant="ghost"
            disabled={!isDirty}
            onClick={() => setSettings(defaults)}
          >
            Cancel
          </Button>
          <Button disabled={!isDirty}>Save changes</Button>
        </CardFooter>
      </Card>
    </div>
  )
}