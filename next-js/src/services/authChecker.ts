import Cookies from 'js-cookie'

const API_URL = 'http://127.0.0.1:8000/auth'

// Функция для проверки авторизации пользователя
export async function checkUserAuthorization(): Promise<boolean> {
  const accessToken = Cookies.get('accessToken')
  const refreshToken = Cookies.get('refreshToken')

  // Если нет токенов, пользователь не авторизован
  if (!accessToken && !refreshToken) {
    Cookies.remove('username')
    Cookies.remove('email')
    redirectToAuthPage()
    return false
  }

  // Если нет accessToken, но есть refreshToken, обновляем токен
  if (!accessToken && refreshToken) {
    try {
      const newAccessToken = await refreshAccessToken(refreshToken)
      Cookies.set('accessToken', newAccessToken, { expires: 1 / 24 }) // 60 минут
      return true
    } catch (error) {
      console.error('Ошибка при обновлении токена:', error)
      redirectToAuthPage()
      return false
    }
  }

  // Пользователь авторизован
  return true
}

// Функция для обновления accessToken
async function refreshAccessToken(refreshToken: string): Promise<string> {
  const response = await fetch(`${API_URL}/token/refresh/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ refresh: refreshToken }),
  })

  if (!response.ok) {
    throw new Error('Не удалось обновить токен')
  }

  const data = await response.json()
  return data.access
}

// Перенаправление на страницу авторизации
function redirectToAuthPage() {
  window.location.href = '/auth'
}
