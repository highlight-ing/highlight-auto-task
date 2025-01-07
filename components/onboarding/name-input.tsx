"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useName } from "../providers/NameProvider"
import { UserCircle2, ArrowRight } from "lucide-react"

export function NameInputScreen() {
  const router = useRouter()
  const { handleNameUpdate } = useName()
  const [nameInput, setNameInput] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!nameInput.trim()) {
      setError("Please enter your name")
      return
    }

    handleNameUpdate(nameInput.trim())
    window.location.reload()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 p-8 flex items-center justify-center">
      <Card className="w-full max-w-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg shadow-xl rounded-2xl overflow-hidden border-0 dark:ring-1 dark:ring-white/10">
        <div className="p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
              <UserCircle2 className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              What&apos;s your name?
            </h1>
          </div>

          <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
            We&apos;ll use this to personalize your experience and detect tasks assigned to you in conversations and applications.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Input
                type="text"
                placeholder="Enter your name"
                value={nameInput}
                onChange={(e) => {
                  setNameInput(e.target.value)
                  setError("")
                }}
                className={`w-full text-lg py-6 px-4 ${
                  error
                    ? 'border-red-500 dark:border-red-500'
                    : 'border-gray-200 dark:border-gray-700'
                }`}
              />
              {error && (
                <p className="mt-2 text-sm text-red-500 dark:text-red-400">{error}</p>
              )}
            </div>

            <div className="flex justify-end">
              <Button
                type="submit"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90 text-white px-8 py-6 h-auto text-lg group"
              >
                Continue
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  )
}