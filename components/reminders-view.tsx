"use client"

import { useReminders } from "./providers/RemindersProvider"
import type { Reminder } from "./providers/RemindersProvider"
import { Card, CardContent } from "./ui/card"
import { Button } from "./ui/button"
import { Bell, Check, Clock, Trash2, X } from "lucide-react"
import { format, differenceInMinutes, isPast } from "date-fns"
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"

export function RemindersView() {
  const { reminders, dismissReminder, removeReminder, snoozeReminder, getTaskText } = useReminders()
  const [timeLeft, setTimeLeft] = useState<Record<string, number>>({})

  const pendingReminders = reminders

  const isOverdue = (reminder: Reminder) => {
    return isPast(new Date(reminder.time)) && !timeLeft[reminder.id]
  }

  useEffect(() => {
    const updateTimeLeft = () => {
      const now = new Date()
      const newTimeLeft: Record<string, number> = {}
      
      reminders.forEach(reminder => {
        if (reminder.status === 'snoozed' && reminder.snoozeUntil) {
          const minutes = differenceInMinutes(new Date(reminder.snoozeUntil), now)
          if (minutes > 0) {
            newTimeLeft[reminder.id] = minutes
          }
        }
      })
      
      setTimeLeft(newTimeLeft)
    }

    updateTimeLeft()
    const interval = setInterval(updateTimeLeft, 60000)
    
    return () => clearInterval(interval)
  }, [reminders])

  const handleSnooze = (id: string) => {
    const snoozeTime = new Date()
    snoozeTime.setMinutes(snoozeTime.getMinutes() + 15)
    snoozeReminder(id, snoozeTime.toISOString())
    setTimeLeft(prev => ({ ...prev, [id]: 15 }))
  }

  const getReminderTypeText = (type: string) => {
    switch(type) {
      case 'at_due_time': return 'At due time'
      case '1_hour_before': return '1 hour before'
      case '1_day_before': return '1 day before'
      case 'custom': return 'Custom time'
      default: return type
    }
  }

  if (pendingReminders.length === 0) {
    return null
  }

  return (
    <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg shadow-xl rounded-2xl overflow-hidden border-0 dark:ring-1 dark:ring-white/10">
      <div className="p-4 border-b dark:border-gray-800">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
          Upcoming Reminders
        </h2>
      </div>
      <CardContent className="p-4">
        <div className="space-y-3">
          {pendingReminders.map((reminder) => (
            <div 
              key={reminder.id}
              className={cn(
                "p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg border transition-all duration-300",
                isOverdue(reminder)
                  ? "border-red-400 dark:border-red-500/50 shadow-[0_0_15px_-3px_rgba(239,68,68,0.3)] dark:shadow-[0_0_15px_-3px_rgba(239,68,68,0.2)]"
                  : "border-gray-100 dark:border-gray-700/50"
              )}
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Bell className={cn(
                    "w-4 h-4 flex-shrink-0",
                    isOverdue(reminder)
                      ? "text-red-500"
                      : "text-blue-500"
                  )} />
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 line-clamp-2">
                    {getTaskText(reminder.taskId)}
                  </p>
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 ml-6">
                  <Clock className="w-3 h-3 flex-shrink-0" />
                  <span className={cn(
                    isOverdue(reminder) && "text-red-500 dark:text-red-400"
                  )}>
                    {isOverdue(reminder) ? "Overdue" : getReminderTypeText(reminder.type)} • {format(new Date(reminder.time), 'MMM d, h:mm a')}
                  </span>
                </div>
              </div>
              <div className="mt-3 space-y-2">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => dismissReminder(reminder.id)}
                    className="flex-1 text-green-600 hover:text-green-700 border-green-200 hover:bg-green-50"
                  >
                    <Check className="w-4 h-4 mr-1" />
                    Accept
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeReminder(reminder.id)}
                    className="flex-1 text-red-600 hover:text-red-700 border-red-200 hover:bg-red-50"
                  >
                    <X className="w-4 h-4 mr-1" />
                    Decline
                  </Button>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSnooze(reminder.id)}
                  className={cn(
                    "w-full border-gray-200",
                    timeLeft[reminder.id]
                      ? "text-blue-600 hover:text-blue-700 border-blue-200 hover:bg-blue-50"
                      : "text-gray-600 hover:text-gray-700 hover:bg-gray-50"
                  )}
                  disabled={timeLeft[reminder.id] > 0}
                >
                  <Clock className="w-4 h-4 mr-1" />
                  {timeLeft[reminder.id]
                    ? `Snoozed (${timeLeft[reminder.id]}m left)`
                    : "Snooze 15m"
                  }
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
} 