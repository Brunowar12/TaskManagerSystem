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

// Функция для обновления токена
async function refreshToken() {
  const refreshToken = localStorage.getItem('refresh_token')
  console.log('[INFO] Попытка обновить токен...')

  if (!refreshToken) {
    console.error('[ERROR] Отсутствует refresh_token')
    window.location.href = '/auth' // Перенаправляем на страницу входа
    return null
  }

  try {
    const response = await fetch('/auth/token/refresh/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh: refreshToken }),
    })

    if (response.ok) {
      const data = await response.json()
      localStorage.setItem('access_token', data.access) // Обновляем access token в localStorage
      console.log('[SUCCESS] Access token успешно обновлен')
      return data.access
    } else {
      console.error(
        '[ERROR] Ошибка при обновлении токена:',
        response.status,
        response.statusText
      )
      window.location.href = '/auth' // Перенаправляем на страницу входа при ошибке
    }
  } catch (error) {
    console.error('[ERROR] Ошибка сети при обновлении токена:', error)
    window.location.href = '/auth'
  }

  return null
}

// Функция для проверки и обновления токена перед запросами
async function ensureTokenIsValid() {
  const accessToken = localStorage.getItem('access_token')

  if (!accessToken) {
    console.warn('[WARNING] Access token отсутствует, пробуем обновить...')
    return await refreshToken() // Если access token отсутствует, пытаемся обновить его
  }

  try {
    // Проверка срока действия токена
    const tokenPayload = JSON.parse(atob(accessToken.split('.')[1]))
    const currentTime = Math.floor(Date.now() / 1000)

    if (tokenPayload.exp < currentTime) {
      console.log('[INFO] Access token истек. Попытка обновления...')
      return await refreshToken() // Если токен истек, обновляем его
    }

    console.log('[INFO] Access token действителен')
    return accessToken
  } catch (error) {
    console.error('[ERROR] Ошибка при проверке токена:', error)
    return await refreshToken() // Обновляем токен, если произошла ошибка
  }
}

// Универсальная функция для выполнения запросов с проверкой токена
async function fetchWithAuth(url, options = {}) {
  // Гарантируем, что токен актуален
  const accessToken = await ensureTokenIsValid()

  if (!accessToken) {
    console.error('[ERROR] Невозможно выполнить запрос: нет валидного токена')
    return null
  }

  // Добавляем актуальный токен в заголовок запроса
  const headers = {
    ...options.headers,
    Authorization: `Bearer ${accessToken}`,
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    })

    if (!response.ok) {
      console.error(
        `[ERROR] Ошибка запроса: ${response.status} ${response.statusText}`
      )
    }

    return response
  } catch (error) {
    console.error('[ERROR] Ошибка сети при выполнении запроса:', error)
    return null
  }
}

// Функция для получения задач
async function fetchTasks() {
  try {
    const response = await fetchWithAuth('/tasks/', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (response && response.ok) {
      const data = await response.json()
      console.log('[SUCCESS] Задачи получены:', data)
      // Здесь можно обновить интерфейс задач
    }
  } catch (error) {
    console.error('[ERROR] Ошибка при получении задач:', error)
  }
}

// Основной блок: выполняем при загрузке страницы
document.addEventListener('DOMContentLoaded', async () => {
  if (isAuthenticated()) {
    console.log('[INFO] Пользователь авторизован')
    displayUserNameInHeader()

    // Проверяем токен и выполняем запросы после успешного обновления токена
    await ensureTokenIsValid()
    await fetchTasks() // Загружаем задачи только если пользователь авторизован
  } else {
    console.warn(
      '[WARNING] Пользователь не авторизован. Перенаправляем на страницу входа.'
    )
    window.location.href = '/auth' // Перенаправляем неавторизованных пользователей
  }
})

console.log('Access Token:', localStorage.getItem('access_token'))
console.log('Refresh Token:', localStorage.getItem('refresh_token'))
