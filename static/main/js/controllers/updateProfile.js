document.addEventListener('DOMContentLoaded', () => {
  const updateProfileForm = document.getElementById('updateProfileForm')
  const updateStatus = document.getElementById('update-status')
  const updateError = document.getElementById('update-error')
  const usernameElement = document.getElementById('username') // Елемент для оновлення імені в <a>
  const userNameHeader = document.querySelector('.user-name') // Елемент <h3> для оновлення імені
  const updateUrl = '/auth/profile/update/'

  function validatePhoneNumber(phoneNumber) {
    const phoneRegex = /^\+?\d{1,15}$/
    return phoneRegex.test(phoneNumber)
  }

  updateProfileForm.addEventListener('submit', async (e) => {
    e.preventDefault()

    const formData = new FormData(updateProfileForm)
    const data = {}
    let validationError = false

    formData.forEach((value, key) => {
      if (key === 'phone_number' && value) {
        if (!validatePhoneNumber(value)) {
          validationError = true
          showNotification(
            'Error',
            'Invalid phone number. Ensure it starts with + and contains only up to 15 digits.',
            'error'
          )
        }
      }

      if (value) {
        data[key] = value
      }
    })

    if (validationError) {
      return
    }

    const accessToken = await ensureTokenIsValid()
    if (!accessToken) {
      showNotification(
        'Error',
        'You are not authenticated. Please log in.',
        'error'
      )

      return
    }

    try {
      const response = await fetch(updateUrl, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error('Failed to update profile')
      }

      const responseData = await response.json()

      // Оновлюємо username у локальному сховищі та на сторінці
      if (data.username) {
        localStorage.setItem('username', data.username)
        usernameElement.textContent = data.username // Оновлення <a class="username">
        userNameHeader.textContent = data.username // Оновлення <h3 class="user-name">
      }

      // Закриваємо попап після успішного оновлення
      closeEditProfilePopup()

      console.log('Profile updated successfully:', responseData)
      showNotification('Success', 'Profile updated successfully.', 'success')
    } catch (error) {
      console.error('Error updating profile:', error)
      showNotification('Error', 'Error updating profile.', 'error')
    }
  })

  // Ініціалізація значення username з localStorage (при завантаженні сторінки)
  const storedUsername = localStorage.getItem('username')
  if (storedUsername) {
    usernameElement.textContent = storedUsername
    userNameHeader.textContent = storedUsername
  }
})
