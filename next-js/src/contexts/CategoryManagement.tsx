'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from '@/services/categoryService'

interface Category {
  id: number
  name: string
  description: string
}

interface CategoryContextProps {
  categories: Category[]
  fetchCategories: () => void
  addCategory: (name: string, description?: string) => Promise<void>
  updateCategoryById: (
    id: number,
    name: string,
    description?: string
  ) => Promise<void>
  deleteCategoryById: (id: number) => Promise<void>
}

const CategoryContext = createContext<CategoryContextProps | undefined>(
  undefined
)

export const CategoryProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [categories, setCategories] = useState<Category[]>([])

  const fetchCategories = async () => {
    try {
      const data = await getCategories() // Получаем ответ от сервиса

      console.log('Server response:', data) // Лог ответа сервера

      if (!data.results || !Array.isArray(data.results)) {
        throw new Error('Invalid data format: results is not an array')
      }

      setCategories(data.results) // Используем массив из ключа "results"
    } catch (error) {
      console.error('Error fetching categories:', error)
      setCategories([]) // Устанавливаем пустой массив в случае ошибки
    }
  }

  const addCategory = async (name: string, description = '') => {
    try {
      const newCategory = await createCategory({ name, description })
      setCategories((prev) => [...prev, newCategory])
    } catch (error) {
      console.error('Error adding category:', error)
    }
  }

  const updateCategoryById = async (
    id: number,
    name: string,
    description = ''
  ) => {
    try {
      const updatedCategory = await updateCategory(id, { name, description })
      setCategories((prev) =>
        prev.map((cat) =>
          cat.id === id ? { ...cat, ...updatedCategory } : cat
        )
      )
    } catch (error) {
      console.error('Error updating category:', error)
    }
  }

  const deleteCategoryById = async (id: number) => {
    try {
      await deleteCategory(id) // Ожидаем успешного удаления
      setCategories((prev) => prev.filter((cat) => cat.id !== id)) // Обновляем список категорий
    } catch (error) {
      console.error('Error deleting category:', error)
      throw error // Прокидываем ошибку дальше
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  useEffect(() => {
    console.log('Fetched categories:', categories)
  }, [categories])

  return (
    <CategoryContext.Provider
      value={{
        categories,
        fetchCategories,
        addCategory,
        updateCategoryById,
        deleteCategoryById,
      }}
    >
      {children}
    </CategoryContext.Provider>
  )
}

export const useCategoryContext = () => {
  const context = useContext(CategoryContext)
  if (!context) {
    throw new Error('useCategoryContext must be used within a CategoryProvider')
  }
  return context
}