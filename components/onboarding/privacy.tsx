"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import Highlight from "@highlight-ai/app-runtime"
import { AlertTriangle, Shield, Eye, Lock, Server } from "lucide-react"

export function PrivacyScreen() {
  const router = useRouter()

  const handleChoice = async (choice: 'agree' | 'disagree') => {
    try {
      await Highlight.appStorage.set('privacyChoice', choice)

      if (Highlight.reporting?.trackEvent) {
        await Highlight.reporting.trackEvent('Privacy Policy', {
          action: choice === 'agree' ? 'Agreed' : 'Disagreed'
        })
      }

      if (Highlight.reporting?.trackEvent) {
        await Highlight.reporting.trackEvent('Privacy Choice', {
          choice: choice
        })
      }

      const url = new URL(window.location.href)
      url.searchParams.delete('settings')
      window.history.replaceState({}, '', url.toString())

      window.location.reload()
    } catch (error) {
      console.error('Error handling privacy choice:', error)
      window.location.reload()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 p-8 flex items-center justify-center">
      <Card className="w-full max-w-2xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg shadow-xl rounded-2xl overflow-hidden border-0 dark:ring-1 dark:ring-white/10">
        <div className="p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Privacy Notice
            </h1>
          </div>

          <div className="space-y-6 mb-8">
            <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
              AutoTask uses advanced AI to analyze your screen content and conversations for task detection. While all your data is stored locally on your device, the content is processed through our cloud-based AI models to enable automatic task detection.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-50/50 dark:bg-gray-800/50 rounded-xl p-4 border border-gray-100 dark:border-gray-700/50">
                <Eye className="h-5 w-5 text-gray-500 dark:text-gray-400 mb-2" />
                <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-1 text-sm">
                  Screen Analysis
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Analyzes visible content for tasks in real-time
                </p>
              </div>

              <div className="bg-gray-50/50 dark:bg-gray-800/50 rounded-xl p-4 border border-gray-100 dark:border-gray-700/50">
                <Server className="h-5 w-5 text-gray-500 dark:text-gray-400 mb-2" />
                <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-1 text-sm">
                  Cloud Processing
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Content processed by cloud AI models for detection
                </p>
              </div>

              <div className="bg-gray-50/50 dark:bg-gray-800/50 rounded-xl p-4 border border-gray-100 dark:border-gray-700/50">
                <Lock className="h-5 w-5 text-gray-500 dark:text-gray-400 mb-2" />
                <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-1 text-sm">
                  Local Storage
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  All data stored securely on your device
                </p>
              </div>
            </div>

            <div className="bg-yellow-50/50 dark:bg-yellow-900/10 rounded-xl p-4 border border-yellow-100 dark:border-yellow-900/50 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-500 flex-shrink-0 mt-0.5" />
              <div className="space-y-2">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  This differs from Highlight&apos;s base privacy policy. While your data is stored locally, the content is sent to cloud AI models for processing.
                </p>
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  You can still use the basic features without enabling automatic detection if you prefer not to share content with our AI models.
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <Button
              variant="outline"
              onClick={() => handleChoice('disagree')}
              className="border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950/50 px-6"
            >
              Disable Automatic Features
            </Button>
            <Button
              onClick={() => handleChoice('agree')}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90 text-white px-6"
            >
              Enable All Features
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}