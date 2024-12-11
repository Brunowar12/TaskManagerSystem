'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { getUserProfile, updateUserProfile } from '@/services/userService'
import { useNotification } from '@/contexts/notification-context'

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
  const { addNotification } = useNotification()
  const [error, setError] = useState<string | null>(null)

  const fetchUserProfile = async () => {
    try {
      const data = await getUserProfile()
      setUser(data)
    } catch (error) {
      // console.error('Error fetching user profile:', error)
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
      await updateUserProfile(data)
      await fetchUserProfile() // Refetch after successful update

      // We update cookies only in case of a successful update
      if (data.username || data.email) {
        const cookieData = []
        if (data.username) {
          cookieData.push(
            `username=${encodeURIComponent(data.username)}; path=/; max-age=${
              60 * 60 * 24 * 365
            }`
          )
        }
        if (data.email) {
          cookieData.push(
            `email=${encodeURIComponent(data.email)}; path=/; max-age=${
              60 * 60 * 24 * 365
            }`
          )
        }
        document.cookie = cookieData.join('; ')
      }

      addNotification('success', 'Profile updated successfully!')
      setError(null) // Clear error after successful update
    } catch (error: any) {
      // console.error('Error updating user profile:', error)

      // Checking for errors related to the API (for example, from DRF)
      if (error.response?.data) {
        const errorData = error.response.data
        if (errorData.username?.[0]?.includes('already exists')) {
          addNotification(
            'error',
            'Username already exists. Please choose a different one.'
          )
        } else if (errorData.email?.[0]?.includes('already exists')) {
          addNotification(
            'error',
            'Email already exists. Please choose a different one.'
          )
          // console.log(errorData.email)
        } else {
          // Handling common errors from the API

          addNotification(
            'error',
            'An unexpected error occurred. Please try again.'
          )
        }
      } else if (error.message) {
        // Handling errors without `response.data` (for example, network errors)
        if (error.message.includes('user with this username already exists')) {
          setError('Username already exists. Please choose a different one.')
          addNotification(
            'error',
            'Username already exists. Please choose a different one.'
          )
        } else if (
          error.message.includes('user with this email already exists')
        ) {
          setError('Email already exists. Please choose a different one.')
          addNotification(
            'error',
            'Email already exists. Please choose a different one.'
          )
        } else {
          // General error for unexpected cases
          setError('An unexpected error occurred. Please try again.')
          addNotification(
            'error',
            'An unexpected error occurred. Please try again.'
          )
        }
      } else {
        // Handling completely unknown errors
        setError('An unexpected error occurred. Please try again.')
        addNotification(
          'error',
          'An unexpected error occurred. Please try again.'
        )
      }
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
