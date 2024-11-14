// Функция для проверки всех полей
function validateForm() {
  const emailField = document.getElementById('email')
  const passwordField = document.getElementById('password')
  const confirmPasswordField = document.getElementById('confirm_password')

  const email = emailField.value
  const password = passwordField.value
  const confirmPassword = confirmPasswordField.value

  emailField.classList.remove('input-error')
  passwordField.classList.remove('input-error')
  confirmPasswordField.classList.remove('input-error')

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/
  const cyrillicRegex = /[А-Яа-яЁёЇїІіЄєҐґ]/

  if (!email && !password && !confirmPassword) {
    showNotification('Error', 'All fields must be filled out', 'error')
    emailField.classList.add('input-error')
    passwordField.classList.add('input-error')
    confirmPasswordField.classList.add('input-error')
    return false
  }

  if (!email) {
    showNotification('Error', 'Email field cannot be empty', 'error')
    emailField.classList.add('input-error')
    return false
  }

  if (!emailRegex.test(email)) {
    showNotification('Error', 'Invalid email format', 'error')
    emailField.classList.add('input-error')
    return false
  }

  if (!password && !confirmPassword) {
    showNotification(
      'Error',
      'Both password fields must be filled out',
      'error'
    )
    passwordField.classList.add('input-error')
    confirmPasswordField.classList.add('input-error')
    return false
  }

  if (!password) {
    showNotification('Error', 'Password field cannot be empty', 'error')
    passwordField.classList.add('input-error')
    return false
  }

  if (cyrillicRegex.test(password)) {
    showNotification(
      'Warning',
      'Switch to English keyboard layout for the password',
      'warning'
    )
    passwordField.classList.add('input-error')
    return false
  }

  if (!passwordRegex.test(password)) {
    showNotification(
      'Error',
      'Password must be at least 8 characters long and include at least one letter and one number',
      'error'
    )
    passwordField.classList.add('input-error')
    return false
  }

  if (!confirmPassword) {
    showNotification('Error', 'Confirm Password field cannot be empty', 'error')
    confirmPasswordField.classList.add('input-error')
    return false
  }

  if (password !== confirmPassword) {
    showNotification('Warning', 'Passwords do not match', 'warning')
    passwordField.classList.add('input-error')
    confirmPasswordField.classList.add('input-error')
    return false
  }

  return true
}

// Добавляем проверку и отправку формы при нажатии на кнопку регистрации
document
  .querySelector('.create-account-button')
  .addEventListener('click', async function (event) {
    event.preventDefault() // Остановить отправку формы для проверки валидации

    if (validateForm()) {
      const email = document.getElementById('email').value
      const password = document.getElementById('password').value
      const csrftoken = document.querySelector(
        '[name=csrfmiddlewaretoken]'
      ).value

      try {
        const response = await fetch('/register/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrftoken,
          },
          body: JSON.stringify({ email: email, password: password }),
        })

        if (response.ok) {
          const data = await response.json()
          showNotification(
            'Success',
            `Реєстрація успішна! Ласкаво просимо, ${data.username}`,
            'success'
          )
        } else {
          const errorData = await response.json()
          showNotification(
            'Error',
            errorData.email ||
              errorData.password ||
              'Виникла невідома помилка.',
            'error'
          )
        }
      } catch (error) {
        console.error('Помилка запиту', error)
        showNotification(
          'Error',
          'Не вдалося підключитися до сервера.',
          'error'
        )
      }
    }
  })
