import React, { createContext, useState, useContext, useEffect, ReactNode } from "react";
import Highlight from "@highlight-ai/app-runtime";

// Define the shape of the context's value
interface NameContextType {
  name: string;
  handleNameUpdate: (newName: string) => Promise<void>;
}

const defaultContextValue: NameContextType = {
  name: "",
  handleNameUpdate: async () => {} // Provide a no-op function
};

const NameContext = createContext<NameContextType>(defaultContextValue);

export function useName() {
  return useContext(NameContext);
}

interface NameProviderProps {
  children: ReactNode;
}

export const NameProvider: React.FC<NameProviderProps> = ({ children }) => {
  const [name, setName] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadSavedName = async () => {
      try {
        const savedName = await Highlight.appStorage.get('userName')
        if (savedName) {
          setName(savedName)
        }
      } catch (error) {
        console.error('Failed to load saved name:', error)
      } finally {
        setIsLoading(false)
      }
    }
    
    loadSavedName()
  }, [])

  const handleNameUpdate = async (newName: string) => {
    setName(newName)
    try {
      await Highlight.appStorage.set('userName', newName)
    } catch (error) {
      console.error('Failed to save name:', error)
    }
  }

  return (
    <NameContext.Provider value={{ name, handleNameUpdate }}>
      {children}
    </NameContext.Provider>
  );
};
