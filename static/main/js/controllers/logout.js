document.addEventListener('DOMContentLoaded', () => {
  const logoutButton = document.getElementById('logoutButton')
  if (logoutButton) {
    logoutButton.addEventListener('click', () => {
      try {
        // /logout url

        // Удаляем токен и имя пользователя
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        localStorage.removeItem('username')

        // Также очищаем данные из cookies
        document.cookie =
          'access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
        document.cookie =
          'refresh_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'

        // Перенаправляем на страницу авторизации сразу после выхода
        setTimeout(() => {
          window.location.href = '/auth' // Перенаправление на /auth
        }, 500) // Задержка 500мс, чтобы успело выполнить удаление данных
      } catch (error) {
        console.error('Error during logout:', error)
      }
    })
  }
})
