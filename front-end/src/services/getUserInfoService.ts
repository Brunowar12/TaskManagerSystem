import { format } from 'date-fns'
import { refreshAccessToken } from '@/services/authenticateService'

export async function getProfile(retryCount = 0) {
  try {
    const accessToken = localStorage.getItem('accessToken')

    if (!accessToken) {
      throw new Error('No access token')
    }

    const response = await fetch('http://127.0.0.1:8000/auth/profile/prf/', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })

    if (response.ok) {
      return response.json()
    }

    if (response.status === 401 && retryCount < 1) {
      await refreshAccessToken()
      return getProfile(retryCount + 1)
    }

    // throw new Error(`Failed to fetch profile: ${response.status}`)
  } catch (error) {
    console.error('Error fetching profile:', error)
    throw error
  }
}

export function formatDate(date: Date | string): string {
  if (!date) return 'N/A'
  const parsedDate = new Date(date)
  return format(parsedDate, 'MMM dd, yyyy hh:mm a')
}
