document.addEventListener('DOMContentLoaded', () => {
  const updateProfileForm = document.getElementById('updateProfileForm')
  const updateStatus = document.getElementById('update-status')
  const updateError = document.getElementById('update-error')
  const updateUrl = '/auth/profile/update/'

  // Функция валидации номера телефона
  function validatePhoneNumber(phoneNumber) {
    const phoneRegex = /^\+?\d{1,15}$/ // Только + в начале и до 15 цифр
    return phoneRegex.test(phoneNumber)
  }

  updateProfileForm.addEventListener('submit', async (e) => {
    e.preventDefault() // Останавливаем отправку формы

    const formData = new FormData(updateProfileForm)
    const data = {}
    let validationError = false

    formData.forEach((value, key) => {
      if (key === 'phone_number' && value) {
        // Проверяем только, если поле заполнено
        if (!validatePhoneNumber(value)) {
          validationError = true
          updateError.textContent =
            'Invalid phone number. Ensure it starts with + and contains only up to 15 digits.'
          updateError.style.display = 'block'
        } else {
          updateError.style.display = 'none'
        }
      }

      if (value) {
        data[key] = value // Добавляем только заполненные значения
      }
    })

    if (validationError) {
      return // Если валидация не прошла, не отправляем форму
    }

    // Убедимся, что токен валиден
    const accessToken = await ensureTokenIsValid()
    if (!accessToken) {
      console.error('No valid access token found. Please log in again.')
      updateError.textContent = 'You are not authenticated. Please log in.'
      updateError.style.display = 'block'
      return
    }

    try {
      const response = await fetch(updateUrl, {
        method: 'PATCH', // Используем PATCH вместо PUT
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`, // Токен в заголовке
        },
        body: JSON.stringify(data), // Отправляем только изменённые данные
      })

      if (!response.ok) {
        throw new Error('Failed to update profile')
      }

      const responseData = await response.json()
      console.log('Profile updated successfully:', responseData)

      updateStatus.style.display = 'block'
      updateStatus.textContent = 'Profile updated successfully!'
      updateError.style.display = 'none'

      // Отладка: сообщение перед перезагрузкой
      console.log('Preparing to reload the page in 1 seconds...')
      setTimeout(() => {
        console.log('Reloading the page now...')
        window.location.reload() // Перезагружаем страницу
      }, 1000) // 1000 миллисекунд = 1 секунда
    } catch (error) {
      console.error('Error updating profile:', error)
      updateStatus.style.display = 'none'
      updateError.style.display = 'block'
      updateError.textContent = 'Failed to update profile.'
    }
  })
})
