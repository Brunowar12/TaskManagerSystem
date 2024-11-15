// Функция для добавления задачи в DOM
function addTaskToDOM(task) {
  const taskListContainer = document.querySelector('.task-list')
  const taskElement = document.createElement('div')

  taskElement.className = `task ${getPriorityClass(
    task.priority
  )} toggle-details`
  taskElement.setAttribute('data-id', task.id)

  // HTML структура задачи
  taskElement.innerHTML = `
    <input type="checkbox" id="task-${task.id}" class="task-checkbox" ${
    task.completed ? 'checked' : ''
  } />
    <div class="task-content">
      <div class="task-collapsed">
        <span class="task-title">${task.title}</span>
        <div class="task-meta">
          <span class="task-date">End: ${formatDate(task.due_date)}</span>
          <span class="task-category">Category: ${
            task.category || 'No category'
          }</span>
        </div>
      </div>
      <div class="task-expanded">
        <span class="task-title">${task.title}</span>
        <p class="task-description">${
          task.description || 'No description available'
        }</p>
        <div class="task-meta">
          <span>Created: ${formatDate(task.created_at)}</span>
          <span>End: ${formatDate(task.due_date)}</span>
          <span>Category: ${task.category || 'No category'}</span>
        </div>
      </div>
    </div>
    <span class="task-star">&#9734;</span>
    <span class="task-delete">&#128465;</span>
  `

  // Применяем обработчики событий к новой задаче
  initTaskEvents(taskElement)

  // Добавляем задачу в контейнер задач
  taskListContainer.appendChild(taskElement)
}

// Функция для загрузки задач с сервера
async function loadTasks() {
  const accessToken = localStorage.getItem('access_token')

  try {
    const response = await fetch('/tasks/', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`, // добавляем токен в заголовок
      },
    })

    if (response.ok) {
      const data = await response.json()
      const tasks = data.results

      // Очищаем контейнер задач перед добавлением новых
      document.querySelector('.task-list').innerHTML = ''

      // Проверка, является ли tasks массивом
      if (Array.isArray(tasks)) {
        tasks.forEach(addTaskToDOM) // Добавляем каждую задачу в DOM
      } else {
        console.error('Ошибка: задачи не являются массивом.', tasks)
      }
    } else {
      console.error(
        'Ошибка при получении задач:',
        response.status,
        response.statusText
      )
    }
  } catch (error) {
    console.error('Ошибка при запросе задач:', error)
  }
}

// Вспомогательные функции
function getPriorityClass(priority) {
  if (priority === 'high' || priority === 'H') return 'high-priority'
  if (priority === 'medium' || priority === 'M') return 'medium-priority'
  return 'low-priority' // По умолчанию
}

function formatDate(dateString) {
  const date = new Date(dateString)
  return date.toLocaleDateString()
}

// Запускаем загрузку задач при загрузке страницы
window.addEventListener('load', loadTasks)
