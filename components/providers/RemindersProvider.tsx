"use client"

import React, { createContext, useContext, useEffect, useState } from "react"
import { v4 as uuidv4 } from 'uuid'
import Highlight from "@highlight-ai/app-runtime"

export interface Reminder {
  id: string
  taskId: string
  time: string
  type: 'custom' | '1_hour_before' | '1_day_before' | 'at_due_time'
  status: 'pending' | 'sent' | 'dismissed' | 'snoozed'
  lastNotified?: string
  snoozeUntil?: string
}

interface RemindersContextType {
  reminders: Reminder[]
  addReminder: (taskId: string, time: string, type: Reminder['type']) => Promise<void>
  removeReminder: (id: string) => Promise<void>
  updateReminder: (id: string, updates: Partial<Reminder>) => Promise<void>
  dismissReminder: (id: string) => Promise<void>
  snoozeReminder: (id: string, snoozeUntil: string) => Promise<void>
  getTaskText: (taskId: string) => string
}

const RemindersContext = createContext<RemindersContextType | undefined>(undefined)

export function RemindersProvider({ children }: { children: React.ReactNode }) {
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [lastCheckTime, setLastCheckTime] = useState(0)
  const [tasks, setTasks] = useState<Record<string, string>>({})
  const [isInitialized, setIsInitialized] = useState(false)

  // Load reminders from storage on mount
  useEffect(() => {
    const loadReminders = async () => {
      try {
        const stored = await Highlight.appStorage.get('reminders')
        // Ensure we're getting an array, even if empty
        const loadedReminders = Array.isArray(stored) ? stored : []
        setReminders(loadedReminders)
        setIsInitialized(true)
        console.log('Loaded reminders:', loadedReminders) // Debug log
      } catch (error) {
        console.error('Error loading reminders:', error)
        setReminders([])
        setIsInitialized(true)
      }
    }
    loadReminders()
  }, [])

  // Save reminders to storage whenever they change
  useEffect(() => {
    if (!isInitialized) return // Don't save until initial load is complete
    const saveReminders = async () => {
      try {
        await Highlight.appStorage.set('reminders', reminders)
        console.log('Saved reminders:', reminders) // Debug log
      } catch (error) {
        console.error('Error saving reminders:', error)
      }
    }
    saveReminders()
  }, [reminders, isInitialized])

  // Check for due reminders periodically
  useEffect(() => {
    const checkReminders = async () => {
      const now = Date.now()
      if (now - lastCheckTime >= 60000) { // Check every minute
        setLastCheckTime(now)
        
        const updatedReminders = [...reminders]
        let hasUpdates = false

        for (const reminder of reminders) {
          // Skip dismissed reminders
          if (reminder.status === 'dismissed') continue
          
          // For snoozed reminders, check against snoozeUntil time
          if (reminder.status === 'snoozed') {
            if (!reminder.snoozeUntil || new Date(reminder.snoozeUntil) > new Date()) {
              continue
            }
          }
          
          const dueTime = new Date(reminder.time).getTime()
          if (dueTime <= now && (!reminder.lastNotified || new Date(reminder.lastNotified).getTime() < dueTime)) {
            // Show notification
            await Highlight.app.showNotification(
              'Task Reminder',
              `"${tasks[reminder.taskId]}" is due ${reminder.type === 'at_due_time' ? 'now' : 'soon'}!`
            )

            // Update reminder status
            const index = updatedReminders.findIndex(r => r.id === reminder.id)
            if (index !== -1) {
              updatedReminders[index] = {
                ...updatedReminders[index],
                lastNotified: new Date().toISOString()
              }
              hasUpdates = true
            }
          }
        }

        if (hasUpdates) {
          setReminders(updatedReminders)
        }
      }
    }

    const interval = setInterval(checkReminders, 60000)
    return () => clearInterval(interval)
  }, [reminders, lastCheckTime, tasks])

  // Load tasks from VectorDB
  const loadTasks = async () => {
    const allTasks = await Highlight.vectorDB.getAllItems('tasks')
    const taskMap: Record<string, string> = {}
    allTasks.forEach(task => {
      taskMap[task.id] = task.text
    })
    setTasks(taskMap)
  }

  useEffect(() => {
    loadTasks()
  }, [])

  const getTaskText = (taskId: string) => {
    return tasks[taskId] || 'Unknown task'
  }

  const addReminder = async (taskId: string, time: string, type: Reminder['type']) => {
    const newReminder: Reminder = {
      id: uuidv4(),
      taskId,
      time,
      type,
      status: 'pending'
    }
    try {
      const updatedReminders = [...reminders, newReminder]
      await Highlight.appStorage.set('reminders', updatedReminders)
      setReminders(updatedReminders)
      await loadTasks() // Reload tasks when adding a new reminder
    } catch (error) {
      console.error('Error adding reminder:', error)
    }
  }

  const removeReminder = async (id: string) => {
    try {
      const updatedReminders = reminders.filter(r => r.id !== id)
      await Highlight.appStorage.set('reminders', updatedReminders)
      setReminders(updatedReminders)
    } catch (error) {
      console.error('Error removing reminder:', error)
    }
  }

  const updateReminder = async (id: string, updates: Partial<Reminder>) => {
    try {
      const updatedReminders = reminders.map(r => 
        r.id === id ? { ...r, ...updates } : r
      )
      await Highlight.appStorage.set('reminders', updatedReminders)
      setReminders(updatedReminders)
      console.log('Updated reminder:', id, updates) // Debug log
    } catch (error) {
      console.error('Error updating reminder:', error)
    }
  }

  const dismissReminder = async (id: string) => {
    await removeReminder(id)
  }

  const snoozeReminder = async (id: string, snoozeUntil: string) => {
    const reminder = reminders.find(r => r.id === id)
    if (!reminder) return

    // Calculate the new due time by adding 15 minutes to the original time
    const newDueTime = new Date(reminder.time)
    newDueTime.setMinutes(newDueTime.getMinutes() + 15)

    await updateReminder(id, { 
      status: 'snoozed',
      snoozeUntil,
      time: newDueTime.toISOString(), // Update the due time
      lastNotified: undefined
    })
  }

  return (
    <RemindersContext.Provider value={{
      reminders,
      addReminder,
      removeReminder,
      updateReminder,
      dismissReminder,
      snoozeReminder,
      getTaskText
    }}>
      {children}
    </RemindersContext.Provider>
  )
}

export const useReminders = () => {
  const context = useContext(RemindersContext)
  if (context === undefined) {
    throw new Error('useReminders must be used within a RemindersProvider')
  }
  return context
} 