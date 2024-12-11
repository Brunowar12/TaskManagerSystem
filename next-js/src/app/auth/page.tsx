'use client'

import { useState, useEffect } from 'react'
import LoginForm from './login-form'
import RegistrationForm from './registration-form'
import Logo from '@/components/logo'
import SnowfallBackground from '@/components/snowfall-background'
import ThemeToggle from '@/components/theme-toggle'
import { NotificationProvider } from '@/contexts/notification-context'

export default function AuthPage() {
  const [mounted, setMounted] = useState(false)
  const [darkMode, setDarkMode] = useState(true) // Update 1: Initial state of darkMode is true

  useEffect(() => {
    setMounted(true)
    const isDarkMode = localStorage.getItem('darkMode')
    if (isDarkMode === null) {
      // If no theme is set in localStorage, use dark mode by default
      setDarkMode(true)
      localStorage.setItem('darkMode', 'true')
    } else {
      setDarkMode(isDarkMode === 'true')
    }
    document.documentElement.classList.toggle('dark', isDarkMode === 'true' || isDarkMode === null) // Update 2: Modified useEffect hook
  }, [])

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode
    setDarkMode(newDarkMode)
    localStorage.setItem('darkMode', newDarkMode.toString())
    document.documentElement.classList.toggle('dark', newDarkMode)
  }

  if (!mounted) return null

  return (
    <NotificationProvider>
      <div className="min-h-screen bg-gradient-to-br from-purple-100 via-blue-50 to-purple-200 dark:from-purple-900 dark:via-violet-800 dark:to-blue-800 transition-colors duration-500">
        <SnowfallBackground />
        <div className="container mx-auto px-4 py-16 relative z-10 flex flex-col items-center justify-center min-h-screen"> {/* Update 1: Updated container padding */}
          <ThemeToggle className="absolute top-4 right-4" darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
          <div className="mb-12"> {/* Update 2: Adjusted logo margin */}
            <Logo />
          </div>
          <div className="flex flex-col md:flex-row gap-8 justify-center items-center animate-fade-in-up w-full max-w-4xl">
            <div className="w-full max-w-md bg-white bg-opacity-20 dark:bg-opacity-10 backdrop-filter backdrop-blur-lg p-8 rounded-3xl shadow-2xl transition-all duration-300 hover:shadow-blue-300/50 dark:hover:shadow-violet-500/30">
              <LoginForm />
            </div>
            <div className="w-full max-w-md bg-white bg-opacity-20 dark:bg-opacity-10 backdrop-filter backdrop-blur-lg p-8 rounded-3xl shadow-2xl transition-all duration-300 hover:shadow-blue-300/50 dark:hover:shadow-violet-500/30">
              <RegistrationForm />
            </div>
          </div>
        </div>
      </div>
    </NotificationProvider>
  )
}

