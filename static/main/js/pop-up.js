// Открытие попапа добавления задачи
function openAddTaskPopup() {
  const popup = document.getElementById('addTaskPopup') // Ищем попап по ID
  if (popup) {
    popup.classList.add('show') // Показываем попап
    const addTaskForm = document.getElementById('addTaskForm')
    if (addTaskForm) {
      addTaskForm.reset() // Очищаем поля формы перед добавлением новой задачи
    }
  } else {
    console.error('Попап добавления задачи (#addTaskPopup) не найден!')
  }
  fetchCategories()
}

// Закрытие попапа добавления задачи
function closeAddTaskPopup() {
  const popup = document.getElementById('addTaskPopup') // Ищем попап по ID
  if (popup) {
    popup.classList.remove('show') // Скрываем попап
  } else {
    console.error('Попап добавления задачи (#addTaskPopup) не найден!')
  }
}

// Обработка формы добавления задачи
document.getElementById('addTaskForm').onsubmit = function (event) {
  event.preventDefault()

  // Собираем данные формы
  const newTaskData = {
    title: document.getElementById('task-title').value,
    description: document.getElementById('task-description').value,
    category: document.getElementById('category-task').value,
    due_date: `${document.getElementById('task-end-date').value}T${
      document.getElementById('task-end-time').value
    }:00Z`,
    priority: document.getElementById('task-priority').value,
  }

  console.log('Добавление новой задачи:', newTaskData)

  // Вызываем создание задачи (предполагается, что функция createTask уже определена)
  createTask(newTaskData)
}

// Открытие попапа редактирования задачи
function openEditPopup(task) {
  const popup = document.getElementById('editTaskPopup') // Ищем попап по ID

  // Заполняем поля попапа
  document.getElementById('edit-task-title').value = task.title
  document.getElementById('edit-task-description').value =
    task.description || ''
  document.getElementById('edit-task-category').value = task.category || ''
  const [date, time] = task.due_date.split('T')
  document.getElementById('edit-task-end-date').value = date
  document.getElementById('edit-task-end-time').value = time.slice(0, 5)
  document.getElementById('edit-task-priority').value = task.priority

  // Сохраняем ID задачи
  popup.setAttribute('data-task-id', task.id)

  popup.classList.add('show')
  fetchCategories()
}

// Закрытие попапа редактирования задачи
function closeEditPopup() {
  const popup = document.getElementById('editTaskPopup') // Ищем попап по ID
  popup.classList.remove('show') // Скрываем попап
  popup.removeAttribute('data-task-id') // Удаляем сохраненный ID задачи
}

// Обработка формы редактирования задачи
document.getElementById('editTaskForm').onsubmit = function (event) {
  event.preventDefault()

  const popup = document.getElementById('editTaskPopup') // Ищем попап по ID
  const taskId = popup.getAttribute('data-task-id') // Получаем ID задачи

  // Собираем данные формы
  const updatedTaskData = {
    title: document.getElementById('edit-task-title').value,
    description: document.getElementById('edit-task-description').value,
    category: document.getElementById('edit-task-category').value,
    due_date: `${document.getElementById('edit-task-end-date').value}T${
      document.getElementById('edit-task-end-time').value
    }:00Z`,
    priority: document.getElementById('edit-task-priority').value,
  }

  console.log('Обновление задачи:', updatedTaskData)

  // Вызываем обновление задачи (предполагается, что функция updateTask уже определена)
  updateTask(taskId, updatedTaskData)
}

// Инициализация событий для кнопок
document.addEventListener('DOMContentLoaded', () => {
  console.log('Инициализация попапов')

  // Кнопка открытия попапа добавления задачи
  const addTaskButton = document.querySelector('.raise')
  if (addTaskButton) {
    addTaskButton.addEventListener('click', openAddTaskPopup)
  }

  // Кнопка закрытия попапа добавления задачи
  const addTaskCloseButton = document.querySelector('#addTaskPopup .close-btn')
  if (addTaskCloseButton) {
    addTaskCloseButton.addEventListener('click', closeAddTaskPopup)
  }

  // Кнопка закрытия попапа редактирования задачи
  const editTaskCloseButton = document.querySelector(
    '#editTaskPopup .close-btn'
  )
  if (editTaskCloseButton) {
    editTaskCloseButton.addEventListener('click', closeEditPopup)
  }
})
