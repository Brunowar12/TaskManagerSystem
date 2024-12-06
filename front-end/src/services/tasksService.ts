// services/tasksService.ts

export interface Task {
  id: number
  title: string
  description: string
  createdAt: string
  dueDate: string
  category: string
  priority: 'high' | 'medium' | 'low'
  completed: boolean
}

export async function getTasks(token: string): Promise<Task[]> {
  try {
    const accessToken = localStorage.getItem('accessToken')
    const response = await fetch('http://127.0.0.1:8000/tasks', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch tasks: ${response.statusText}`)
    }

    const data = await response.json() // Получаем весь объект
    const tasks: Task[] = data.results // Извлекаем массив задач из поля `results`
    return tasks
  } catch (error) {
    console.error('Error fetching tasks:', error)
    return [] // Возвращаем пустой массив в случае ошибки
  }
}
