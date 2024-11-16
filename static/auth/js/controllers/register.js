// Функція для отримання CSRF-токена з cookies
function getCSRFToken() {
  let cookieValue = null
  if (document.cookie && document.cookie !== '') {
    const cookies = document.cookie.split(';')
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim()
      if (cookie.startsWith('csrftoken=')) {
        cookieValue = decodeURIComponent(cookie.substring('csrftoken='.length))
        break
      }
    }
  }
  return cookieValue
}

// Функція для отримання access-токена через /auth/token
async function fetchAccessToken(email, password) {
  const csrftoken = getCSRFToken()

  try {
    const response = await fetch('/auth/token/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': csrftoken,
      },
      body: JSON.stringify({ email, password }),
    })

    if (response.ok) {
      const data = await response.json()
      return data.access
    } else {
      const errorData = await response.json()
      showNotification(
        'Error',
        errorData.detail || 'Не вдалося отримати токен доступу.',
        'error'
      )
      return null
    }
  } catch (error) {
    console.error('Помилка запиту', error)
    showNotification(
      'Error',
      'Не вдалося підключитися до сервера для отримання токена.',
      'error'
    )
    return null
  }
}

// Функція для валідації полів реєстраційної форми
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

  if (!email || !password || !confirmPassword) {
    showNotification('Error', 'All fields must be filled out', 'error')
    if (!email) emailField.classList.add('input-error')
    if (!password) passwordField.classList.add('input-error')
    if (!confirmPassword) confirmPasswordField.classList.add('input-error')
    return false
  }

  if (!emailRegex.test(email)) {
    showNotification('Error', 'Invalid email format', 'error')
    emailField.classList.add('input-error')
    return false
  }

  if (cyrillicRegex.test(password) || !passwordRegex.test(password)) {
    showNotification(
      'Error',
      'Password must be at least 8 characters long, include letters and numbers, and be in English.',
      'error'
    )
    passwordField.classList.add('input-error')
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

// Подія на кнопку реєстрації для надсилання форми
document
  .querySelector('.create-account-button')
  .addEventListener('click', async function (event) {
    event.preventDefault()

    if (validateForm()) {
      const email = document.getElementById('email').value
      const password = document.getElementById('password').value
      const csrftoken = getCSRFToken()

      try {
        const response = await fetch('/auth/register/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrftoken,
          },
          body: JSON.stringify({ email, password }),
        })

        if (response.ok) {
          const data = await response.json()
          const username = data.username

          // Автоматичне отримання access-токена після реєстрації
          const accessToken = await fetchAccessToken(email, password)

          if (accessToken) {
            // Зберігаємо токен і ім'я користувача в localStorage
            localStorage.setItem('access_token', accessToken)
            localStorage.setItem('username', username)

            // Оновлюємо інтерфейс після авторизації
            updateAuthUI(username)

            // Показуємо повідомлення про успішну реєстрацію
            showNotification(
              'Success',
              `Реєстрація успішна! Ласкаво просимо, ${username}`,
              'success'
            )

            // Плавне перенаправлення на головну сторінку через 2 секунди
            setTimeout(() => {
              window.location.href = '/'
            }, 2000)
          }
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

// Перевірка авторизації при завантаженні сторінки
window.addEventListener('load', () => {
  const username = localStorage.getItem('username')
  const accessToken = localStorage.getItem('access_token')

  if (username && accessToken) {
    // Якщо користувач авторизований, оновлюємо інтерфейс
    updateAuthUI(username)
  }
})
