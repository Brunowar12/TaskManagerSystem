// Функция для добавления задачи в DOM
function addTaskToDOM(task) {
  const taskListContainer = document.querySelector('.task-list')
  const taskElement = document.createElement('div')
  taskElement.className = `task ${getPriorityClass(
    task.priority
  )} toggle-details`
  taskElement.setAttribute('data-id', task.id)

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

  taskListContainer.appendChild(taskElement)
}

// Обработчик для отправки формы создания задачи
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
        console.log('New task added:', result)
        alert('Задача успешно создана!')

        // Добавляем новую задачу в DOM
        addTaskToDOM(result)
      } else {
        const errorData = await response.json()
        console.error('Ошибка при создании задачи:', errorData)
        alert(`Ошибка при создании задачи: ${JSON.stringify(errorData)}`)
      }
    } catch (error) {
      console.error('Ошибка запроса:', error)
      alert('Произошла ошибка при создании задачи.')
    }
  })
