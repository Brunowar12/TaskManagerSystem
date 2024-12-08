'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { getUserProfile, updateUserProfile } from '@/services/userService'

interface User {
  id: number
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

interface UserContextProps {
  user: User | null
  fetchUserProfile: () => void
  updateUserProfile: (data: {
    username?: string
    email?: string
    phone_number?: string
    place_of_work?: string
    age?: number
    avatarUrl?: string
    logged_in?: string
    profile_edited?: string
    task_n_completed?: string
  }) => Promise<void>
}

const UserContext = createContext<UserContextProps | undefined>(undefined)

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null)

  const fetchUserProfile = async () => {
    try {
      const data = await getUserProfile()
      setUser(data)
    } catch (error) {
      console.error('Error fetching user profile:', error)
      setUser(null)
    }
  }

  const updateUserProfileData = async (data: {
    username?: string
    email?: string
    phone_number?: string
    place_of_work?: string
    age?: number
    avatarUrl?: string
    logged_in?: string
    profile_edited?: string
    task_n_completed?: string
  }) => {
    try {
      const updatedUser = await updateUserProfile(data)
      setUser(updatedUser)
    } catch (error) {
      console.error('Error updating user profile:', error)
    }
  }

  useEffect(() => {
    fetchUserProfile()
  }, [])

  return (
    <UserContext.Provider
      value={{
        user,
        fetchUserProfile,
        updateUserProfile: updateUserProfileData,
      }}
    >
      {children}
    </UserContext.Provider>
  )
}

export const useUserContext = () => {
  const context = useContext(UserContext)
  if (!context) {
    throw new Error('useUserContext must be used within a UserProvider')
  }
  return context
}
