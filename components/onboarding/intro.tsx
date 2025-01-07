"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import Highlight from "@highlight-ai/app-runtime"
import { Sparkles, ArrowRight, Bot, Brain, Shield } from "lucide-react"

export function IntroScreen() {
  const router = useRouter()

  const handleNext = async () => {
    await Highlight.appStorage.set('hasSeenIntro', true)
    window.location.reload()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 p-8 flex items-center justify-center">
      <Card className="w-full max-w-2xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg shadow-xl rounded-2xl overflow-hidden border-0 dark:ring-1 dark:ring-white/10">
        <div className="p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
              Welcome to AutoTask
            </h1>
          </div>

          <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
            Your intelligent task companion that automatically captures and organizes tasks from your daily conversations and applications.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-blue-50/50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-100 dark:border-blue-800/50">
              <Bot className="h-6 w-6 text-blue-500 dark:text-blue-400 mb-2" />
              <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                AI-Powered
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Automatically detects tasks from your conversations
              </p>
            </div>

            <div className="bg-purple-50/50 dark:bg-purple-900/20 rounded-xl p-4 border border-purple-100 dark:border-purple-800/50">
              <Brain className="h-6 w-6 text-purple-500 dark:text-purple-400 mb-2" />
              <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                Smart Organization
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Intelligently categorizes and prioritizes your tasks
              </p>
            </div>

            <div className="bg-indigo-50/50 dark:bg-indigo-900/20 rounded-xl p-4 border border-indigo-100 dark:border-indigo-800/50">
              <Shield className="h-6 w-6 text-indigo-500 dark:text-indigo-400 mb-2" />
              <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                Privacy First
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Your data stays local and secure
              </p>
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              onClick={handleNext}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90 text-white px-8 py-6 h-auto text-lg group"
            >
              Get Started
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}