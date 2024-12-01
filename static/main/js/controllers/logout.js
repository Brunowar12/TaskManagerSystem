document.addEventListener('DOMContentLoaded', () => {
  const logoutButton = document.getElementById('logoutButton')

  if (logoutButton) {
    logoutButton.addEventListener('click', async () => {
      try {
        // Получаем refresh_token из localStorage
        const refreshToken = localStorage.getItem('refresh_token')

        // Выполняем запрос на /auth/logout
        const response = await fetch('http://127.0.0.1:8000/auth/logout/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            // Если требуется, добавьте авторизационный токен в заголовок
            Authorization: `Bearer ${localStorage.getItem('access_token')}`,
          },
          body: JSON.stringify({
            refresh: refreshToken, // Отправляем refresh_token в поле "refresh"
          }),
        })

        // Проверка успешности запроса
        if (!response.ok) {
          throw new Error(`Logout failed: ${response.statusText}`)
        }

        // Удаляем токены и имя пользователя из localStorage
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        localStorage.removeItem('username')

        // Очищаем cookies
        document.cookie =
          'access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
        document.cookie =
          'refresh_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'

        // Перенаправляем на страницу авторизации
        setTimeout(() => {
          window.location.href = '/auth' // Перенаправление на /auth
        }, 500) // Задержка 500мс, чтобы запрос успел завершиться
      } catch (error) {
        console.error('Error during logout:', error)
      }
    })
  }
})
