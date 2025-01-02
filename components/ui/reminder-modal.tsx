"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "./button"
import { Calendar, Clock, Bell } from "lucide-react"
import { format } from "date-fns"
import { DayPicker } from "react-day-picker"
import { cn } from "@/lib/utils"
import { useReminders } from "../providers/RemindersProvider"
import { createPortal } from 'react-dom'

interface ReminderModalProps {
  taskId: string
  dueDate?: string
  onClose: () => void
}

export function ReminderModal({ taskId, dueDate, onClose }: ReminderModalProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    dueDate ? new Date(dueDate) : undefined
  )
  const [selectedTime, setSelectedTime] = useState("12:00")
  const [reminderType, setReminderType] = useState<'custom' | '1_hour_before' | '1_day_before' | 'at_due_time'>('at_due_time')
  const [showCalendar, setShowCalendar] = useState(false)
  const calendarRef = useRef<HTMLDivElement>(null)
  
  const { addReminder } = useReminders()

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
        setShowCalendar(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSubmit = async () => {
    if (!selectedDate) return

    let reminderTime: Date
    const baseDate = new Date(selectedDate)
    const [hours, minutes] = selectedTime.split(":").map(Number)
    baseDate.setHours(hours, minutes)

    switch (reminderType) {
      case '1_hour_before':
        reminderTime = new Date(baseDate.getTime() - 60 * 60 * 1000)
        break
      case '1_day_before':
        reminderTime = new Date(baseDate.getTime() - 24 * 60 * 60 * 1000)
        break
      case 'at_due_time':
      case 'custom':
      default:
        reminderTime = baseDate
    }

    await addReminder(taskId, reminderTime.toISOString(), reminderType)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-[400px] p-4">
        <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-gray-100">
          Set Reminder
        </h3>

        <div className="space-y-3">
          <div>
            <Button
              variant="outline"
              className="w-full justify-between text-left font-normal"
              onClick={() => setShowCalendar(true)}
            >
              <span>{selectedDate ? format(selectedDate, 'PPP') : 'Pick a date'}</span>
              <Calendar className="h-4 w-4 opacity-50" />
            </Button>
            {showCalendar && createPortal(
              <div 
                ref={calendarRef}
                className="fixed bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 z-50"
                style={{
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)'
                }}
              >
                <DayPicker
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => {
                    setSelectedDate(date)
                    setShowCalendar(false)
                  }}
                  className={cn(
                    "p-3",
                    "bg-white dark:bg-gray-800",
                    "[&_table]:w-full",
                    "[&_table]:border-separate",
                    "[&_table]:border-spacing-1",
                    "[&_.rdp-head_cell]:w-10",
                    "[&_.rdp-head_cell]:h-10",
                    "[&_.rdp-head_cell]:font-medium",
                    "[&_.rdp-head_cell]:text-sm",
                    "[&_.rdp-head_cell]:text-gray-500",
                    "dark:[&_.rdp-head_cell]:text-gray-400",
                    "[&_.rdp-cell]:p-0",
                    "[&_.rdp-cell]:text-center",
                    "[&_.rdp-button]:w-10",
                    "[&_.rdp-button]:h-10",
                    "[&_.rdp-button]:text-sm",
                    "[&_.rdp-button]:rounded-md",
                    "[&_.rdp-button]:transition-all",
                    "[&_.rdp-button:hover:not(.rdp-day_selected)]:bg-blue-50/80",
                    "dark:[&_.rdp-button:hover:not(.rdp-day_selected)]:bg-blue-500/20",
                    "[&_.rdp-button:focus]:bg-blue-50",
                    "dark:[&_.rdp-button:focus]:bg-blue-500/20",
                    "[&_.rdp-day_selected]:bg-blue-500",
                    "dark:[&_.rdp-day_selected]:bg-blue-600",
                    "[&_.rdp-day_selected]:text-white",
                    "[&_.rdp-day_selected]:font-medium",
                    "[&_.rdp-day_selected]:hover:bg-blue-500",
                    "dark:[&_.rdp-day_selected]:hover:bg-blue-600",
                    "[&_.rdp-day_today]:bg-gray-100/50",
                    "dark:[&_.rdp-day_today]:bg-gray-800/50",
                    "[&_.rdp-day_today]:font-medium",
                    "[&_.rdp-button_disabled]:opacity-50",
                    "[&_.rdp-button_disabled]:cursor-not-allowed",
                    "[&_.rdp-button_disabled]:hover:bg-transparent"
                  )}
                />
              </div>,
              document.body
            )}
          </div>

          <div>
            <input
              type="time"
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
              className="w-full px-3 py-2 rounded-md border dark:border-gray-700 dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
            />
          </div>

          <div>
            <select
              value={reminderType}
              onChange={(e) => setReminderType(e.target.value as any)}
              className="w-full px-3 py-2 rounded-md border dark:border-gray-700 dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
            >
              <option value="at_due_time">At due time</option>
              <option value="1_hour_before">1 hour before</option>
              <option value="1_day_before">1 day before</option>
              <option value="custom">Custom time</option>
            </select>
          </div>
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            <Bell className="w-4 h-4 mr-2" />
            Set Reminder
          </Button>
        </div>
      </div>
    </div>
  )
} 