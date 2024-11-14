document.addEventListener('DOMContentLoaded', () => {
  const tasks = document.querySelectorAll('.task')

  tasks.forEach((task) => {
    const checkbox = task.querySelector('.task-checkbox')
    const star = task.querySelector('.task-star')
    const content = task.querySelector('.task-content')

    // Переключение раскрытия/сворачивания задачи при нажатии на содержимое
    content.addEventListener('click', () => {
      task.classList.toggle('details-visible')
    })

    // Обработка клика по чекбоксу (чтобы зачеркивать текст при выполнении задачи)
    checkbox.addEventListener('click', (e) => {
      e.stopPropagation() // Остановка распространения клика, чтобы не раскрывалась задача
    })

    // Обработка клика по звездочке для избранного
    star.addEventListener('click', (e) => {
      e.stopPropagation() // Остановка распространения клика, чтобы не раскрывалась задача
      star.classList.toggle('active') // Добавление/удаление класса для избранного
      star.innerHTML = star.classList.contains('active') ? '&#9733;' : '&#9734;' // Заполненная или пустая звездочка
    })
  })
})

document.addEventListener('DOMContentLoaded', () => {
  const tasks = document.querySelectorAll('.task')

  tasks.forEach((task) => {
    const priorityButtons = task.querySelectorAll('.priority-btn')

    priorityButtons.forEach((button) => {
      button.addEventListener('click', () => {
        // Удаляем активные классы у всех кнопок
        priorityButtons.forEach((btn) => btn.classList.remove('active'))
        button.classList.add('active')

        // Удаляем классы приоритета у задачи
        task.classList.remove(
          'high-priority',
          'medium-priority',
          'low-priority'
        )

        // Добавляем новый класс приоритета к задаче
        const priority = button.getAttribute('data-priority')
        task.classList.add(`${priority}-priority`)
      })
    })
  })
})
