const BASE_URL = 'http://127.0.0.1:8000/tasks/categories/'

// Извлекаем токен из куки
const getAccessToken = (): string | null => {
  const cookies = document.cookie.split('; ')
  const tokenCookie = cookies.find((row) => row.startsWith('accessToken=')) // Используем точное название куки
  return tokenCookie ? tokenCookie.split('=')[1] : null
}

// Формируем заголовки с авторизацией
const headersWithAuth = () => {
  const token = getAccessToken()
  if (!token) {
    throw new Error('Access token not found in cookies')
  }

  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`, // Передаём токен в заголовке Authorization
  }
}

// Получение всех категорий
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

// Создание новой категории
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
      // Попробуем извлечь сообщение об ошибке с сервера, если оно есть
      const errorData = await response.json().catch(() => ({})) // Защита от некорректного JSON
      const errorMessage =
        errorData.message || errorData.detail || 'Failed to delete category'
      throw new Error(errorMessage)
    }
  } catch (error) {
    console.error('Error in deleteCategory:', error)
    throw error // Прокидываем ошибку дальше
  }
}

// Обновление категории
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
