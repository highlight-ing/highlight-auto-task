"use client"

import { createContext, useContext, useEffect, useState } from "react"
import Highlight from "@highlight-ai/app-runtime"

type NameContextType = {
  name: string
  handleNameUpdate: (newName: string) => Promise<void>
  isValidName: boolean
}

const NameContext = createContext<NameContextType>({
  name: "",
  handleNameUpdate: async () => {},
  isValidName: false
})

export function NameProvider({ children }: { children: React.ReactNode }) {
  const [name, setName] = useState("")
  const [isValidName, setIsValidName] = useState(false)

  useEffect(() => {
    const loadName = async () => {
      const savedName = await Highlight.appStorage.get("userName")
      if (savedName) {
        setName(savedName)
        setIsValidName(savedName.toLowerCase() !== 'user')
      }
    }
    loadName()
  }, [])

  const handleNameUpdate = async (newName: string) => {
    await Highlight.appStorage.set("userName", newName)
    setName(newName)
    setIsValidName(newName.toLowerCase() !== 'user')
  }

  return (
    <NameContext.Provider value={{ name, handleNameUpdate, isValidName }}>
      {children}
    </NameContext.Provider>
  )
}

export const useName = () => useContext(NameContext)
