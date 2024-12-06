export const registerUser = async (email: string, password: string) => {
  const response = await fetch('http://127.0.0.1:8000/auth/register/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  })

  if (!response.ok) {
    throw new Error('Registration failed')
  }

  return response.json()
}

export const loginUser = async (email: string, password: string) => {
  const response = await fetch('http://127.0.0.1:8000/auth/login/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  })

  if (!response.ok) {
    throw new Error('Login failed')
  }

  const data = await response.json()

  const currentTime = Date.now()
  const expiredAt = currentTime + 60 * 60 * 1000 // 60 минут в миллисекундах

  localStorage.setItem('accessToken', data.access)
  localStorage.setItem('refreshToken', data.refresh)
  localStorage.setItem('expiredAt', expiredAt.toString()) // Сохраняем время истечения токена

  return data
}
