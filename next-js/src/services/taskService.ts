const BASE_URL = 'http://127.0.0.1:8000/tasks/'

// Extract the token from the cookie
const getAccessToken = (): string | null => {
  const cookies = document.cookie.split('; ')
  const tokenCookie = cookies.find((row) => row.startsWith('accessToken='))
  return tokenCookie ? tokenCookie.split('=')[1] : null
}

const headersWithAuth = () => {
  const token = getAccessToken()
  if (!token) {
    throw new Error('Access token not found in cookies')
  }

  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  }
}

export const getTasks = async (url: string) => {
  const response = await fetch(url, {
    method: 'GET',
    headers: headersWithAuth(),
  })

  if (!response.ok) {
    throw new Error('Failed to fetch tasks')
  }

  return response.json()
}

export const createTask = async (task: {
  title: string
  description?: string
  category_id: number
  due_date: string
  priority: 'L' | 'M' | 'H'
}) => {
  console.log('Data being sent to server:', task)
  const response = await fetch(`${BASE_URL}create/`, {
    method: 'POST',
    headers: headersWithAuth(),
    body: JSON.stringify(task),
  })

  if (!response.ok) {
    throw new Error('Failed to create task')
  }

  return response.json()
}

export const updateTask = async (
  id: number,
  data: Partial<{
    title: string
    description: string
    category: string
    due_date: string
    priority: 'L' | 'M' | 'H'
    completed: boolean
    is_favorite: boolean
  }>
) => {
  const response = await fetch(`${BASE_URL}${id}/`, {
    method: 'PATCH',
    headers: headersWithAuth(),
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    throw new Error('Failed to update task')
  }

  return response.json()
}

export const deleteTask = async (id: number) => {
  const response = await fetch(`${BASE_URL}${id}/`, {
    method: 'DELETE',
    headers: headersWithAuth(),
  })

  if (!response.ok) {
    throw new Error('Failed to delete task')
  }

  return response.json()
}
