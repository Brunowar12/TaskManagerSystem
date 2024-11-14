const notificationContainer = document.createElement('div')
notificationContainer.className = 'notifications'
document.body.appendChild(notificationContainer)

function showNotification(title, message, type = 'info') {
  const notification = document.createElement('div')
  notification.className = `notification ${type}`

  notification.innerHTML = `
    <div class="icon ${type}">${getIcon(type)}</div>
    <div>
      <h2>${title}</h2>
      <p>${message}</p>
    </div>
    <button class="close">×</button>
  `

  // Добавляем обработчик для крестика, чтобы удалить уведомление при нажатии
  const closeButton = notification.querySelector('.close')
  closeButton.addEventListener('click', () => {
    clearTimeout(autoRemoveTimeout) // Отменяем автоматическое удаление
    notification.remove()
  })

  notificationContainer.appendChild(notification)

  // Устанавливаем таймер для автоматического удаления уведомления через 3 секунды
  const autoRemoveTimeout = setTimeout(() => {
    notification.remove()
  }, 3000)
}

// Функция для получения иконки по типу уведомления
function getIcon(type) {
  switch (type) {
    case 'success':
      return '✔️'
    case 'error':
      return '❌'
    case 'info':
      return 'ℹ️'
    case 'warning':
      return '⚠️'
    default:
      return ''
  }
}
