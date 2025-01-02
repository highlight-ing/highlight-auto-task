"use client"

import React, { createContext, useState, useContext, useEffect, ReactNode } from "react";
import Highlight from "@highlight-ai/app-runtime";

// Define the shape of the context's value
interface NameContextType {
  name: string;
  handleNameUpdate: (newName: string) => void;
}

// Create the context
const NameContext = createContext<NameContextType | undefined>(undefined);

// Create the provider component
export function NameProvider({ children }: { children: ReactNode }) {
  const [name, setName] = useState("User");

  useEffect(() => {
    const loadName = async () => {
      const savedName = await Highlight.appStorage.get('userName');
      if (savedName) {
        setName(savedName);
      }
    };
    loadName();
  }, []);

  const handleNameUpdate = async (newName: string) => {
    setName(newName);
    await Highlight.appStorage.set('userName', newName);
  };

  return (
    <NameContext.Provider value={{ name, handleNameUpdate }}>
      {children}
    </NameContext.Provider>
  );
}

// Create the hook to use the context
export const useName = () => {
  const context = useContext(NameContext);
  if (context === undefined) {
    throw new Error('useName must be used within a NameProvider');
  }
  return context;
};
