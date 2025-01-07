"use client";

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Highlight from "@highlight-ai/app-runtime"
import { IntroScreen } from "@/components/onboarding/intro"
import { PrivacyScreen } from "@/components/onboarding/privacy"
import { NameInputScreen } from "@/components/onboarding/name-input"
import { Todo } from "@/components/todo"
import { useName } from "@/components/providers/NameProvider"

export default function Home() {
  const router = useRouter()
  const { name, isValidName } = useName()
  const [currentScreen, setCurrentScreen] = useState<'loading' | 'intro' | 'privacy' | 'name' | 'main'>('loading')

  useEffect(() => {
    const initializeApp = async () => {
      try {
        const hasSeenIntro = await Highlight.appStorage.get('hasSeenIntro')
        const privacyChoice = await Highlight.appStorage.get('privacyChoice')

        if (!hasSeenIntro) {
          setCurrentScreen('intro')
          return
        }

        // Check if we're coming from the settings button
        const fromSettings = window.location.search.includes('settings=true')
        if (!privacyChoice || (privacyChoice === 'disagree' && fromSettings)) {
          // Clear existing choice if coming from settings
          if (fromSettings) {
            await Highlight.appStorage.set('privacyChoice', null)
          }
          setCurrentScreen('privacy')
          return
        }

        // Check both if name exists and is valid
        if (!name || !isValidName) {
          setCurrentScreen('name')
          return
        }

        setCurrentScreen('main')
      } catch (error) {
        console.error('Failed to initialize app:', error)
        // Default to intro screen on error
        setCurrentScreen('intro')
      }
    }

    initializeApp()
  }, [name, isValidName]) // Add isValidName to dependencies

  if (currentScreen === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 p-8 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300">
            Loading...
          </h2>
        </div>
      </div>
    )
  }

  switch (currentScreen) {
    case 'intro':
      return <IntroScreen />
    case 'privacy':
      return <PrivacyScreen />
    case 'name':
      return <NameInputScreen />
    case 'main':
      return <Todo />
    default:
      return <IntroScreen />
  }
}
