// Глобальный объект для хранения категорий
let categoryMap = {}
let nextPageUrl = '/tasks/' // URL первой страницы
const loadMoreButton = document.getElementById('load-more-btn')

// Функция для загрузки категорий и их сопоставления
async function fetchCategories() {
  const accessToken = await ensureTokenIsValid()
  if (!accessToken) {
    console.error('[ERROR] Невозможно получить категории: нет валидного токена')
    showNotification(
      'Error',
      'Failed to fetch categories: Invalid token.',
      'error'
    )
    return
  }

  try {
    const response = await fetch('/tasks/categories/', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    })

    if (response.ok) {
      const categories = await response.json()
      populateCategorySelect(categories.results)

      categoryMap = categories.results.reduce((map, category) => {
        map[category.id] = category.name
        return map
      }, {})

      console.log('[SUCCESS] Категории загружены:', categories.results)
    } else {
      console.error(
        '[ERROR] Ошибка при получении категорий:',
        response.status,
        response.statusText
      )
      showNotification(
        'Error',
        `Failed to fetch categories: ${response.statusText}`,
        'error'
      )
    }
  } catch (error) {
    console.error('[ERROR] Ошибка запроса категорий:', error)
    showNotification(
      'Error',
      'An error occurred while fetching categories.',
      'error'
    )
  }
}

// Заполнение выпадающего списка категорий
function populateCategorySelect(categories) {
  const categorySelect = document.getElementById('category-task')
  const editCategorySelect = document.getElementById('edit-task-category')

  ;[categorySelect, editCategorySelect].forEach((select) => {
    if (!select) return

    select.innerHTML = '<option value="">No category</option>'
    categories.forEach((category) => {
      const option = document.createElement('option')
      option.value = category.id
      option.textContent = category.name
      select.appendChild(option)
    })
  })
}

// Функция для добавления задачи в DOM
function addTaskToDOM(task) {
  const taskListContainer = document.querySelector('.task-list')
  if (!taskListContainer) {
    console.error('Элемент .task-list не найден!')
    showNotification('Error', 'Task list container not found!', 'error')
    return
  }

  const taskElement = document.createElement('div')
  taskElement.className = `task ${getPriorityClass(
    task.priority
  )} toggle-details`
  taskElement.setAttribute('data-id', task.id)

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
    <span class="edit-task-btn">&#9998;</span>
    <span class="task-star ${task.is_favorite ? 'active' : ''}">${
    task.is_favorite ? '&#9733;' : '&#9734;'
  }</span>
    <span class="task-delete">&#128465;</span>
  `

  initTaskEvents(taskElement)
  taskElement.querySelector('.edit-task-btn').addEventListener('click', () => {
    openEditPopup(task)
  })

  taskListContainer.appendChild(taskElement)
}

// Загрузка задач с использованием пагинации
async function loadTasksWithPagination() {
  if (!nextPageUrl) {
    loadMoreButton.style.display = 'none' // Скрываем кнопку, если нет больше данных
    return
  }

  const accessToken = localStorage.getItem('access_token')
  try {
    const response = await fetch(nextPageUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    })

    if (response.ok) {
      const data = await response.json()
      const tasks = data.results
      nextPageUrl = data.next // Сохраняем URL следующей страницы

      if (Array.isArray(tasks)) {
        tasks.forEach(addTaskToDOM) // Добавляем задачи в DOM
      }

      if (!nextPageUrl) {
        loadMoreButton.style.display = 'none' // Скрываем кнопку, если больше страниц нет
      }
    } else {
      console.error('Ошибка при получении задач:', response.statusText)
      showNotification('Error', 'Failed to fetch tasks.', 'error')
    }
  } catch (error) {
    console.error('Ошибка при запросе задач:', error)
    showNotification(
      'Error',
      'An error occurred while fetching tasks.',
      'error'
    )
  }
}

// Создание новой задачи через POST
// Создание новой задачи через POST
async function createTask(newTaskData) {
  if (!newTaskData.title || !newTaskData.description || !newTaskData.due_date) {
    showNotification(
      'Error',
      'Title, description, and Date fields must be filled.',
      'error'
    )
    return
  }

  const today = new Date() // Получаем сегодняшнюю дату
  today.setHours(0, 0, 0, 0) // Обнуляем часы, минуты, секунды и миллисекунды
  const dueDate = new Date(newTaskData.due_date)

  if (dueDate < today) {
    showNotification(
      'Error',
      'The due date cannot be earlier than today.',
      'error'
    )
    return
  }

  const accessToken = localStorage.getItem('access_token')
  const csrfToken = getCSRFToken()

  try {
    const response = await fetch('/tasks/create/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
        'X-CSRFToken': csrfToken,
      },
      body: JSON.stringify(newTaskData),
    })

    if (response.ok) {
      const createdTask = await response.json()
      console.log('Задача успешно создана:', createdTask)

      addTaskToDOM(createdTask)
      closeAddTaskPopup()
      showNotification('Success', 'Task successfully created.', 'success')
    } else {
      const errorResponse = await response.json()
      console.error('Ошибка при создании задачи:', errorResponse)
      showNotification(
        'Error',
        errorResponse.message || 'Failed to create task.',
        'error'
      )
    }
  } catch (error) {
    console.error('Ошибка при запросе создания задачи:', error)
    showNotification(
      'Error',
      'An error occurred while creating the task.',
      'error'
    )
  }
}

// Вспомогательные функции
function getPriorityClass(priority) {
  if (priority === 'high' || priority === 'H') return 'high-priority'
  if (priority === 'medium' || priority === 'M') return 'medium-priority'
  return 'low-priority'
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

// Инициализация
document.addEventListener('DOMContentLoaded', async () => {
  await fetchCategories()
  loadTasksWithPagination()
})

// Обработчик для кнопки "Load More"
loadMoreButton.addEventListener('click', loadTasksWithPagination)
