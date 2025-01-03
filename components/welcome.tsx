/**
* This code was generated by v0 by Vercel.
* @see https://v0.dev/t/mrQT3Vp80ff
* Documentation: https://v0.dev/docs#integrating-generated-code-into-your-nextjs-app
*/

/** Add fonts into your Next.js project:

import { Arimo } from 'next/font/google'
import { Chivo } from 'next/font/google'

arimo({
  subsets: ['latin'],
  display: 'swap',
})

chivo({
  subsets: ['latin'],
  display: 'swap',
})

To read more about using these font, please visit the Next.js documentation:
- App Directory: https://nextjs.org/docs/app/building-your-application/optimizing/fonts
- Pages Directory: https://nextjs.org/docs/pages/building-your-application/optimizing/fonts
**/
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useName } from './providers/NameProvider'; // Adjust the path based on where you save the context
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card"
import { useTheme } from "next-themes"
import { Sun, Moon } from 'lucide-react'

export function Welcome() {
  const { handleNameUpdate } = useName();
  const [name, setName] = useState("");
  const [platform, setPlatform] = useState("");
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const platform = navigator.platform.toLowerCase();
      if (platform.includes('win')) {
        setPlatform('Windows');
      } else if (platform.includes('mac')) {
        setPlatform('Mac');
      } else {
        setPlatform('Other');
      }
    }
  }, []);


  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-8">
      <div className="w-full max-w-xl">
        <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg shadow-xl rounded-2xl overflow-hidden border-0 dark:ring-1 dark:ring-white/10">
          <div className="bg-white dark:bg-gray-900 border-b dark:border-gray-800 p-8 text-center relative">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full absolute right-4 top-4"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>

            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent mb-6">
              Auto TODO
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-md mx-auto">
              Effortlessly manage your tasks with our intelligent to-do app that automatically detects tasks from your screen.
            </p>
          </div>

          <CardContent className="p-12 pt-16">
            {platform !== 'Mac' ? (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-lg p-8 text-center">
                <p className="text-2xl font-semibold text-red-600 dark:text-red-400">
                  Your OS Not Supported
                </p>
                <p className="mt-4 text-red-500 dark:text-red-300">
                  Currently, this feature works on MacOS only.
                </p>
              </div>
            ) : (
              <div className="space-y-16 max-w-md mx-auto">
                <div className="text-center space-y-6">
                  <div className="space-y-4">
                    <h2 className="text-3xl font-semibold text-gray-900 dark:text-gray-100">
                      What is your name?
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 text-lg">
                      We need to know your name for detecting the tasks meant for you.
                    </p>
                  </div>
                  
                  <Input
                    id="name"
                    type="text"
                    placeholder="Enter your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full text-lg py-6 px-4 bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl text-center placeholder:text-gray-400 dark:placeholder:text-gray-500"
                  />
                </div>

                <div className="flex justify-center">
                  <Button
                    disabled={!name}
                    className="w-full max-w-[200px] bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90 text-white py-6 text-lg font-medium rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                    onClick={() => handleNameUpdate(name)}
                  >
                    Get Started
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function InboxIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
      <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
    </svg>
  )
}


function MailIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  )
}


function MessageCircleIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
    </svg>
  )
}


function SlackIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="3" height="8" x="13" y="2" rx="1.5" />
      <path d="M19 8.5V10h1.5A1.5 1.5 0 1 0 19 8.5" />
      <rect width="3" height="8" x="8" y="14" rx="1.5" />
      <path d="M5 15.5V14H3.5A1.5 1.5 0 1 0 5 15.5" />
      <rect width="8" height="3" x="14" y="13" rx="1.5" />
      <path d="M15.5 19H14v1.5a1.5 1.5 0 1 0 1.5-1.5" />
      <rect width="8" height="3" x="2" y="8" rx="1.5" />
      <path d="M8.5 5H10V3.5A1.5 1.5 0 1 0 8.5 5" />
    </svg>
  )
}
