// Функция для проверки авторизации
function isAuthenticated() {
  return !!localStorage.getItem('access_token') // Возвращает true, если токен существует
}

// Функция для отображения имени пользователя
function displayUserNameInHeader() {
  const username = localStorage.getItem('username') // Получаем имя пользователя из localStorage
  const usernameLink = document.querySelector('.header-right a')

  if (username && usernameLink) {
    usernameLink.textContent = username // Обновляем имя в заголовке
  } else {
    // Если пользователь не авторизован, перенаправляем его на страницу входа
    window.location.href = '/auth'
  }
}

// Функция для получения задач
async function fetchTasks() {
  const accessToken = localStorage.getItem('access_token')

  if (!accessToken) {
    console.error('No access token available')
    return
  }

  try {
    const response = await fetch('/tasks/', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    })

    if (response.ok) {
      const data = await response.json()
      console.log('Tasks:', data)
      // Здесь можно вызвать функцию для отображения задач на UI
    } else {
      console.error('Failed to fetch tasks:', response.status)
    }
  } catch (error) {
    console.error('Error fetching tasks:', error)
  }
}

// Основной блок: выполняем при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
  if (isAuthenticated()) {
    displayUserNameInHeader()
    fetchTasks() // Загружаем задачи только если пользователь авторизован
  } else {
    window.location.href = '/auth' // Перенаправляем неавторизованных пользователей
  }
})
