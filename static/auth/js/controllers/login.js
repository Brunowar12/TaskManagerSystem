// Function to get CSRF token from cookies
function getCSRFToken() {
  const cookies = document.cookie.split(';').map((cookie) => cookie.trim())
  for (const cookie of cookies) {
    if (cookie.startsWith('csrftoken=')) {
      return decodeURIComponent(cookie.substring('csrftoken='.length))
    }
  }
  return null
}

// Function to update the UI after successful authentication
function updateAuthUI(username) {
  document.getElementById('userLabel').style.display = 'block'
  document.getElementById('usernameDisplay').textContent = username
  document.querySelector('.input-fields').style.display = 'none'
  document.querySelector('.login-button').style.display = 'none'
  document.getElementById('changeAccountBtn').style.display = 'block'
  document.getElementById('welcomeButton').style.display = 'block'
}

// Event listener for the "LOGIN" button
document
  .querySelector('.login-button')
  .addEventListener('click', async (event) => {
    event.preventDefault()

    const email = document.getElementById('login-email').value.trim()
    const password = document.getElementById('login-password').value.trim()

    // Validate fields before sending the request
    if (!email || !password) {
      showNotification(
        'Error',
        'Email and password fields must be filled.',
        'error'
      )
      return // Stop further execution
    }

    const csrftoken = getCSRFToken()

    try {
      // Send POST request for authentication
      const response = await fetch('/auth/login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrftoken,
        },
        body: JSON.stringify({ email, password }),
      })

      if (response.ok) {
        // Expecting username, access, and refresh tokens in the response
        const { username, access, refresh } = await response.json()
        localStorage.setItem('username', username)
        localStorage.setItem('access_token', access)
        localStorage.setItem('refresh_token', refresh)

        console.log(
          '[SUCCESS] Authentication and tokens retrieved successfully.'
        )
        updateAuthUI(username)

        // Show success notification
        showNotification(
          'Success',
          'You have successfully logged in.',
          'success'
        )
      } else {
        const errorData = await response.json()
        console.error(
          '[ERROR] Authentication error:',
          errorData.detail || response.status
        )

        showNotification(
          'Error',
          errorData.detail ||
            'Authentication failed. Please check your credentials.',
          'error'
        )
      }
    } catch (error) {
      console.error('[ERROR] Request error:', error)

      // Notify if there is a server connection issue
      showNotification(
        'Error',
        'Не вдалося підключитися до сервера для отримання токенів.',
        'error'
      )
    }
  })

// Event listener for the "Change account" button
document.getElementById('changeAccountBtn').addEventListener('click', () => {
  // Clear all stored data
  localStorage.clear()
  document.cookie =
    'access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
  document.cookie =
    'refresh_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'

  // Reset the UI to show login fields
  document.getElementById('userLabel').style.display = 'none'
  document.querySelector('.input-fields').style.display = 'block'
  document.querySelector('.login-button').style.display = 'block'
  document.getElementById('changeAccountBtn').style.display = 'none'
  document.getElementById('welcomeButton').style.display = 'none'

  console.log('Logged out successfully.')

  // Show logout notification
  showNotification('Info', 'You have logged out successfully.', 'info')
})

// Event listener for the "Welcome" button
document.getElementById('welcomeButton').addEventListener('click', () => {
  window.location.href = '/' // Redirect to the home page
})

// Check authentication status on page load
window.addEventListener('load', () => {
  const savedUsername = localStorage.getItem('username')
  if (savedUsername) {
    updateAuthUI(savedUsername)
  }
})
