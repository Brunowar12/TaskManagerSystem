'use client'

import { Moon, Sun } from 'lucide-react'

interface ThemeToggleProps {
  className?: string
  darkMode: boolean
  toggleDarkMode: () => void
}

export default function ThemeToggle({ className = '', darkMode, toggleDarkMode }: ThemeToggleProps) {
  return (
    <button
      onClick={toggleDarkMode}
      className={`p-2 rounded-full bg-white dark:bg-opacity-20 text-blue-600 dark:text-violet-300 hover:bg-opacity-30 transition-all duration-200 ${className}`}
    >
      {darkMode ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
    </button>
  )
}

