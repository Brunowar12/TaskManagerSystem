const BASE_URL = 'http://127.0.0.1:8000/auth/profile/'

// Извлекаем токен из куки
const getAccessToken = (): string | null => {
  const cookies = document.cookie.split('; ')
  const tokenCookie = cookies.find((row) => row.startsWith('accessToken='))
  return tokenCookie ? tokenCookie.split('=')[1] : null
}

// Формируем заголовки с авторизацией
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

// Получение данных профиля
export const getUserProfile = async () => {
  const response = await fetch(`${BASE_URL}prf`, {
    method: 'GET',
    headers: headersWithAuth(),
  })

  if (!response.ok) {
    throw new Error('Failed to fetch user profile')
  }

  return response.json()
}

// Обновление данных профиля
export const updateUserProfile = async (data: {
  name?: string
  email?: string
  description?: string
}) => {
  const response = await fetch(`${BASE_URL}update/`, {
    method: 'PUT',
    headers: headersWithAuth(),
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    throw new Error('Failed to update user profile')
  }

  return response.json()
}
