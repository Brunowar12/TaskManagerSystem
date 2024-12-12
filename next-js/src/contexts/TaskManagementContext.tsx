'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
} from '@/services/taskService'
import Cookies from 'js-cookie'
import { log } from 'console'

interface Task {
  id: number
  title: string
  description: string
  category: string
  due_date: string
  completed: boolean
  created_at: string
  updated_at: string
  is_favorite: boolean
  priority: 'L' | 'M' | 'H'
}

interface TaskContextProps {
  tasks: Task[]
  nextPageUrl: string | null
  fetchTasks: (url?: string) => void
  addTask: (title: string, description?: string) => Promise<void>
  updateTaskById: (
    id: number,
    title: string,
    description?: string
  ) => Promise<void>
  deleteTaskById: (id: number) => Promise<void>
}

const TaskContext = createContext<TaskContextProps | undefined>(undefined)

export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [tasks, setTasks] = useState<Task[]>([])
  const [nextPageUrl, setNextPageUrl] = useState<string | null>(null)

  const fetchTasks = async (
    url: string = 'http://127.0.0.1:8000/tasks/',
    params: {
      search?: string
      ordering?: string
      page?: number
      priority?: string
      completed?: boolean
    } = {}
  ) => {
    if (!url) return

    try {
      const searchParams = new URLSearchParams()

      if (params.page) searchParams.append('page', params.page.toString())
      if (params.search) searchParams.append('search', params.search)
      if (params.ordering) searchParams.append('ordering', params.ordering)
      if (params.priority) searchParams.append('priority', params.priority)
      if (params.completed !== undefined)
        searchParams.append('completed', params.completed.toString())

      const separator = url.includes('?') ? '&' : '?'
      const fullUrl = `${url}${separator}${searchParams.toString()}`

      const data = await getTasks(fullUrl)

      const now = new Date()

      const tasksWithOverdue = data.results.map((task: Task) => {
        const dueDate = task.due_date ? new Date(task.due_date) : null
        const dueDateISO = dueDate ? dueDate : null // Преобразуем дату в строку ISO

        // console.log(task.due_date, 'console.log(task.due_date)')
        //  console.log(dueDateISO, 'dueDateISO') // Проверяем формат ISO

        return {
          ...task,
          isOverdue: dueDate && dueDate <= now && !task.completed,
        }
      })

      setTasks((prevTasks) => {
        if (url === 'http://127.0.0.1:8000/tasks/' && !params.page) {
          return tasksWithOverdue
        }

        const uniqueTasks = [...prevTasks, ...tasksWithOverdue].filter(
          (task, index, self) =>
            self.findIndex((t) => t.id === task.id) === index
        )

        return uniqueTasks
      })

      setNextPageUrl(data.next)
    } catch (error) {
      // console.error('Error fetching tasks:', error)
    }
  }

  const addTask = async (
    title: string,
    description = '',
    category: string,
    due_date: string,
    priority: 'L' | 'M' | 'H'
  ) => {
    try {
      const newTask = await createTask({
        title,
        description,
        category,
        due_date,
        priority,
      })

      setTasks((prev) => [newTask, ...prev])
    } catch (error) {
      throw error
    }
  }

  const updateTaskById = async (
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
    try {
      const updatedTask = await updateTask(id, data)
      setTasks((prev) =>
        prev.map((task) =>
          task.id === id
            ? {
                ...updatedTask,
                isOverdue:
                  updatedTask.due_date &&
                  new Date(updatedTask.due_date) < new Date() &&
                  !updatedTask.completed,
              }
            : task
        )
      )
    } catch (error) {
      // console.error('Error updating task:', error)
    }
  }

  const deleteTaskById = async (id: number) => {
    try {
      const token = Cookies.get('accessToken')

      if (!token) {
        throw new Error('Access token is missing')
      }

      const response = await fetch(`http://127.0.0.1:8000/tasks/${id}/`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to delete task with status ${response.status}`)
      }

      // Remove the task from the state
      setTasks((prev) => prev.filter((task) => task.id !== id))
    } catch (error) {
      // console.error('Error in deleteTaskById:', error)
      throw error
    }
  }

  useEffect(() => {
    fetchTasks()
  }, [])

  return (
    <TaskContext.Provider
      value={{
        tasks,
        nextPageUrl,
        fetchTasks,
        addTask,
        updateTaskById,
        deleteTaskById,
      }}
    >
      {children}
    </TaskContext.Provider>
  )
}

export const useTaskContext = () => {
  const context = useContext(TaskContext)
  if (!context) {
    throw new Error('useTaskContext must be used within a TaskProvider')
  }
  return context
}
