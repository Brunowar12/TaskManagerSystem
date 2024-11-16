// Функция для получения CSRF-токена из cookies
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

// Функция для обновления интерфейса после авторизации
function updateAuthUI(username) {
  const userLabel = document.getElementById('userLabel')
  const usernameDisplay = document.getElementById('usernameDisplay')
  const inputFields = document.querySelector('.input-fields')
  const loginButton = document.querySelector('.login-button')
  const changeAccountBtn = document.getElementById('changeAccountBtn')
  const welcomeButton = document.getElementById('welcomeButton')

  // Показать лейбл с именем пользователя
  userLabel.style.display = 'block'
  usernameDisplay.textContent = username

  // Скрыть поля для входа и кнопку входа
  inputFields.style.display = 'none'
  loginButton.style.display = 'none'

  // Показать кнопки "Welcome" и "Change account"
  welcomeButton.style.display = 'block'
  changeAccountBtn.style.display = 'block'
}

// Проверка состояния авторизации при загрузке страницы
window.addEventListener('load', () => {
  const savedUsername = localStorage.getItem('username')
  const savedEmail = localStorage.getItem('email')
  if (savedUsername) {
    updateAuthUI(savedUsername)
  } else if (savedEmail) {
    // Если только email сохранен, заполняем его в поле для входа
    document.getElementById('login-email').value = savedEmail
  }
})

// Обработчик для кнопки "LOGIN"
document
  .querySelector('.login-button')
  .addEventListener('click', async function (event) {
    event.preventDefault()

    const email = document.getElementById('login-email').value
    const password = document.getElementById('login-password').value
    const csrftoken = getCSRFToken()

    try {
      const response = await fetch('/auth/login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrftoken,
        },
        body: JSON.stringify({ email: email, password: password }),
      })

      if (response.ok) {
        const data = await response.json()
        const username = data.username
        const accessToken = data.access

        // Сохраняем токен, имя пользователя и email в localStorage
        localStorage.setItem('access_token', accessToken)
        localStorage.setItem('username', username)
        localStorage.setItem('email', email)

        updateAuthUI(username)
        showNotification('Success', 'Успешная авторизация!', 'success')
      } else {
        const errorData = await response.json()
        showNotification(
          'Error',
          errorData.detail || 'Ошибка входа. Проверьте данные.',
          'error'
        )
      }
    } catch (error) {
      console.error('Ошибка запроса:', error)
      showNotification('Error', 'Не удалось подключиться к серверу.', 'error')
    }
  })

// Обработчик для кнопки "Change account" (logout)
document.getElementById('changeAccountBtn').addEventListener('click', () => {
  // Удаляем токен и имя пользователя, но сохраняем email для автозаполнения
  localStorage.removeItem('access_token')
  localStorage.removeItem('refresh_token')
  localStorage.removeItem('username')

  // Также очищаем данные из cookies, если они сохраняются там
  document.cookie =
    'access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
  document.cookie =
    'refresh_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'

  // Показать поля для входа и кнопку LOGIN
  document.getElementById('userLabel').style.display = 'none'
  document.querySelector('.input-fields').style.display = 'block'
  document.querySelector('.login-button').style.display = 'block'
  document.getElementById('welcomeButton').style.display = 'none'
  document.getElementById('changeAccountBtn').style.display = 'none'

  showNotification('Info', 'Вы вышли из аккаунта.', 'info')
})

// Обработчик для кнопки "Welcome" для перехода на главную страницу
document.getElementById('welcomeButton').addEventListener('click', () => {
  window.location.href = '/'
})

async function fetchTasks() {
  const accessToken = localStorage.getItem('access_token')

  if (!accessToken) {
    console.error('No access token available')
    return
  }

  try {
    const response = await fetch('/tasks/', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    })

    if (response.ok) {
      const data = await response.json()
      console.log('Tasks:', data)
      // Render tasks on the UI here
    } else {
      console.error('Failed to fetch tasks:', response.status)
    }
  } catch (error) {
    console.error('Error fetching tasks:', error)
  }
}

// Call fetchTasks after login or page load if the user is authenticated
fetchTasks()
