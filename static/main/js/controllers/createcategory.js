document.addEventListener('DOMContentLoaded', loadCategories)

// Отримуємо access token
const accessToken = localStorage.getItem('access_token')

// Функція для завантаження категорій із сервера
async function loadCategories() {
  try {
    const response = await fetch('/tasks/categories/', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`, // Додаємо токен доступу
      },
    })

    if (!response.ok) {
      throw new Error(`Server error! Status: ${response.status}`)
    }

    const data = await response.json()
    console.log('Response data:', data) // Додано для відладки

    // Перевіряємо, чи `data.results` є масивом і містить категорії
    if (Array.isArray(data.results)) {
      const categoryList = document.querySelector('.category-list')
      // Очищаємо контейнер категорій перед додаванням нових
      categoryList.innerHTML = ''

      // Додаємо кожну категорію в DOM
      data.results.forEach(addCategoryToDOM)
    } else {
      console.error('Помилка: невірний формат даних або відсутні категорії.')
      alert('Error loading categories')
    }
  } catch (error) {
    console.error('Помилка при запиті категорій:', error)
    alert('Error loading categories')
  }
}

// Функція для додавання категорії в DOM
function addCategoryToDOM(category) {
  const categoryList = document.querySelector('.category-list')
  const categoryElement = document.createElement('div')

  categoryElement.className = 'category'
  categoryElement.setAttribute('bis_skin_checked', '1')
  categoryElement.setAttribute('data-id', category.id) // Зберігаємо ID категорії

  // HTML структура категорії
  categoryElement.innerHTML = `
    <input type="checkbox" class="color-checkbox" style="background-color: #9d75b5" />
    <label class="editable-label">${category.name}</label>
    <button class="delete-category-btn" onclick="deleteCategory(this)">✖</button>
  `

  // Додаємо категорію до контейнера категорій
  categoryList.appendChild(categoryElement)
}

// Функція для додавання нової категорії
function addCategory() {
  const categoryContainer = document.createElement('div')
  categoryContainer.classList.add('category')

  // Генерація випадкового кольору для чекбоксу
  const randomColor = `#${Math.floor(Math.random() * 16777215).toString(16)}`

  // Додаємо HTML для нової категорії з полем вводу для назви
  categoryContainer.innerHTML = `
    <input type="checkbox" class="color-checkbox" style="background-color: ${randomColor}" />
    <input type="text" class="category-input" maxlength="20" placeholder="Введите название" onblur="saveCategory(this)" />
    <button class="delete-category-btn" onclick="deleteCategory(this)">✖</button>
  `

  // Додаємо нову категорію в список
  document.querySelector('.category-list').appendChild(categoryContainer)

  // Фокусуємося на інпуті, щоб користувач одразу міг вводити текст
  const input = categoryContainer.querySelector('.category-input')
  input.focus()

  // Додаємо обробник події keydown для збереження при натисканні Enter
  input.addEventListener('keydown', function handleEnter(event) {
    if (event.key === 'Enter') {
      saveCategory(input)
      // Видаляємо обробник події після збереження
      input.removeEventListener('keydown', handleEnter)
    }
  })
}

// Функція для збереження нової категорії на сервер
function saveCategory(input) {
  // Перевіряємо, чи елемент все ще в DOM
  if (!input.isConnected) return

  const categoryName = input.value.trim() || 'New Category'

  // Створюємо label для відображення тексту категорії
  const label = document.createElement('label')
  label.textContent = categoryName
  label.classList.add('editable-label')

  // Додаємо обробник для редагування при подвійному кліку
  label.ondblclick = () => editCategoryLabel(label)

  // Заміна поля вводу на текстову мітку
  input.replaceWith(label)

  // Відправляємо нову категорію на сервер
  sendCategoryToServer(categoryName)
}

// Функція для відправки нової категорії на сервер
function sendCategoryToServer(categoryName) {
  fetch('/tasks/categories/create/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`, // Додаємо токен доступу
      'X-CSRFToken': getCookie('csrftoken'), // CSRF Token для Django
    },
    body: JSON.stringify({
      name: categoryName,
    }),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Server error! Status: ${response.status}`)
      }
      return response.json()
    })
    .then((data) => {
      console.log('Response from server:', data) // Додано для відладки

      // Перевіряємо, чи повернені потрібні поля (id та name)
      if (data.id && data.name) {
        // Якщо категорія успішно додана в базу, перезавантажуємо всі категорії з сервера
        loadCategories()
      } else {
        console.error('Ошибка при создании категории на сервере')
        alert('Ошибка создания категории')
      }
    })
    .catch((error) => {
      console.error('Ошибка при отправке категории на сервер:', error)
      alert('Ошибка при отправке категории')
    })
}

// Функція для видалення категорії
function deleteCategory(button) {
  const categoryDiv = button.closest('.category')
  const categoryId = categoryDiv.getAttribute('data-id') // Отримуємо ID категорії

  // Викликаємо функцію для видалення категорії з сервера
  deleteCategoryFromServer(categoryId, () => {
    // Видаляємо елемент з DOM після успішного видалення на сервері
    categoryDiv.remove()
  })
}

// Функція для видалення категорії з сервера
function deleteCategoryFromServer(categoryId, callback) {
  fetch(`/tasks/categories/${categoryId}/`, {
    // Видалено 'delete/' з URL
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${accessToken}`, // Додаємо токен доступу
      'X-CSRFToken': getCookie('csrftoken'), // CSRF Token для Django
    },
  })
    .then((response) => {
      if (response.ok) {
        callback() // Викликаємо колбек для видалення з DOM
      } else {
        throw new Error(`Failed to delete category. Status: ${response.status}`)
      }
    })
    .catch((error) => {
      console.error('Ошибка при удалении категории на сервере:', error)
      alert('Ошибка при удалении категории')
    })
}

// Функція для отримання CSRF токена з cookies (для Django)
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
