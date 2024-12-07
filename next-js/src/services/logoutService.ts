import Cookies from 'js-cookie'

// Очистка данных при выходе
export async function logout() {
  const accessToken = Cookies.get('accessToken')

  if (accessToken) {
    try {
      // Отправляем запрос на сервер для выхода
      const response = await fetch(`http://127.0.0.1:8000/auth/logout/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
      })

      if (!response.ok) {
        console.error(
          'Ошибка при попытке выйти из системы:',
          response.statusText
        )
      }
    } catch (error) {
      console.error('Ошибка сети при попытке выйти из системы:', error)
    }
  }

  // Очищаем куки
  Cookies.remove('accessToken')
  Cookies.remove('refreshToken')
  Cookies.remove('username')
  Cookies.remove('email')

  // Перенаправляем на страницу авторизации
  window.location.href = '/auth'
}
