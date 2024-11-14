// Функция для открытия попапа
function openPopup() {
  document.getElementById('addTaskPopup').classList.add('show')
}

// Функция для закрытия попапа
function closePopup() {
  document.getElementById('addTaskPopup').classList.remove('show')
}

// Закрытие попапа при клике вне его
window.onclick = function (event) {
  const popup = document.getElementById('addTaskPopup')
  if (event.target === popup) {
    closePopup()
  }
}

// Обработчик для добавления задачи
document.getElementById('addTaskForm').onsubmit = function (event) {
  event.preventDefault() // Предотвращаем стандартное поведение формы

  // Получаем значения полей
  const title = document.getElementById('task-title').value
  const description = document.getElementById('task-description').value
  const endDate = document.getElementById('task-end-date').value
  const endTime = document.getElementById('task-end-time').value
  const category = document.getElementById('task-category').value
  const priority = document.getElementById('task-priority').value

  // Получаем все уведомления
  const notifications = Array.from(
    document.querySelectorAll('#notifications .notification')
  ).map((notification) => {
    return {
      type: notification.querySelector('[name="notification-type"]').value,
      time: notification.querySelector('[name="notification-time"]').value,
      unit: notification.querySelector('[name="notification-time-unit"]').value,
    }
  })

  console.log('New task added:', {
    title,
    description,
    endDate,
    endTime,
    category,
    priority,
    notifications,
  })

  // Закрываем попап после добавления задачи
  closePopup()

  // Очистка полей формы
  document.getElementById('addTaskForm').reset()
}
