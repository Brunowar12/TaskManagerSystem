const BASE_URL = 'http://127.0.0.1:8000/tasks/categories/'

// Extract the token from the cookie
const getAccessToken = (): string | null => {
  const cookies = document.cookie.split('; ')
  const tokenCookie = cookies.find((row) => row.startsWith('accessToken='))
  return tokenCookie ? tokenCookie.split('=')[1] : null
}

// Generate headers with authorization
const headersWithAuth = () => {
  const token = getAccessToken()
  if (!token) {
    throw new Error('Access token not found in cookies')
  }

  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`, // Pass the token in the Authorization header
  }
}

// Get all categories
export const getCategories = async () => {
  const response = await fetch(BASE_URL, {
    method: 'GET',
    headers: headersWithAuth(),
  })

  if (!response.ok) {
    throw new Error('Failed to fetch categories')
  }

  return response.json()
}

// Create a new category
export const createCategory = async (category: {
  name: string
  description?: string
}) => {
  const response = await fetch(`${BASE_URL}create/`, {
    method: 'POST',
    headers: headersWithAuth(),
    body: JSON.stringify(category),
  })

  if (!response.ok) {
    throw new Error('Failed to create category')
  }

  return response.json()
}

export const deleteCategory = async (id: number) => {
  try {
    const response = await fetch(`${BASE_URL}${id}/`, {
      method: 'DELETE',
      headers: headersWithAuth(),
    })

    if (!response.ok) {
      // Let's try to retrieve the error message from the server, if there is one
      const errorData = await response.json().catch(() => ({})) // Protection against invalid JSON
      const errorMessage =
        errorData.message || errorData.detail || 'Failed to delete category'
      throw new Error(errorMessage)
    }
  } catch (error) {
    console.error('Error in deleteCategory:', error)
    throw error // Pass the error forward
  }
}

// Category update
export const updateCategory = async (
  id: number,
  data: { name?: string; description?: string }
) => {
  const response = await fetch(`${BASE_URL}${id}/`, {
    method: 'PUT',
    headers: headersWithAuth(),
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    throw new Error('Failed to update category')
  }

  return response.json()
}
