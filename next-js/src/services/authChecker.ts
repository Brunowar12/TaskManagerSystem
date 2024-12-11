import Cookies from 'js-cookie'

const API_URL = 'http://127.0.0.1:8000/auth'

// Function to check user authorization
export async function checkUserAuthorization(): Promise<boolean> {
  const accessToken = Cookies.get('accessToken')
  const refreshToken = Cookies.get('refreshToken')

  // If there are no tokens, the user is not authorized
  if (!accessToken && !refreshToken) {
    Cookies.remove('username')
    Cookies.remove('email')
    redirectToAuthPage()
    return false
  }

  // If there is no accessToken, but there is a refreshToken, refresh the token
  if (!accessToken && refreshToken) {
    try {
      const newAccessToken = await refreshAccessToken(refreshToken)
      Cookies.set('accessToken', newAccessToken, { expires: 1 / 24 }) // 60 минут
      return true
    } catch (error) {
      // console.error('Ошибка при обновлении токена:', error)
      redirectToAuthPage()
      return false
    }
  }

  // User is authorized
  return true
}

// Function to update accessToken
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

// Redirect to the authorization page
function redirectToAuthPage() {
  window.location.href = '/auth'
}
