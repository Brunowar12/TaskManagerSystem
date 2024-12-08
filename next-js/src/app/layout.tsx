import { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { NotificationProvider } from '@/contexts/notification-context'
import { CategoryProvider } from '@/contexts/CategoryManagement'
import { UserProvider } from '@/contexts/UserManagement'
import { TaskProvider } from '@/contexts/TaskManagementContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Plan My Day',
  description: 'Organize your day with Plan My Day',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang='en'>
      <body className={inter.className}>
        <NotificationProvider>
          <UserProvider>
            <CategoryProvider>
              <TaskProvider>
                {' '}
                {/* Оборачиваем детей в CategoryProvider */}
                {children}
              </TaskProvider>
            </CategoryProvider>
          </UserProvider>
        </NotificationProvider>
      </body>
    </html>
  )
}
