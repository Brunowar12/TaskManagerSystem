// Function to check if the user is authenticated
function isAuthenticated() {
  return !!localStorage.getItem('access_token') // Returns true if access token exists
}

// Function to display the username in the header
function displayUserNameInHeader() {
  const username = localStorage.getItem('username')
  const usernameLink = document.querySelector('.header-right a')

  if (username && usernameLink) {
    usernameLink.textContent = username // Update username in the header
  } else {
    window.location.href = '/auth' // Redirect to login if not authenticated
  }
}

// Function to refresh the token
async function refreshToken() {
  const refreshToken = localStorage.getItem('refresh_token')
  if (!refreshToken) {
    console.error('[ERROR] Missing refresh token')
    window.location.href = '/auth' // Redirect to login
    return null
  }

  try {
    const response = await fetch('/auth/token/refresh/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh: refreshToken }),
    })

    if (response.ok) {
      const data = await response.json()
      localStorage.setItem('access_token', data.access) // Update access token in localStorage
      console.log('[SUCCESS] Access token successfully refreshed')
      return data.access
    } else {
      console.error(
        `[ERROR] Failed to refresh token: ${response.status} ${response.statusText}`
      )
      window.location.href = '/auth'
    }
  } catch (error) {
    console.error('[ERROR] Network error while refreshing token:', error)
    window.location.href = '/auth'
  }

  return null
}

// Function to validate and refresh token if necessary
async function ensureTokenIsValid() {
  const accessToken = localStorage.getItem('access_token')
  if (!accessToken) {
    console.warn('[WARNING] Access token is missing. Attempting to refresh...')
    return await refreshToken() // Refresh token if access token is missing
  }

  try {
    const tokenPayload = JSON.parse(atob(accessToken.split('.')[1])) // Decode token
    const currentTime = Math.floor(Date.now() / 1000)

    if (tokenPayload.exp < currentTime) {
      console.log('[INFO] Access token has expired. Attempting to refresh...')
      return await refreshToken() // Refresh token if expired
    }

    console.log('[INFO] Access token is valid')
    return accessToken
  } catch (error) {
    console.error('[ERROR] Error while validating token:', error)
    return await refreshToken() // Refresh token if decoding fails
  }
}

// Universal function to make requests with token validation
async function fetchWithAuth(url, options = {}) {
  const accessToken = await ensureTokenIsValid()

  if (!accessToken) {
    console.error('[ERROR] Unable to proceed: No valid token')
    return null
  }

  const headers = {
    ...options.headers,
    Authorization: `Bearer ${accessToken}`, // Add authorization header
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    })

    if (!response.ok) {
      console.error(
        `[ERROR] Request failed: ${response.status} ${response.statusText}`
      )
    }

    return response
  } catch (error) {
    console.error('[ERROR] Network error during request:', error)
    return null
  }
}

// Function to fetch tasks
async function fetchTasks() {
  try {
    const response = await fetchWithAuth('/tasks/', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (response && response.ok) {
      const data = await response.json()
      console.log('[SUCCESS] Tasks retrieved:', data)
      // Update the task interface here
    }
  } catch (error) {
    console.error('[ERROR] Error while fetching tasks:', error)
  }
}

// Main block: Execute when the page is loaded
document.addEventListener('DOMContentLoaded', async () => {
  if (isAuthenticated()) {
    console.log('[INFO] User is authenticated')
    displayUserNameInHeader()

    // Validate token and fetch tasks after refreshing if needed
    await ensureTokenIsValid()
    await fetchTasks() // Fetch tasks if authenticated
  } else {
    console.warn('[WARNING] User is not authenticated. Redirecting to login.')
    window.location.href = '/auth' // Redirect unauthenticated users
  }
})
