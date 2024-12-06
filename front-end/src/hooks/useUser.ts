// hooks/useUser.ts

import { useState, useEffect } from 'react'
import { getProfile } from '@/services/authService'

export function useUser() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    async function fetchUserData() {
      try {
        const userData = await getProfile()
        setUser(userData)
      } catch (error) {
        setError(error as Error)
        console.error('Error fetching user data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [])

  return { user, loading, error }
}
