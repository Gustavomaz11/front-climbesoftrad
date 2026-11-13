import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { ColoredProgress } from "@/components/colored-progress"

type ProjectProgressCardProps = {
  title: string
  name: string
  role: string
  avatar: string
  progress: number
  progressColor: string
}

export default function ProjectProgressCard({
  title,
  name,
  role,
  avatar,
  progress,
  progressColor,
}: ProjectProgressCardProps) {
  return (
    <Card className="rounded-xl shadow-xs">
      <CardContent className="space-y-4">
        <h3 className="text-base font-semibold">{title}</h3>

        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={avatar} alt={name} />
            <AvatarFallback>{name.charAt(0)}</AvatarFallback>
          </Avatar>

          <div>
            <p className="text-sm font-medium">{name}</p>
            <p className="text-xs text-muted-foreground">{role}</p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">
              Projects Progress
            </span>
            <span className="font-medium">{progress}%</span>
          </div>

          <ColoredProgress
            value={progress}
            indicatorClassName={progressColor}
          />
        </div>
      </CardContent>
    </Card>
  )
}