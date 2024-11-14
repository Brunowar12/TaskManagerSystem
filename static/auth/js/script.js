function togglePassword(id) {
  const passwordField = document.getElementById(id)
  const icon = passwordField.nextElementSibling // Иконка рядом с полем

  if (passwordField.type === 'password') {
    passwordField.type = 'text'
    icon.textContent = 'lock_open' // Меняем иконку
  } else {
    passwordField.type = 'password'
    icon.textContent = 'lock' // Возвращаем обратно иконку
  }
}

document
  .getElementById('changeAccountBtn')
  .addEventListener('click', function () {
    console.log('Кнопка нажата')

    // Скрыть элемент user-label
    const userLabel = document.querySelector('.user-label')
    if (userLabel) {
      console.log('Скрываем элемент user-label')
      userLabel.style.display = 'none'
    } else {
      console.log('Элемент user-label не найден')
    }

    // Показать скрытые инпуты
    const inputFields = document.querySelector('.input-fields')
    if (inputFields) {
      console.log('Показываем поля для авторизации')
      inputFields.style.display = 'block'
    } else {
      console.log('Элемент input-fields не найден')
    }
  })
