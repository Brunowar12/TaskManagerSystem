function initTaskEvents(taskElement) {
  const checkbox = taskElement.querySelector('.task-checkbox')
  const star = taskElement.querySelector('.task-star')
  const content = taskElement.querySelector('.task-content')

  // Переключение раскрытия/сворачивания задачи при нажатии на содержимое
  content.addEventListener('click', () => {
    taskElement.classList.toggle('details-visible')
  })

  // Обработка клика по чекбоксу
  checkbox.addEventListener('click', (e) => {
    e.stopPropagation()
  })

  // Обработка клика по звездочке
  star.addEventListener('click', (e) => {
    e.stopPropagation()
    star.classList.toggle('active')
    star.innerHTML = star.classList.contains('active') ? '&#9733;' : '&#9734;'
  })
}

// Вызываем initTaskEvents для всех задач, уже находящихся на странице
document.addEventListener('DOMContentLoaded', () => {
  const tasks = document.querySelectorAll('.task')
  tasks.forEach(initTaskEvents)
})
