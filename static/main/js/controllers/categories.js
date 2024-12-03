// Завантаження категорій після завантаження сторінки
document.addEventListener('DOMContentLoaded', () => {
  loadCategories()

  // Делегування подій для подвійного кліку
  const categoryList = document.querySelector('.category-list')
  categoryList.addEventListener('dblclick', (event) => {
    if (event.target && event.target.classList.contains('editable-label')) {
      console.log('Double-click detected on:', event.target) // Перевірка
      editCategoryLabel(event.target)
    }
  })
})

// Завантаження категорій з сервера
async function loadCategories() {
  const categoryList = document.querySelector('.category-list')
  categoryList.innerHTML = '' // Очищення контейнера перед додаванням

  // Проверяем токен перед выполнением запроса
  const accessToken = await ensureTokenIsValid()

  if (!accessToken) {
    console.error('[ERROR] Unable to load categories: no valid token')
    showNotification(
      'Error',
      'Unable to load categories: no valid token.',
      'error'
    )
    return
  }

  try {
    const response = await fetch('/tasks/categories/', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`, // Актуальный токен
      },
    })

    if (!response.ok) {
      throw new Error(`Server error! Status: ${response.status}`)
    }

    const data = await response.json()
    console.log('[SUCCESS] Загружены категории:', data)

    // Добавление категорий в DOM
    data.results.forEach(addCategoryToDOM)
  } catch (error) {
    console.error('[ERROR] Ошибка загрузки категорий:', error)
    showNotification('Error', 'Error loading categories.', 'error')
  }
}

// Додавання категорії в DOM із правильними стилями
function addCategoryToDOM(category) {
  const categoryList = document.querySelector('.category-list')
  const categoryElement = document.createElement('div')

  // Додаємо основний контейнер категорії
  categoryElement.className = 'category'
  categoryElement.setAttribute('data-id', category.id)

  // Вміст категорії
  categoryElement.innerHTML = `
    <input 
      type="checkbox" 
      class="color-checkbox" 
      style="background-color: #9d75b5;" 
    />
    <label class="editable-label">${category.name}</label>
    <button class="delete-category-btn" onclick="deleteCategory(this)">✖</button>
  `

  categoryList.appendChild(categoryElement)
}

// Додавання нової категорії
function addCategory() {
  const categoryContainer = document.createElement('div')
  categoryContainer.classList.add('category')

  // Генерація випадкового кольору
  const randomColor = `#${Math.floor(Math.random() * 16777215).toString(16)}`

  categoryContainer.innerHTML = `
    <input 
      type="checkbox" 
      class="color-checkbox" 
      style="background-color: ${randomColor}" 
    />
    <input 
      type="text" 
      class="category-input" 
      maxlength="20" 
      placeholder="Enter category name" 
      onblur="saveCategory(this)" 
    />
    <button class="delete-category-btn" onclick="deleteCategory(this)">✖</button>
  `

  document.querySelector('.category-list').appendChild(categoryContainer)

  const input = categoryContainer.querySelector('.category-input')
  input.focus()

  input.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      saveCategory(input)
    }
  })
}

// Збереження категорії
async function saveCategory(input) {
  if (!input.isConnected) {
    console.warn('Input element is no longer in the DOM.')
    return
  }

  const categoryName = input.value.trim() || 'New Category'

  // Заміна поля вводу на текстову мітку
  const label = document.createElement('label')
  label.textContent = categoryName
  label.classList.add('editable-label')
  label.ondblclick = () => editCategoryLabel(label)

  // Перевірка перед заміною
  if (input.parentNode) {
    input.replaceWith(label)
  } else {
    console.warn('Input element has already been removed from the DOM.')
  }

  // Відправка категорії на сервер
  await sendCategoryToServer(categoryName)
}

