function initTaskEvents(taskElement) {
  const checkbox = taskElement.querySelector('.task-checkbox')
  const star = taskElement.querySelector('.task-star')
  const content = taskElement.querySelector('.task-content')
  const taskId = taskElement.getAttribute('data-id') // Получаем ID задачи

  if (!checkbox || !star || !content || !taskId) {
    console.error(
      'Один из элементов задачи отсутствует или ID задачи не найден:',
      taskElement
    )
    return
  }

  // Переключение раскрытия/сворачивания задачи при нажатии на содержимое
  content.addEventListener('click', () => {
    taskElement.classList.toggle('details-visible')
  })

  // Обработка клика по чекбоксу
  checkbox.addEventListener('click', (e) => {
    e.stopPropagation() // Предотвращаем всплытие
    console.log('Чекбокс нажат')

    // Отправляем обновление на сервер
    const isCompleted = checkbox.checked
    updateTaskStatus(taskId, { completed: isCompleted })
  })

  // Обработка клика по звездочке
  star.addEventListener('click', (e) => {
    e.stopPropagation() // Предотвращаем всплытие
    star.classList.toggle('active')
    const isFavorite = star.classList.contains('active')
    star.innerHTML = isFavorite ? '&#9733;' : '&#9734;'
    console.log('Звездочка изменена')

    // Отправляем обновление на сервер
    updateTaskStatus(taskId, { is_favorite: isFavorite })
  })
}

// Отправка обновления задачи на сервер
async function updateTaskStatus(taskId, updatedFields) {
  const accessToken = localStorage.getItem('access_token')
  const csrfToken = getCSRFToken()

  console.log(
    'Обновляем задачу через PATCH:',
    taskId,
    'с полями:',
    updatedFields
  )

  try {
    const response = await fetch(`/tasks/${taskId}/`, {
      method: 'PATCH', // Используем PATCH для частичного обновления
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
        'X-CSRFToken': csrfToken,
      },
      body: JSON.stringify(updatedFields),
    })

    if (response.ok) {
      const result = await response.json()
      console.log('Задача успешно обновлена:', result)
    } else {
      const errorResponse = await response.json()
      console.error(
        'Ошибка при обновлении задачи:',
        response.status,
        errorResponse
      )
    }
  } catch (error) {
    console.error('Ошибка запроса:', error)
  }
}

// Получение CSRF-токена
function getCSRFToken() {
  const token = document.cookie
    .split('; ')
    .find((row) => row.startsWith('csrftoken='))
    ?.split('=')[1]
  console.log('CSRF-токен:', token) // Проверяем токен
  return token
}

// Вызываем initTaskEvents для всех задач, уже находящихся на странице
document.addEventListener('DOMContentLoaded', () => {
  const tasks = document.querySelectorAll('.task')
  tasks.forEach(initTaskEvents)
})
