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

// Отримуємо access token
const accessToken = localStorage.getItem('access_token')

// Завантаження категорій з сервера
async function loadCategories() {
  const categoryList = document.querySelector('.category-list')
  categoryList.innerHTML = '' // Очищення контейнера перед додаванням

  try {
    const response = await fetch('/tasks/categories/', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`, // Авторизація через токен
      },
    })

    if (!response.ok) {
      throw new Error(`Server error! Status: ${response.status}`)
    }

    const data = await response.json()
    console.log('Loaded categories:', data)

    // Додавання категорій в DOM
    data.results.forEach(addCategoryToDOM)
  } catch (error) {
    console.error('Error loading categories:', error)
    alert('Error loading categories')
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
function saveCategory(input) {
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
  sendCategoryToServer(categoryName)
}

// Відправка нової категорії на сервер
function sendCategoryToServer(categoryName) {
  fetch('/tasks/categories/create/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
      'X-CSRFToken': getCookie('csrftoken'),
    },
    body: JSON.stringify({ name: categoryName }),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Server error! Status: ${response.status}`)
      }
      return response.json()
    })
    .then((data) => {
      console.log('Category created successfully:', data)
      loadCategories() // Перезавантаження категорій
    })
    .catch((error) => {
      console.error('Error creating category:', error)
      alert('Error creating category')
    })
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
function updateCategoryLabel(input, label, categoryId) {
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

  updateCategoryOnServer(categoryId, updatedName)
}

// Оновлення категорії на сервері
function updateCategoryOnServer(categoryId, updatedName) {
  fetch(`/tasks/categories/${categoryId}/`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
      'X-CSRFToken': getCookie('csrftoken'),
    },
    body: JSON.stringify({ name: updatedName }),
  })
    .then((response) => {
      if (!response.ok)
        throw new Error(`Failed to update category. Status: ${response.status}`)
      return response.json()
    })
    .then((data) => {
      console.log('Category updated successfully:', data)
    })
    .catch((error) => {
      console.error('Error updating category:', error)
      alert('Error updating category')
    })
}

// Видалення категорії
function deleteCategory(button) {
  const categoryElement = button.closest('.category')
  const categoryId = categoryElement.getAttribute('data-id')

  categoryElement.remove()

  fetch(`/tasks/categories/${categoryId}/`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'X-CSRFToken': getCookie('csrftoken'),
    },
  })
    .then((response) => {
      if (!response.ok)
        throw new Error(`Failed to delete category. Status: ${response.status}`)
      console.log('Category deleted successfully')
    })
    .catch((error) => {
      console.error('Error deleting category:', error)
    })
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
