import Cookies from 'js-cookie'

export async function logout() {
  const accessToken = Cookies.get('accessToken')
  const refreshToken = Cookies.get('refreshToken')

  if (accessToken) {
    try {
      // Send a request to the server to exit
      const response = await fetch(`http://127.0.0.1:8000/auth/logout/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ refresh: refreshToken }),
      })

      if (!response.ok) {
        // console.error('Error when trying to log out:',response.statusText)
      }
    } catch (error) {
      // console.error('Network error when trying to log out:', error)
    }
  }

  // Clear cookies
  Cookies.remove('accessToken')
  Cookies.remove('refreshToken')
  Cookies.remove('username')
  Cookies.remove('email')

  window.location.href = '/auth'
}
