'use client'

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react'
import { getProfile } from '@/services/getUserInfoService'

interface User {
  username: string
  email: string
  phone_number: string
  place_of_work: string
  age: number
  avatarUrl: string
  logged_in: string
  profile_edited: string
  task_n_completed: string
}

interface UserContextType {
  user: User | null
  isLoading: boolean
  refetchUser: () => void
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchUser = useCallback(async () => {
    if (user) return // Предотвращаем повторный запрос, если пользователь уже загружен
    setIsLoading(true)
    try {
      const profile = await getProfile()
      setUser({
        username: profile.username ?? 'Guest User',
        email: profile.email ?? 'guest@example.com',
        phone_number: profile.phone_number ?? 'N/A',
        place_of_work: profile.place_of_work ?? 'N/A',
        age: profile.age ?? 0,
        avatarUrl: profile.avatar_url ?? '/gordon.jpg?height=128&width=128',
        logged_in: profile.logged_in,
        profile_edited: profile.profile_edited,
        task_n_completed: profile.task_n_completed,
      })
    } catch (error) {
      console.error('Failed to fetch user:', error)
    } finally {
      setIsLoading(false)
    }
  }, [user])

  useEffect(() => {
    fetchUser()
  }, [fetchUser])

  return (
    <UserContext.Provider
      value={{
        user,
        isLoading,
        refetchUser: fetchUser,
      }}
    >
      {children}
    </UserContext.Provider>
  )
}

export const useUser = () => {
  const context = useContext(UserContext)
  if (!context) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
}
