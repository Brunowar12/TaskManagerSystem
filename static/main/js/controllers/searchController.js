// Функция для фильтрации задач по поисковому запросу
function searchTasks(query) {
  const taskElements = document.querySelectorAll('.task')
  const normalizedQuery = query.trim().toLowerCase()

  taskElements.forEach((taskElement) => {
    const title = taskElement
      .querySelector('.task-title')
      .textContent.toLowerCase()
    const description = taskElement.querySelector('.task-description')
      ? taskElement.querySelector('.task-description').textContent.toLowerCase()
      : ''

    // Проверка, содержит ли заголовок или описание поисковую строку
    if (
      title.includes(normalizedQuery) ||
      description.includes(normalizedQuery)
    ) {
      taskElement.style.visibility = 'visible' // Показать задачу без удаления из макета
      taskElement.style.position = 'relative' // Убедиться, что элемент не меняет своё место
    } else {
      taskElement.style.visibility = 'hidden' // Скрыть задачу, но сохранить её место в макете
      taskElement.style.position = 'absolute' // Предотвращение смещения других элементов
    }
  })
}

// Функция для установки обработчика поиска
function setupSearchController() {
  const searchInput = document.getElementById('search')

  if (searchInput) {
    searchInput.addEventListener('input', (event) => {
      const query = event.target.value
      searchTasks(query)
    })
  } else {
    console.error('Поисковое поле не найдено!')
  }
}

// Инициализация поиска
document.addEventListener('DOMContentLoaded', () => {
  setupSearchController()
})