// Відправка нової категорії на сервер
async function sendCategoryToServer(categoryName) {
  const accessToken = await ensureTokenIsValid()

  if (!accessToken) {
    console.error('[ERROR] Невозможно создать категорию: нет валидного токена')
    showNotification(
      'Error',
      'Unable to create category: no valid token.',
      'error'
    )
    return
  }

  try {
    const response = await fetch('/tasks/categories/create/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
        'X-CSRFToken': getCookie('csrftoken'),
      },
      body: JSON.stringify({ name: categoryName }),
    })

    if (!response.ok) {
      throw new Error(`Server error! Status: ${response.status}`)
    }

    const data = await response.json()
    console.log('[SUCCESS] Категория успешно создана:', data)
    showNotification('Success', 'Category successfully created.', 'success')

    // Перезагрузка категорий
    await loadCategories()
  } catch (error) {
    console.error('[ERROR] Ошибка создания категории:', error)
    showNotification('Error', 'Error creating category.', 'error')
  }
}

// Редагування назви категорії
function editCategoryLabel(label) {
  const currentText = label.textContent

  const categoryElement = label.closest('.category')
  if (!categoryElement) return

  const categoryId = categoryElement.getAttribute('data-id')
  if (!categoryId) return

  const input = document.createElement('input')
  input.type = 'text'
  input.value = currentText
  input.classList.add('category-input')

  let isUpdated = false

  input.addEventListener('blur', () => {
    if (!isUpdated) {
      isUpdated = true
      updateCategoryLabel(input, label, categoryId)
    }
  })

  input.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && !isUpdated) {
      isUpdated = true
      updateCategoryLabel(input, label, categoryId)
    }
  })

  label.replaceWith(input)
  input.focus()
}

// Оновлення категорії
async function updateCategoryLabel(input, label, categoryId) {
  if (!input.isConnected) {
    console.warn('Input element is no longer in the DOM.')
    return
  }

  const updatedName = input.value.trim() || 'New Category'
  label.textContent = updatedName

  // Перевірка перед заміною
  if (input.parentNode) {
    input.replaceWith(label)
  } else {
    console.warn('Input element has already been removed from the DOM.')
  }

  await updateCategoryOnServer(categoryId, updatedName)
}

// Оновлення категорії на сервері
async function updateCategoryOnServer(categoryId, updatedName) {
  const accessToken = await ensureTokenIsValid()

  if (!accessToken) {
    console.error('[ERROR] Невозможно обновить категорию: нет валидного токена')
    showNotification(
      'Error',
      'Unable to update category: no valid token.',
      'error'
    )
    return
  }

  try {
    const response = await fetch(`/tasks/categories/${categoryId}/`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
        'X-CSRFToken': getCookie('csrftoken'),
      },
      body: JSON.stringify({ name: updatedName }),
    })

    if (!response.ok) {
      throw new Error(`Failed to update category. Status: ${response.status}`)
    }

    const data = await response.json()
    console.log('[SUCCESS] Категория успешно обновлена:', data)
  } catch (error) {
    console.error('[ERROR] Ошибка обновления категории:', error)
    showNotification('Error', 'Error updating category.', 'error')
  }
}

// Видалення категорії
async function deleteCategory(button) {
  const categoryElement = button.closest('.category')
  const categoryId = categoryElement.getAttribute('data-id')

  if (!categoryId) {
    console.error('[ERROR] Категория не найдена.')
    showNotification('Error', 'Category not found.', 'error')
    return
  }

  // Проверяем токен перед запросом
  const accessToken = await ensureTokenIsValid()

  if (!accessToken) {
    console.error('[ERROR] Невозможно удалить категорию: нет валидного токена')
    showNotification(
      'Error',
      'Cannot delete category: no valid token.',
      'error'
    )
    return
  }

  // Удаляем элемент из DOM
  categoryElement.remove()

  try {
    const response = await fetch(`/tasks/categories/${categoryId}/`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'X-CSRFToken': getCookie('csrftoken'),
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to delete category. Status: ${response.status}`)
    }

    console.log('[SUCCESS] Категория успешно удалена')
    showNotification('Success', 'Category successfully deleted.', 'success')
  } catch (error) {
    console.error('[ERROR] Ошибка удаления категории:', error)
    showNotification('Error', 'Error deleting category.', 'error')
  }
}

// Отримання CSRF токена
function getCookie(name) {
  let cookieValue = null
  if (document.cookie && document.cookie !== '') {
    const cookies = document.cookie.split(';')
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim()
      if (cookie.substring(0, name.length + 1) === name + '=') {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1))
        break
      }
    }
  }
  return cookieValue
}
