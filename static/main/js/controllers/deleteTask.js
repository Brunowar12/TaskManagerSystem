// Функция для получения CSRF-токена из cookies
function getCSRFToken() {
  let cookieValue = null
  if (document.cookie && document.cookie !== '') {
    const cookies = document.cookie.split(';')
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim()
      if (cookie.startsWith('csrftoken=')) {
        cookieValue = decodeURIComponent(cookie.substring('csrftoken='.length))
        break
      }
    }
  }
  return cookieValue
}

// Функция для проверки и обновления токена
async function ensureTokenIsValid() {
  const accessToken = localStorage.getItem('access_token')
  const refreshToken = localStorage.getItem('refresh_token')

  if (!refreshToken) {
    console.error('[ERROR] Refresh token отсутствует')
    window.location.href = '/auth' // Перенаправляем на страницу авторизации
    return null
  }

  if (accessToken) {
    const tokenPayload = JSON.parse(atob(accessToken.split('.')[1]))
    const currentTime = Math.floor(Date.now() / 1000)

    if (tokenPayload.exp > currentTime) {
      console.log('[INFO] Access token действителен')
      return accessToken // Токен ещё действителен
    }
  }

  console.log('[INFO] Access token истек. Обновляем...')
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
      localStorage.setItem('access_token', data.access) // Обновляем токен в localStorage
      console.log('[SUCCESS] Access token успешно обновлен')
      return data.access
    } else {
      console.error('[ERROR] Ошибка при обновлении токена:', response.status)
      window.location.href = '/auth' // Перенаправляем на страницу авторизации
      return null
    }
  } catch (error) {
    console.error('[ERROR] Сетевая ошибка при обновлении токена:', error)
    window.location.href = '/auth'
    return null
  }
}

// Функция для удаления задачи
async function deleteTask(taskId) {
  const csrftoken = getCSRFToken()
  const accessToken = await ensureTokenIsValid() // Проверяем и обновляем токен перед запросом

  if (!accessToken) {
    console.error('[ERROR] Невозможно удалить задачу: нет валидного токена')
    showNotification(
      'Error',
      'Failed to delete the task. Authorization issue!',
      'error'
    )
    return
  }

  try {
    const response = await fetch(`/tasks/${taskId}/`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'X-CSRFToken': csrftoken, // Передаем CSRF-токен
      },
    })

    if (response.ok) {
      const taskElement = document.querySelector(`.task[data-id="${taskId}"]`)
      if (taskElement) {
        taskElement.remove()
      }
      console.log('[SUCCESS] Задача успешно удалена')
      showNotification('Success', 'Task successfully deleted!', 'success')
    } else {
      console.error(
        '[ERROR] Ошибка при удалении задачи:',
        response.status,
        response.statusText
      )
      showNotification(
        'Error',
        'Failed to delete the task. Please try again.',
        'error'
      )
    }
  } catch (error) {
    console.error('[ERROR] Сетевая ошибка при удалении задачи:', error)
    showNotification(
      'Error',
      'An error occurred while trying to delete the task.',
      'error'
    )
  }
}

// Добавляем обработчик события для кнопки удаления
document.addEventListener('click', (event) => {
  const taskElement = event.target.closest('.task')

  if (!taskElement) return

  if (event.target.classList.contains('task-delete')) {
    const deleteButton = event.target

    // Если кнопка уже находится в состоянии подтверждения
    if (deleteButton.dataset.confirmation === 'true') {
      const taskId = taskElement.getAttribute('data-id')
      if (taskId) {
        deleteTask(taskId) // Удаляем задачу
      }
    } else {
      // Заменяем корзину на галочку
      deleteButton.innerHTML = '&#10004;' // HTML-код для галочки
      deleteButton.dataset.confirmation = 'true' // Добавляем атрибут подтверждения
      deleteButton.title = 'Confirm deletion'

      // Таймер для возврата кнопки
      setTimeout(() => {
        if (deleteButton.dataset.confirmation === 'true') {
          deleteButton.innerHTML = '&#128465;' // Корзина
          deleteButton.dataset.confirmation = 'false'
          deleteButton.title = 'Delete task'
        }
      }, 5000) // 5 секунд
    }
  }
})
