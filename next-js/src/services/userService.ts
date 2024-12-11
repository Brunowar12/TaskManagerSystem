const BASE_URL = 'http://127.0.0.1:8000/auth/profile/'

// Extract the token from the cookie
const getAccessToken = (): string | null => {
  const cookies = document.cookie.split('; ')
  const tokenCookie = cookies.find((row) => row.startsWith('accessToken='))
  return tokenCookie ? tokenCookie.split('=')[1] : null
}

// Generate headers with authorization
const headersWithAuth = () => {
  const token = getAccessToken()
  if (!token) {
    throw new Error('Access token not found in cookies')
  }

  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  }
}

// Function to handle server errors
const handleServerError = async (response: Response) => {
  let errorMessage = 'An error occurred.'

  try {
    const errorData = await response.json()
    // Проверяем на наличие ошибок с конкретным полем
    if (errorData?.username) {
      errorMessage = errorData.username.join('; ')
    } else if (errorData?.detail) {
      errorMessage = errorData.detail
    } else if (typeof errorData === 'object') {
      const errors = Object.entries(errorData)
        .map(([key, value]) => `${key}: ${(value as string[]).join(', ')}`)
        .join('; ')
      errorMessage = `${errors}`
    }
  } catch {
    // Если ошибка не в JSON формате, используем сообщение по умолчанию
  }

  throw new Error(errorMessage) // Возвращаем ошибку с сообщением
}

// Get profile data
export const getUserProfile = async () => {
  const response = await fetch(`${BASE_URL}prf/`, {
    method: 'GET',
    headers: headersWithAuth(),
  })

  if (!response.ok) {
    await handleServerError(response)
  }

  return response.json()
}

// Update profile data
export const updateUserProfile = async (data: {
  username?: string
  email?: string
  age?: string
  placeOfWork?: string
  phoneNumber?: string
}) => {
  const response = await fetch(`${BASE_URL}update/`, {
    method: 'PATCH',
    headers: headersWithAuth(),
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    await handleServerError(response)
  }

  return response.json()
}
