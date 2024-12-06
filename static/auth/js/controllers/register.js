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

// Function to validate the registration form fields
function validateForm() {
  const emailField = document.getElementById('email')
  const passwordField = document.getElementById('password')
  const confirmPasswordField = document.getElementById('confirm_password')

  const email = emailField.value.trim()
  const password = passwordField.value.trim()
  const confirmPassword = confirmPasswordField.value.trim()

  emailField.classList.remove('input-error')
  passwordField.classList.remove('input-error')
  confirmPasswordField.classList.remove('input-error')

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/
  const cyrillicRegex = /[А-Яа-яЁёЇїІіЄєҐґ]/

  if (!email || !password || !confirmPassword) {
    showNotification('Error', 'All fields must be filled out.', 'error')
    if (!email) emailField.classList.add('input-error')
    if (!password) passwordField.classList.add('input-error')
    if (!confirmPassword) confirmPasswordField.classList.add('input-error')
    return false
  }

  if (!emailRegex.test(email)) {
    showNotification('Error', 'Invalid email format.', 'error')
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
    showNotification('Warning', 'Passwords do not match.', 'warning')
    passwordField.classList.add('input-error')
    confirmPasswordField.classList.add('input-error')
    return false
  }

  return true
}

// Function to authenticate the user after registration
async function authenticateUser(email, password) {
  const csrftoken = getCSRFToken()

  try {
    const response = await fetch('/auth/login/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': csrftoken,
      },
      body: JSON.stringify({ email, password }),
    })

    if (response.ok) {
      const { username, access, refresh } = await response.json()

      // Save tokens and username to localStorage
      localStorage.setItem('username', username)
      localStorage.setItem('access_token', access)
      localStorage.setItem('refresh_token', refresh)

      console.log('[SUCCESS] Authentication and tokens received:', {
        username,
        access,
        refresh,
      })

      // Update UI after successful login
      updateAuthUI(username)

      // Show success notification
      showNotification(
        'Success',
        `Welcome, ${username}! You are now logged in.`,
        'success'
      )

      // Redirect to the main page after a short delay
      setTimeout(() => {
        window.location.href = '/'
      }, 2000)
    } else {
      const errorData = await response.json()
      console.error('[ERROR] Authentication failed:', errorData)
      showNotification(
        'Error',
        errorData.detail || 'Login failed. Please check your credentials.',
        'error'
      )
    }
  } catch (error) {
    console.error('[ERROR] Authentication request failed:', error)
    showNotification(
      'Error',
      'Failed to connect to the server for authentication.',
      'error'
    )
  }
}

// Event listener for the registration button
document
  .querySelector('.create-account-button')
  .addEventListener('click', async (event) => {
    event.preventDefault()

    if (validateForm()) {
      const email = document.getElementById('email').value.trim()
      const password = document.getElementById('password').value.trim()
      const csrftoken = getCSRFToken()

      try {
        // Sending registration data
        const response = await fetch('/auth/register/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrftoken,
          },
          body: JSON.stringify({ email, password }),
        })

        if (response.ok) {
          console.log(
            '[SUCCESS] Registration successful. Now authenticating...'
          )

          // Authenticate the user after successful registration
          await authenticateUser(email, password)
        } else {
          const errorData = await response.json()
          console.error('[ERROR] Registration failed:', errorData)
          showNotification(
            'Error',
            errorData.email ||
              errorData.password ||
              'An unknown error occurred.',
            'error'
          )
        }
      } catch (error) {
        console.error('[ERROR] Request failed during registration:', error)
        showNotification(
          'Error',
          'Failed to connect to the server. Please try again later.',
          'error'
        )
      }
    }
  })

// Check authentication status on page load
window.addEventListener('load', () => {
  const username = localStorage.getItem('username')
  const accessToken = localStorage.getItem('access_token')

  if (username && accessToken) {
    // If the user is already authenticated, update the UI
    updateAuthUI(username)
  }
})

// Function to update the UI after successful authentication or registration
function updateAuthUI(username) {
  console.log('[INFO] Updating UI for authenticated user:', username)

  // Show user information
  document.getElementById('userLabel').style.display = 'block'
  document.getElementById('usernameDisplay').textContent = username

  // Hide registration fields and button
  document.querySelector('.input-fields').style.display = 'none'
  document.querySelector('.create-account-button').style.display = 'none'
  document.querySelector('.login-button').style.display = 'none'
  document.querySelector('.create-account-button').style.display = 'block'
  // Show change account button

  document.getElementById('changeAccountBtn').style.display = 'block'

  // Show Welcome button
  const welcomeButton = document.getElementById('welcomeButton')
  if (welcomeButton) {
    welcomeButton.style.display = 'block'
    console.log('[INFO] Welcome button is now visible')
  } else {
    console.error('[ERROR] Welcome button not found in DOM')
  }
}
