'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
} from '@/services/taskService'

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

  const fetchTasks = async (url: string = 'http://127.0.0.1:8000/tasks/') => {
    try {
      const data = await getTasks(url)
      console.log('Fetched tasks:', data)
      setTasks((prev) => [...prev, ...data.results])
      setNextPageUrl(data.next)
    } catch (error) {
      console.error('Error fetching tasks:', error)
    }
  }

  const addTask = async (
    title: string,
    description = '',
    category_id: number, // изменили на category_id
    due_date: string,
    priority: 'L' | 'M' | 'H'
  ) => {
    try {
      const newTask = await createTask({
        title,
        description,
        category_id, // передаем category_id
        due_date,
        priority,
      })
      setTasks((prev) => [newTask, ...prev])
    } catch (error) {
      console.error('Error adding task:', error)
    }
  }

  const updateTaskById = async (
    id: number,
    title: string,
    description = ''
  ) => {
    try {
      const updatedTask = await updateTask(id, { title, description })
      setTasks((prev) =>
        prev.map((task) =>
          task.id === id ? { ...task, ...updatedTask } : task
        )
      )
    } catch (error) {
      console.error('Error updating task:', error)
    }
  }

  const deleteTaskById = async (id: number) => {
    try {
      await deleteTask(id)
      setTasks((prev) => prev.filter((task) => task.id !== id))
    } catch (error) {
      console.error('Error deleting task:', error)
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
