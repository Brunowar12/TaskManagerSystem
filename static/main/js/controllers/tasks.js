// Глобальный объект для хранения категорий
let categoryMap = {}

// Функция для загрузки категорий и их сопоставления
async function fetchCategories() {
  const accessToken = localStorage.getItem('access_token')
  try {
    const response = await fetch('/tasks/categories/', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })

    if (response.ok) {
      const categories = await response.json()
      populateCategorySelect(categories.results)

      // Создаем словарь для сопоставления ID -> Название
      categoryMap = categories.results.reduce((map, category) => {
        map[category.id] = category.name
        return map
      }, {})
    } else {
      console.error('Ошибка при получении категорий:', response.statusText)
    }
  } catch (error) {
    console.error('Ошибка запроса категорий:', error)
  }
}

// Заполнение выпадающего списка категорий
function populateCategorySelect(categories) {
  const categorySelect = document.getElementById('category-task')
  if (!categorySelect) {
    console.error('Элемент #task-category не найден!')
    return
  }

  categorySelect.innerHTML = '<option value="">No category</option>'

  categories.forEach((category) => {
    const option = document.createElement('option')
    option.value = category.id
    option.textContent = category.name
    categorySelect.appendChild(option)
  })
}

// Функция для добавления задачи в DOM
function addTaskToDOM(task) {
  const taskListContainer = document.querySelector('.task-list')
  if (!taskListContainer) {
    console.error('Элемент .task-list не найден!')
    return
  }

  const taskElement = document.createElement('div')
  taskElement.className = `task ${getPriorityClass(
    task.priority
  )} toggle-details`
  taskElement.setAttribute('data-id', task.id) // Используем ID вместо title

  // Получаем имя категории из categoryMap, если оно существует
  const categoryName = categoryMap[task.category] || 'No category'

  taskElement.innerHTML = `
    <input type="checkbox" id="task-${task.id}" class="task-checkbox" ${
    task.completed ? 'checked' : ''
  } />
    <div class="task-content">
      <div class="task-collapsed">
        <span class="task-title">${task.title}</span>
        <div class="task-meta">
          <span class="task-date">End: ${formatDate(task.due_date)}</span>
          <span class="task-category">Category: ${categoryName}</span>
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
          <span>Category: ${categoryName}</span>
        </div>
      </div>
    </div>
    <span class="task-star">&#9734;</span>
    <span class="task-delete">&#128465;</span>
  `

  // Применяем обработчики событий к новой задаче
  initTaskEvents(taskElement)

  taskListContainer.appendChild(taskElement)
}

// Загрузка задач
async function loadTasks() {
  const accessToken = localStorage.getItem('access_token')
  try {
    const response = await fetch('/tasks/', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    })

    if (response.ok) {
      const data = await response.json()
      const tasks = data.results

      document.querySelector('.task-list').innerHTML = ''

      if (Array.isArray(tasks)) {
        tasks.forEach(addTaskToDOM)
      } else {
        console.error('Ошибка: задачи не являются массивом.', tasks)
      }
    } else {
      console.error('Ошибка при получении задач:', response.statusText)
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

function getCSRFToken() {
  return document.cookie
    .split('; ')
    .find((row) => row.startsWith('csrftoken='))
    ?.split('=')[1]
}

// Создание новой задачи
document
  .getElementById('addTaskForm')
  .addEventListener('submit', async (event) => {
    event.preventDefault()

    const form = document.getElementById('addTaskForm')
    const formData = new FormData(form)

    const endDate = formData.get('due_date').split(' ')[0]
    const endTime = formData.get('due_date').split(' ')[1] || '00:00'
    formData.set('due_date', `${endDate}T${endTime}:00Z`)

    const accessToken = localStorage.getItem('access_token')
    const csrfToken = getCSRFToken()

    try {
      const response = await fetch('/tasks/create/', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'X-CSRFToken': csrfToken,
        },
        body: formData,
      })

      if (response.ok) {
        const result = await response.json()
        addTaskToDOM(result)
        alert('Задача успешно создана!')
      } else {
        const errorData = await response.json()
        console.error('Ошибка при создании задачи:', errorData)
        alert(`Ошибка: ${JSON.stringify(errorData)}`)
      }
    } catch (error) {
      console.error('Ошибка запроса:', error)
      alert('Произошла ошибка.')
    }
  })

// Инициализация
document.addEventListener('DOMContentLoaded', async () => {
  await fetchCategories() // Сначала загружаем категории
  loadTasks() // Затем загружаем задачи
})
