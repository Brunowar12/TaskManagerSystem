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

// Функція для отримання токенів через /auth/token
async function fetchTokens(email, password) {
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
      console.log('[DEBUG] Response from /auth/token/:', data) // Логируем ответ
      return {
        access: data.access,
        refresh: data.refresh,
      }
    } else {
      const errorData = await response.json()
      console.error('[ERROR] Failed to fetch tokens:', errorData)
      showNotification(
        'Error',
        errorData.detail || 'Не вдалося отримати токени доступу.',
        'error'
      )
      return null
    }
  } catch (error) {
    console.error('[ERROR] Request failed:', error)
    showNotification(
      'Error',
      'Не вдалося підключитися до сервера для отримання токенів.',
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

          console.log('[DEBUG] Registration successful:', data)

          // Автоматичне отримання токенів після реєстрації
          const tokens = await fetchTokens(email, password)

          if (tokens && tokens.access && tokens.refresh) {
            // Зберігаємо токени і ім'я користувача в localStorage
            localStorage.setItem('access_token', tokens.access)
            localStorage.setItem('refresh_token', tokens.refresh)
            localStorage.setItem('username', username)

            console.log('[DEBUG] Tokens saved to localStorage:', {
              access: tokens.access,
              refresh: tokens.refresh,
              username: username,
            })

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
          } else {
            console.error('[ERROR] Tokens are missing from the response.')
            showNotification(
              'Error',
              'Не вдалося отримати токени доступу. Спробуйте ще раз.',
              'error'
            )
          }
        } else {
          const errorData = await response.json()
          console.error('[ERROR] Registration failed:', errorData)
          showNotification(
            'Error',
            errorData.email ||
              errorData.password ||
              'Виникла невідома помилка.',
            'error'
          )
        }
      } catch (error) {
        console.error('[ERROR] Request failed during registration:', error)
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
  const refreshToken = localStorage.getItem('refresh_token')

  console.log('[DEBUG] Current tokens in localStorage:', {
    username,
    accessToken,
    refreshToken,
  })

  if (username && accessToken) {
    // Якщо користувач авторизований, оновлюємо інтерфейс
    updateAuthUI(username)
  }
})
