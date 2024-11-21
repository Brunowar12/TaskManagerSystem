document.addEventListener('DOMContentLoaded', () => {
  const profileUrl = '/auth/profile/'

  // Получение токена из localStorage
  const accessToken = localStorage.getItem('access_token')

  if (!accessToken) {
    console.error('No access token found. Please log in first.')
    return
  }

  // Запрос данных профиля
  fetch(profileUrl, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`, // Добавляем токен в заголовок
    },
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error('Failed to fetch user profile')
      }
      return response.json()
    })
    .then((data) => {
      // Обновление интерфейса
      updateProfileUI(data)
    })
    .catch((error) => {
      console.error('Error fetching user profile:', error)
    })
})

// Функция для преобразования времени в понятный формат
function formatDate(isoDate) {
  if (!isoDate) return 'Unknown'
  const date = new Date(isoDate)
  return date.toLocaleString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

// Функция обновления интерфейса на основе данных пользователя
function updateProfileUI(user) {
  const userName = document.querySelector('.user-name')
  const userDetails = document.querySelector('.user-details')
  const activityLog = document.querySelector('.activity-log ul')

  // Обновляем имя пользователя
  if (userName) {
    userName.textContent = user.username || 'Unknown'
  }

  // Обновляем детали профиля
  if (userDetails) {
    userDetails.innerHTML = `
      <p>Age: <span>${user.age || 'Unknown'}</span></p>
      <p>Email: <span>${user.email || 'Unknown'}</span></p>
      <p>Phone Number: <span>${user.phone_number || 'Unknown'}</span></p>
      <p>Place of Work: <span>${user.place_of_work || 'Unknown'}</span></p>
      <p>About Me: <span>${user.about_me || 'Unknown'}</span></p>
    `
  }

  // Обновляем активность пользователя
  if (activityLog) {
    activityLog.innerHTML = `
      <li>Logged in: <span>${formatDate(user.logged_in)}</span></li>
      <li>Profile edited: <span>${formatDate(user.profile_edited)}</span></li>
      <li>Last task completed: <span>${formatDate(
        user.task_n_completed
      )}</span></li>
    `
  }
}
