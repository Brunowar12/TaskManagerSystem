// Открытие попапа добавления задачи
async function openAddTaskPopup() {
  const popup = document.getElementById('addTaskPopup') // Ищем попап по ID
  if (popup) {
    popup.classList.add('show') // Показываем попап
    const addTaskForm = document.getElementById('addTaskForm')
    if (addTaskForm) {
      addTaskForm.reset() // Очищаем поля формы перед добавлением новой задачи
    }
    await fetchCategories() // Загружаем категории перед открытием
  } else {
    console.error('Попап добавления задачи (#addTaskPopup) не найден!')
  }
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
document.getElementById('addTaskForm').onsubmit = async function (event) {
  event.preventDefault()

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
  await createTask(newTaskData)
}

// Открытие попапа редактирования задачи
async function openEditPopup(task) {
  const popup = document.getElementById('editTaskPopup') // Ищем попап по ID
  if (!popup) {
    console.error('Попап редактирования задачи (#editTaskPopup) не найден!')
    return
  }

  document.getElementById('edit-task-title').value = task.title
  document.getElementById('edit-task-description').value =
    task.description || ''
  document.getElementById('edit-task-category').value = task.category || ''
  const [date, time] = task.due_date.split('T')
  document.getElementById('edit-task-end-date').value = date
  document.getElementById('edit-task-end-time').value = time.slice(0, 5)
  document.getElementById('edit-task-priority').value = task.priority

  popup.setAttribute('data-task-id', task.id)
  popup.classList.add('show')
  await fetchCategories()
}

// Закрытие попапа редактирования задачи
function closeEditPopup() {
  const popup = document.getElementById('editTaskPopup') // Ищем попап по ID
  if (popup) {
    popup.classList.remove('show') // Скрываем попап
    popup.removeAttribute('data-task-id') // Удаляем сохраненный ID задачи
  } else {
    console.error('Попап редактирования задачи (#editTaskPopup) не найден!')
  }
}

// Обработка формы редактирования задачи
document.getElementById('editTaskForm').onsubmit = async function (event) {
  event.preventDefault()

  const popup = document.getElementById('editTaskPopup') // Ищем попап по ID
  const taskId = popup.getAttribute('data-task-id')

  if (!taskId) {
    console.error('ID задачи не найден в попапе редактирования.')
    return
  }

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
  await updateTask(taskId, updatedTaskData)
}

// Открытие попапа редактирования профиля
function editProfile() {
  const popup = document.getElementById('updateProfilePopup') // Ищем попап по ID
  if (popup) {
    popup.classList.add('show') // Показываем попап
    fetch('/auth/profile/prf', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('access_token')}`,
        'Content-Type': 'application/json',
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to fetch profile data')
        }
        return response.json()
      })
      .then((data) => {
        console.log('Полученные данные профиля:', data)
        document.getElementById('username').value = data.username || ''
        document.getElementById('email').value = data.email || ''
        document.getElementById('age').value = data.age || ''
        document.getElementById('place_of_work').value =
          data.place_of_work || ''
        document.getElementById('phone_number').value = data.phone_number || ''
      })
      .catch((error) => {
        console.error('Ошибка при загрузке данных профиля:', error)
      })
  } else {
    console.error(
      'Попап для редактирования профиля (#updateProfilePopup) не найден!'
    )
  }
}

// Закрытие попапа редактирования профиля
function closeEditProfilePopup() {
  const popup = document.getElementById('updateProfilePopup') // Ищем попап по ID
  if (popup) {
    popup.classList.remove('show') // Скрываем попап
  } else {
    console.error(
      'Попап для редактирования профиля (#updateProfilePopup) не найден!'
    )
  }
}

// Открытие попапа настроек профиля
function settingsProfile() {
  const popup = document.getElementById('settingsPopup') // Ищем попап настроек
  if (popup) {
    popup.classList.add('show') // Показываем попап
  } else {
    console.error('Попап настроек профиля (#settingsPopup) не найден!')
  }
}

// Закрытие попапа настроек профиля
function closeSettingsPopup() {
  const popup = document.getElementById('settingsPopup') // Ищем попап
  if (popup) {
    popup.classList.remove('show') // Скрываем попап
  } else {
    console.error('Попап настроек профиля (#settingsPopup) не найден!')
  }
}

// Сохранение настроек профиля
function saveSettings() {
  const hideActivityLog = document.getElementById('hide-activity-log').checked
  const encryptEmail = document.getElementById('encrypt-email').checked
  const encryptPhone = document.getElementById('encrypt-phone').checked

  const activityLog = document.querySelector('.activity-log')
  if (activityLog) {
    activityLog.style.display = hideActivityLog ? 'none' : 'block'
  }

  const emailElement = document.querySelector(
    '.user-details p:nth-child(2) span'
  )
  if (emailElement && encryptEmail) {
    emailElement.textContent = emailElement.textContent.replace(
      /(.{2}).+(@.+)/,
      '$1***$2'
    )
  }

  const phoneElement = document.querySelector(
    '.user-details p:nth-child(3) span'
  )
  if (phoneElement && encryptPhone) {
    phoneElement.textContent = phoneElement.textContent.replace(
      /(.{3}).+(.{2})/,
      '$1***$2'
    )
  }

  closeSettingsPopup()
}

// Инициализация событий для кнопок
document.addEventListener('DOMContentLoaded', () => {
  console.log('Инициализация событий для попапов')

  const addTaskButton = document.querySelector('.raise')
  if (addTaskButton) {
    addTaskButton.addEventListener('click', openAddTaskPopup)
  }

  const addTaskCloseButton = document.querySelector('#addTaskPopup .close-btn')
  if (addTaskCloseButton) {
    addTaskCloseButton.addEventListener('click', closeAddTaskPopup)
  }

  const editTaskCloseButton = document.querySelector(
    '#editTaskPopup .close-btn'
  )
  if (editTaskCloseButton) {
    editTaskCloseButton.addEventListener('click', closeEditPopup)
  }

  const editProfileButton = document.querySelector('.edit-profile-button')
  if (editProfileButton) {
    editProfileButton.addEventListener('click', editProfile)
  }

  const closeEditProfileButton = document.querySelector(
    '#updateProfilePopup .close-btn'
  )
  if (closeEditProfileButton) {
    closeEditProfileButton.addEventListener('click', closeEditProfilePopup)
  }

  const settingsButton = document.querySelector('.profile_setting_button')
  if (settingsButton) {
    settingsButton.addEventListener('click', settingsProfile)
  }

  const closeSettingsButton = document.querySelector(
    '#settingsPopup .close-btn'
  )
  if (closeSettingsButton) {
    closeSettingsButton.addEventListener('click', closeSettingsPopup)
  }

  const saveSettingsButton = document.querySelector(
    "#settingsForm button[type='button']"
  )
  if (saveSettingsButton) {
    saveSettingsButton.addEventListener('click', saveSettings)
  }
})
