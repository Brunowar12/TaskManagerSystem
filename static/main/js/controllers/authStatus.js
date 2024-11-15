// Функція для відображення імені авторизованого користувача
function displayUserNameInHeader() {
  const username = localStorage.getItem('username') // Отримуємо ім'я користувача з localStorage

  if (username) {
    // Якщо користувач авторизований, оновлюємо ім'я в заголовку
    const usernameLink = document.querySelector('.header-right a')
    usernameLink.textContent = username // Замінюємо "Dmytro Gordon" на ім'я користувача
  } else {
    // Якщо користувач не авторизований, перенаправляємо його на сторінку входу
    window.location.href = '/auth'
  }
}

// Виконуємо перевірку при завантаженні сторінки
window.addEventListener('load', displayUserNameInHeader)

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
