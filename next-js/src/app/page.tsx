'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { checkUserAuthorization } from '@/services/authChecker'
import Header from './components/Header'
import Sidebar from './components/Sidebar'
import MainContent from './components/MainContent'
import CalendarView from './components/CalendarView'
import StatsView from './components/StatsView'
import Profile from './components/Profile'
import { useNotification } from '@/contexts/notification-context'

type View = 'tasks' | 'calendar' | 'stats' | 'profile'

export default function Home() {
  const [isSidebarVisible, setIsSidebarVisible] = useState(false)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [currentView, setCurrentView] = useState<View>('tasks')
  const { addNotification } = useNotification()
  const router = useRouter()

  // Checking authorization
  useEffect(() => {
    const checkAuth = async () => {
      const isAuthorized = await checkUserAuthorization()
      if (!isAuthorized) {
        router.push('/auth')
      }
    }
    checkAuth()
  }, [router])

  // Monitor URL hash changes
  useEffect(() => {
    const handleHashChange = () => {
      if (typeof window !== 'undefined') {
        const hash = window.location.hash.replace('#', '') as View
        if (hash && ['tasks', 'calendar', 'stats', 'profile'].includes(hash)) {
          setCurrentView(hash)
        }
      }
    }

    handleHashChange() // Set initial state based on hash
    window.addEventListener('hashchange', handleHashChange)

    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  // Check on mobile device
  useEffect(() => {
    const checkMobile = () => {
      if (typeof window !== 'undefined') {
        setIsMobile(window.innerWidth < 768)
      }
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)

    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    const storedNotification = localStorage.getItem('pendingNotification')
    if (storedNotification) {
      const { type, message, duration } = JSON.parse(storedNotification)
      addNotification(type, message, duration)
      localStorage.removeItem('pendingNotification')
    }
  }, [addNotification])

  const toggleSidebar = () => {
    setIsSidebarVisible(!isSidebarVisible)
  }

  const toggleSidebarCollapse = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed)
  }

  const changeView = (view: View) => {
    setCurrentView(view)
    if (typeof window !== 'undefined') {
      window.location.hash = `#${view}` // Update the hash in the URL
    }
  }

  return (
    <div className='flex h-screen overflow-hidden bg-gradient-to-b from-[#8f31f2] to-[#e0dee1]'>
      <Sidebar
        isVisible={isSidebarVisible}
        isCollapsed={isSidebarCollapsed}
        currentView={currentView}
        onChangeView={changeView}
      />

      <div className='flex flex-1 flex-col'>
        <Header
          toggleSidebar={toggleSidebar}
          toggleCollapse={toggleSidebarCollapse}
          isCollapsed={isSidebarCollapsed}
          onProfileClick={() => changeView('profile')}
        />
        <main className='flex-1 overflow-hidden transition-all duration-300 ease-in-out p-6'>
          {currentView === 'tasks' && <MainContent />}
          {currentView === 'calendar' && <CalendarView />}
          {currentView === 'stats' && <StatsView />}
          {currentView === 'profile' && (
            <Profile onBackToTasks={() => changeView('tasks')} />
          )}
        </main>
      </div>

      {/* Mobile overlay */}
      {isSidebarVisible && isMobile && (
        <div
          className='fixed inset-0 bg-black/50 md:hidden'
          onClick={toggleSidebar}
        />
      )}
    </div>
  )
}
