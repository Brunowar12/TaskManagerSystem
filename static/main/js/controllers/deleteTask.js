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

// Функция для удаления задачи
async function deleteTask(taskId) {
  const csrftoken = getCSRFToken()
  const accessToken = localStorage.getItem('access_token')

  try {
    const response = await fetch(`/tasks/${taskId}/`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'X-CSRFToken': csrftoken,
      },
    })

    if (response.ok) {
      const taskElement = document.querySelector(`.task[data-id="${taskId}"]`)
      if (taskElement) {
        taskElement.remove()
      }
      alert('Task successfully deleted!')
    } else {
      console.error(
        'Failed to delete task:',
        response.status,
        response.statusText
      )
      alert('Failed to delete the task. Please try again.')
    }
  } catch (error) {
    console.error('Error while deleting the task:', error)
    alert('An error occurred while trying to delete the task.')
  }
}

// Добавляем обработчик события для кнопки удаления
document.addEventListener('click', (event) => {
  if (event.target.classList.contains('task-delete')) {
    const taskElement = event.target.closest('.task')
    const taskId = taskElement.getAttribute('data-id')

    if (taskId) {
      if (confirm('Are you sure you want to delete this task?')) {
        deleteTask(taskId)
      }
    }
  }
})
