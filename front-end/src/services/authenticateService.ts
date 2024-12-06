export async function refreshAccessToken() {
  const accessToken = localStorage.getItem('accessToken')

  if (!accessToken) {
    throw new Error('No refresh token')
  }

  const response = await fetch('http://127.0.0.1:8000/auth/token/refresh/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`, // Добавляем токен в заголовок
    },
    body: JSON.stringify({ refresh: accessToken }),
  })

  if (!response.ok) {
    throw new Error('Failed to refresh token')
  }

  const data = await response.json()
  const currentTime = Date.now()
  const expiredAt = currentTime + 1 * 60 * 1000 // Новый срок истечения токена

  localStorage.setItem('accessToken', data.access)
  localStorage.setItem('expiredAt', expiredAt.toString())

  return data.access
}

export async function isAuthenticated() {
  const accessToken = localStorage.getItem('accessToken')
  const expiredAt = localStorage.getItem('expiredAt')

  if (!accessToken || !expiredAt) {
    return false // Токен отсутствует
  }

  const currentTime = Date.now()
  const expirationTime = parseInt(expiredAt)

  // Проверяем, истекает ли токен через 59 минут или меньше
  if (currentTime > expirationTime - 59 * 60 * 1000) {
    try {
      await refreshAccessToken() // Попытка обновления токена
      return true // Обновление прошло успешно
    } catch {
      return false // Обновление не удалось
    }
  }

  // Если токен еще не истек, считаем пользователя аутентифицированным
  return currentTime < expirationTime
}
