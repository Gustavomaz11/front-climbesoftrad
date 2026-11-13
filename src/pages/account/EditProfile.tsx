"use client"

import * as React from "react"
import { Camera, Lock, ShieldCheck, Share2, User } from "lucide-react"
import {
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaTwitter,
} from "react-icons/fa"

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
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"

const BIO_LIMIT = 200

const socials = [
  { id: "facebook", name: "Facebook", icon: FaFacebookF, color: "bg-blue-600" },
  { id: "twitter", name: "Twitter", icon: FaTwitter, color: "bg-sky-500" },
  { id: "instagram", name: "Instagram", icon: FaInstagram, color: "bg-pink-600" },
  { id: "linkedin", name: "LinkedIn", icon: FaLinkedinIn, color: "bg-sky-700" },
]

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string
  htmlFor: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
    </div>
  )
}

export default function EditProfile() {
  const [bio, setBio] = React.useState("")
  const [twoFactor, setTwoFactor] = React.useState(false)
  const [connected, setConnected] = React.useState<Record<string, boolean>>({})

  return (
    <div className="flex justify-center">
      <Card className="w-full max-w-3xl">
        <CardHeader>
          <CardTitle>Edit Profile</CardTitle>
          <CardDescription>
            Manage your personal information, security and connected accounts.
          </CardDescription>
        </CardHeader>

        <Tabs defaultValue="profile" className="w-full">
          <div className="px-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="profile" className="gap-2">
                <User className="size-4" />
                Profile
              </TabsTrigger>
              <TabsTrigger value="security" className="gap-2">
                <Lock className="size-4" />
                Security
              </TabsTrigger>
              <TabsTrigger value="social" className="gap-2">
                <Share2 className="size-4" />
                Social
              </TabsTrigger>
            </TabsList>
          </div>

          {/* PROFILE */}
          <TabsContent value="profile">
            <CardContent className="space-y-8 py-6">
              <div className="flex flex-wrap items-center gap-6">
                <div className="relative">
                  <img
                    src="https://randomuser.me/api/portraits/men/32.jpg"
                    alt="Profile avatar"
                    className="size-24 rounded-full object-cover ring-4 ring-muted"
                  />
                  <button
                    type="button"
                    aria-label="Change photo"
                    className="bg-primary text-primary-foreground absolute right-0 bottom-0 flex size-8 items-center justify-center rounded-full border-2 border-background shadow"
                  >
                    <Camera className="size-4" />
                  </button>
                </div>
                <div className="space-y-1">
                  <p className="font-medium">Profile photo</p>
                  <p className="text-muted-foreground text-sm">
                    1200x1200 px, PNG or JPG
                  </p>
                  <Button variant="outline" size="sm" className="mt-2">
                    Upload new image
                  </Button>
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Full name" htmlFor="name">
                  <Input id="name" placeholder="John Doe" />
                </Field>
                <Field label="Location" htmlFor="location">
                  <Input id="location" placeholder="City, Country" />
                </Field>
                <div className="space-y-2 sm:col-span-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="bio">Bio</Label>
                    <span className="text-muted-foreground text-xs tabular-nums">
                      {bio.length}/{BIO_LIMIT}
                    </span>
                  </div>
                  <Textarea
                    id="bio"
                    value={bio}
                    maxLength={BIO_LIMIT}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Write something about yourself..."
                    className="min-h-[120px] resize-none"
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="justify-end gap-2 border-t pt-6">
              <Button variant="ghost">Cancel</Button>
              <Button>Save profile</Button>
            </CardFooter>
          </TabsContent>

          {/* SECURITY */}
          <TabsContent value="security">
            <CardContent className="space-y-8 py-6">
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Field label="Current password" htmlFor="current">
                    <Input id="current" type="password" />
                  </Field>
                </div>
                <Field label="New password" htmlFor="new">
                  <Input id="new" type="password" />
                </Field>
                <Field label="Confirm password" htmlFor="confirm">
                  <Input id="confirm" type="password" />
                </Field>
              </div>

              <div className="flex items-center justify-between gap-4 rounded-lg border p-4">
                <div className="flex items-center gap-3">
                  <div className="bg-muted flex size-10 items-center justify-center rounded-full">
                    <ShieldCheck className="size-5" />
                  </div>
                  <div>
                    <p className="font-medium">Two-factor authentication</p>
                    <p className="text-muted-foreground text-sm">
                      Add an extra layer of security to your account
                    </p>
                  </div>
                </div>
                <Switch checked={twoFactor} onCheckedChange={setTwoFactor} />
              </div>
            </CardContent>
            <CardFooter className="justify-end gap-2 border-t pt-6">
              <Button variant="ghost">Cancel</Button>
              <Button>Update security</Button>
            </CardFooter>
          </TabsContent>

          {/* SOCIAL */}
          <TabsContent value="social">
            <CardContent className="space-y-3 py-6">
              {socials.map((s) => (
                <div
                  key={s.id}
                  className="flex items-center justify-between gap-4 rounded-lg border p-4"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`${s.color} flex size-10 items-center justify-center rounded-full text-white`}
                    >
                      <s.icon className="size-4" />
                    </div>
                    <div>
                      <p className="font-medium">{s.name}</p>
                      <p className="text-muted-foreground text-xs">
                        {connected[s.id] ? "Connected" : "Not connected"}
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={!!connected[s.id]}
                    onCheckedChange={(v) =>
                      setConnected((prev) => ({ ...prev, [s.id]: v }))
                    }
                  />
                </div>
              ))}
            </CardContent>
            <CardFooter className="justify-end gap-2 border-t pt-6">
              <Button variant="ghost">Cancel</Button>
              <Button>Save social settings</Button>
            </CardFooter>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  )
}