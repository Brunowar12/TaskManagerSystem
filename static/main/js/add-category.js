function addCategory() {
  const categoryContainer = document.createElement('div')
  categoryContainer.classList.add('category')

  // Генерация случайного цвета для категории
  const randomColor = `#${Math.floor(Math.random() * 16777215).toString(16)}`

  // Добавление HTML для новой категории с полем ввода для названия
  categoryContainer.innerHTML = `
    <input type="checkbox" class="color-checkbox" style="background-color: ${randomColor}" />
    <input type="text" class="category-input" maxlength="20" placeholder="Введите название" onblur="updateCategoryLabel(this)" />
    <button class="delete-category-btn" onclick="deleteCategory(this)">✖</button>
  `

  // Добавление новой категории в список внутри .category-list
  document.querySelector('.category-list').appendChild(categoryContainer)

  // Автоматическое выделение поля ввода, чтобы сразу начать вводить текст
  const input = categoryContainer.querySelector('.category-input')
  input.focus()

  // Добавляем обработчик события keydown для сохранения по Enter
  input.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      updateCategoryLabel(input)
    }
  })
}

// Обработчик для замены поля ввода на текст при потере фокуса
function updateCategoryLabel(input) {
  const labelText = input.value.trim() || 'New Category'
  const label = document.createElement('label')
  label.textContent = labelText
  label.classList.add('editable-label')

  // Добавляем обработчик для редактирования при двойном клике
  label.ondblclick = () => editCategoryLabel(label)

  // Заменяем поле ввода на метку
  input.replaceWith(label)
}

// Функция для редактирования названия категории при двойном клике на метку
function editCategoryLabel(label) {
  const currentText = label.textContent
  const input = document.createElement('input')
  input.type = 'text'
  input.classList.add('category-input')
  input.value = currentText
  input.maxLength = 20 // Ограничение длины текста
  input.onblur = () => updateCategoryLabel(input)

  // Добавляем обработчик для сохранения по Enter
  input.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      updateCategoryLabel(input)
    }
  })

  // Устанавливаем ширину поля ввода, чтобы оно не сдвигало элементы
  input.style.width = `${label.offsetWidth}px`

  // Заменяем метку на поле ввода и фокусируемся на нем
  label.replaceWith(input)
  input.focus()
}

function deleteCategory(button) {
  const category = button.parentElement
  category.remove()
}
