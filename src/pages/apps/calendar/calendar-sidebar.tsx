"use client"

import { useMemo } from "react"

import { Calendar } from "@/components/ui/calendar"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  EVENT_TYPES,
  EVENT_TYPE_CONFIG,
  type CalendarEvent,
  type EventType,
} from "./calendar-data"
import { formatShortWhen, startOfDay } from "./calendar-utils"

interface CalendarSidebarProps {
  currentDate: Date
  onDateChange: (date: Date) => void
  events: CalendarEvent[]
  upcomingEvents: CalendarEvent[]
  typeCounts: Record<EventType, number>
  activeTypes: EventType[]
  onToggleType: (type: EventType) => void
  onEventClick: (event: CalendarEvent) => void
}

export function CalendarSidebar({
  currentDate,
  onDateChange,
  events,
  upcomingEvents,
  typeCounts,
  activeTypes,
  onToggleType,
  onEventClick,
}: CalendarSidebarProps) {
  const eventDays = useMemo(
    () => events.map((event) => startOfDay(event.start)),
    [events],
  )

return (
  <aside className="hidden w-72 min-h-0 shrink-0 xl:flex flex-col gap-4">
    <ScrollArea className="h-full [&>[data-radix-scroll-area-viewport]>div]:!block">
      <div className="flex flex-col gap-4">
        {/* Mini calendar */}
        <div className="rounded-xl border bg-card gap-4 overflow-hidden">
          <Calendar
            key={`${currentDate.getFullYear()}-${currentDate.getMonth()}`}
            mode="single"
            selected={currentDate}
            defaultMonth={currentDate}
            onSelect={(date) => date && onDateChange(startOfDay(date))}
            modifiers={{ hasEvents: eventDays }}
            modifiersClassNames={{ hasEvents: "font-semibold" }}
            className="w-full"
          />
        </div>

        {/* Type filters */}
        <div className="rounded-xl border bg-card p-3">
          <h3 className="mb-2 px-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Event types
          </h3>
          <div className="space-y-0.5">
            {EVENT_TYPES.map((type) => {
              const config = EVENT_TYPE_CONFIG[type]
              const active = activeTypes.includes(type)
              return (
                <label
                  key={type}
                  className="flex w-full cursor-pointer items-center gap-2.5 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-muted"
                >
                  <Checkbox
                    checked={active}
                    onCheckedChange={() => onToggleType(type)}
                  />
                  <span className={`h-2.5 w-2.5 rounded-full ${config.dot}`} />
                  <span className="flex-1 text-left">{config.label}</span>
                  <span className="text-xs text-muted-foreground">
                    {typeCounts[type]}
                  </span>
                </label>
              )
            })}
          </div>
        </div>

        {/* Upcoming */}
        <div className="rounded-xl border bg-card p-3">
          <h3 className="mb-2 px-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Upcoming
          </h3>
          {upcomingEvents.length === 0 ? (
            <p className="px-2 py-3 text-sm text-muted-foreground">
              No upcoming events.
            </p>
          ) : (
            <div className="space-y-1">
              {upcomingEvents.map((event) => (
                <button
                  key={event.id}
                  type="button"
                  onClick={() => onEventClick(event)}
                  className="flex w-full items-stretch gap-2.5 rounded-md px-2 py-1.5 text-left transition-colors hover:bg-muted"
                >
                  <span
                    className={`w-1 shrink-0 rounded-full ${EVENT_TYPE_CONFIG[event.type].dot}`}
                  />
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium">
                      {event.title}
                    </span>
                    <span className="block text-xs text-muted-foreground">
                      {formatShortWhen(event)}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </ScrollArea>
  </aside>
)
}
