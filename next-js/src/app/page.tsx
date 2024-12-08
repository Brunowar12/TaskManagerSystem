'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation' // Используем `next/navigation` вместо `next/router`
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

  // Проверка авторизации
  useEffect(() => {
    const checkAuth = async () => {
      const isAuthorized = await checkUserAuthorization()
      if (!isAuthorized) {
        router.push('/auth') // Перенаправляем на страницу авторизации
      }
    }
    checkAuth()
  }, [router])

  // Следим за изменениями хеша в URL
  useEffect(() => {
    const hash = window.location.hash.replace('#', '') as View
    if (hash && ['tasks', 'calendar', 'stats', 'profile'].includes(hash)) {
      setCurrentView(hash)
    }
  }, [window.location.hash])

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
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
    window.location.hash = `#${view}` // Обновляем хеш в URL
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
            <Profile
              onBackToTasks={() => changeView('tasks')}
              user={{
                name: 'John Doe',
                email: 'john@example.com',
                phone: '+1 234 567 8900',
                workplace: 'Acme Inc.',
                age: 30,
                avatarUrl: '/profile-image.jpg?height=128&width=128',
              }}
              stats={{
                completedTasks: 42,
                ongoingTasks: 15,
                totalTasks: 57,
              }}
            />
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
