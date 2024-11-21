// Открытие попапа редактирования
function openEditPopup(task) {
  const popup = document.querySelector('#specific-section #editTaskPopup')

  if (!popup) {
    console.error(
      'Попап редактирования задачи (#editTaskPopup) не найден в #specific-section!'
    )
    return
  }

  console.log('Открытие попапа редактирования для задачи:', task)

  // Заполняем поля попапа
  popup.querySelector('#edit-task-title').value = task.title || ''
  popup.querySelector('#edit-task-description').value = task.description || ''
  popup.querySelector('#edit-task-category').value = task.category || ''
  const [date, time] = task.due_date.split('T')
  popup.querySelector('#edit-task-end-date').value = date || ''
  popup.querySelector('#edit-task-end-time').value = time
    ? time.slice(0, 5)
    : ''
  popup.querySelector('#edit-task-priority').value = task.priority || ''

  // Сохраняем ID задачи
  popup.setAttribute('data-task-id', task.id)

  // Показываем попап
  popup.classList.add('show')
}

// Закрытие попапа редактирования
function closeEditPopup() {
  const popup = document.querySelector('#specific-section #editTaskPopup')
  if (!popup) {
    console.error(
      'Попап редактирования задачи (#editTaskPopup) не найден в #specific-section!'
    )
    return
  }

  console.log('Закрытие попапа редактирования')

  popup.classList.remove('show')
  popup.removeAttribute('data-task-id')
}

// Обработка формы редактирования
document.addEventListener('DOMContentLoaded', () => {
  const section = document.querySelector('#specific-section')
  if (!section) {
    console.error('#specific-section не найден!')
    return
  }

  const editForm = section.querySelector('#editTaskForm')
  if (editForm) {
    editForm.onsubmit = async function (event) {
      event.preventDefault()

      const popup = section.querySelector('#editTaskPopup')
      const taskId = popup.getAttribute('data-task-id')

      if (!taskId) {
        console.error('ID задачи не найден в попапе редактирования.')
        return
      }

      console.log('Отправка формы редактирования для задачи ID:', taskId)

      // Убедимся, что токен валиден
      const accessToken = await ensureTokenIsValid()
      if (!accessToken) {
        console.error('Нет валидного токена. Авторизация требуется.')
        alert('You are not authenticated. Please log in again.')
        return
      }

      // Собираем данные формы
      const updatedTaskData = {
        title: popup.querySelector('#edit-task-title').value,
        description: popup.querySelector('#edit-task-description').value,
        category: popup.querySelector('#edit-task-category').value,
        due_date: `${popup.querySelector('#edit-task-end-date').value}T${
          popup.querySelector('#edit-task-end-time').value
        }:00Z`,
        priority: popup.querySelector('#edit-task-priority').value,
      }

      console.log('Данные для обновления задачи:', updatedTaskData)

      // Вызываем обновление задачи (предполагается, что функция updateTask уже определена)
      updateTask(taskId, updatedTaskData)
    }
  }

  // Связываем кнопки закрытия с функцией
  section.querySelectorAll('.close-btn').forEach((btn) => {
    btn.addEventListener('click', closeEditPopup)
  })
})
