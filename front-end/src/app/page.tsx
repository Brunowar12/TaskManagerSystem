'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Header from './components/Header'
import Sidebar from './components/Sidebar'
import MainContent from './components/MainContent'
import CalendarView from './components/CalendarView'
import StatsView from './components/StatsView'
import Profile from './components/Profile'
import { isAuthenticated } from '@/services/authenticateService'

type View = 'tasks' | 'calendar' | 'stats' | 'profile'

export default function Home() {
  const [isSidebarVisible, setIsSidebarVisible] = useState(false)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [isLoading, setIsLoading] = useState(true) // Флаг загрузки

  const router = useRouter()
  const searchParams = useSearchParams()

  const validViews: View[] = ['tasks', 'calendar', 'stats', 'profile']
  const viewParam = searchParams.get('view')

  const [currentView, setCurrentView] = useState<View>(
    validViews.includes(viewParam as View) ? (viewParam as View) : 'tasks'
  )

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const isUserAuthenticated = await isAuthenticated()

        if (!isUserAuthenticated) {
          router.replace('/auth')
          return
        }
      } catch (error) {
        console.error('Ошибка проверки авторизации:', error)
        router.replace('/auth')
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [router])

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)

    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const toggleSidebar = () => {
    setIsSidebarVisible(!isSidebarVisible)
  }

  const toggleSidebarCollapse = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed)
  }

  const changeView = (view: View) => {
    setCurrentView(view)
    router.push(`/?view=${view}`, undefined) // Обновляем URL
  }

  if (isLoading) {
    return <div>Loading...</div> // Показываем, пока идет загрузка
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
              stats={{
                completedTasks: 42,
                ongoingTasks: 15,
                totalTasks: 57,
              }}
            />
          )}
        </main>
      </div>

      {isSidebarVisible && isMobile && (
        <div
          className='fixed inset-0 bg-black/50 md:hidden'
          onClick={toggleSidebar}
        />
      )}
    </div>
  )
}
