'use client'

import { useState } from 'react'
import Image from 'next/image'
import { BarChart, ListTodo, Calendar, Plus, Trash2 } from 'lucide-react'
import { useNotification } from '@/contexts/notification-context'
import { useCategoryContext } from '@/contexts/CategoryManagement'

interface SidebarProps {
  isVisible: boolean
  isCollapsed: boolean
  currentView: 'tasks' | 'calendar' | 'stats' | 'profile'
  onChangeView: (view: 'tasks' | 'calendar' | 'stats' | 'profile') => void
}

export default function Sidebar({
  isVisible,
  isCollapsed,
  currentView,
  onChangeView,
}: SidebarProps) {
  const { categories, addCategory, deleteCategoryById, updateCategoryById } =
    useCategoryContext()
  const [newCategory, setNewCategory] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [tempCategory, setTempCategory] = useState('')
  const { addNotification } = useNotification()

  const isValidCategoryName = (name: string) => {
    return name.trim().length > 0
  }

  const handleAddCategory = async () => {
    if (!isValidCategoryName(newCategoryName)) {
      addNotification('error', 'Category name cannot be empty.')
      setNewCategory(false)
      return
    }
    try {
      await addCategory(newCategoryName.trim())
      addNotification('success', `Category "${newCategoryName.trim()}" added.`)
    } catch (error: any) {
      console.error('Error adding category:', error)
      const errorMessage =
        error?.response?.data?.message || 'Failed to add category.'
      addNotification('error', `Error: ${errorMessage}`)
    }
    setNewCategory(false)
    setNewCategoryName('')
  }

  const handleDeleteCategory = async (id: number) => {
    const category = categories.find((cat) => cat.id === id)
    try {
      await deleteCategoryById(id) // Ждем завершения запроса
      // Уведомление только при успешном завершении
      addNotification('info', `Category "${category?.name}" deleted.`)
    } catch (error: any) {
      console.error('Error deleting category:', error)
      const errorMessage =
        error.message ||
        'An unexpected error occurred while deleting the category.'
      addNotification('error', `Error deleting category: ${errorMessage}`)
    }
  }

  const handleUpdateCategory = async (id: number) => {
    if (!isValidCategoryName(tempCategory)) {
      addNotification('error', 'Category name cannot be empty.')
      setEditingIndex(null)
      return
    }
    try {
      await updateCategoryById(id, tempCategory.trim())
      addNotification(
        'success',
        `Category updated to "${tempCategory.trim()}".`
      )
    } catch (error: any) {
      console.error('Error updating category:', error)
      const errorMessage =
        error?.response?.data?.message || 'Failed to update category.'
      addNotification('error', `Error: ${errorMessage}`)
    }
    setEditingIndex(null)
  }

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-30 flex h-full flex-col bg-gradient-to-b from-[#e9e7e4] to-[#cdccc8] transition-all duration-300 ease-in-out
        ${isVisible ? 'translate-x-0' : '-translate-x-full'} 
        ${isCollapsed ? 'w-16' : 'w-64'}
        md:relative md:translate-x-0`}
    >
      <div className='flex h-16 shrink-0 items-center justify-center border-b border-gray-200 px-4'>
        <div
          className={`flex items-center ${
            isCollapsed ? 'justify-center' : 'justify-start w-full'
          }`}
        >
          <div className='h-15 w-20 overflow-hidden rounded-full'>
            <Image
              src='/logo.png?height=100&width=100'
              alt='Logo'
              width={80}
              height={80}
            />
          </div>
          {!isCollapsed && (
            <h1 className='ml-3 text-xl font-bold'>Plan My Day</h1>
          )}
        </div>
      </div>

      <nav className='flex-1 space-y-1 overflow-y-auto p-2'>
        <button
          onClick={() => onChangeView('stats')}
          className={`flex w-full items-center rounded-md p-2 text-gray-700 hover:bg-white/50 transition-colors duration-200
            ${isCollapsed ? 'justify-center' : ''} 
            ${currentView === 'stats' ? 'bg-purple-100 text-purple-700' : ''}`}
        >
          <BarChart className={isCollapsed ? 'h-6 w-6' : 'mr-3 h-6 w-6'} />
          {!isCollapsed && <span>Stats</span>}
        </button>
        <button
          onClick={() => onChangeView('tasks')}
          className={`flex w-full items-center rounded-md p-2 text-gray-700 hover:bg-white/50 transition-colors duration-200
            ${isCollapsed ? 'justify-center' : ''} 
            ${currentView === 'tasks' ? 'bg-purple-100 text-purple-700' : ''}`}
        >
          <ListTodo className={isCollapsed ? 'h-6 w-6' : 'mr-3 h-6 w-6'} />
          {!isCollapsed && <span>All Tasks</span>}
        </button>
        <button
          onClick={() => onChangeView('calendar')}
          className={`flex w-full items-center rounded-md p-2 text-gray-700 hover:bg-white/50 transition-colors duration-200
            ${isCollapsed ? 'justify-center' : ''} 
            ${
              currentView === 'calendar' ? 'bg-purple-100 text-purple-700' : ''
            }`}
        >
          <Calendar className={isCollapsed ? 'h-6 w-6' : 'mr-3 h-6 w-6'} />
          {!isCollapsed && <span>Calendar</span>}
        </button>
      </nav>

      {!isCollapsed && (
        <div className='flex-1 p-4'>
          <div className='mb-2 flex items-center justify-between'>
            <h2 className='text-lg font-semibold'>My Calendar Categories</h2>
            <button
              onClick={() => setNewCategory(true)}
              className='text-purple-600 hover:text-purple-800 transition-colors duration-200'
            >
              <Plus className='h-5 w-5' />
            </button>
          </div>

          <div className='max-h-64 overflow-y-auto'>
            <ul className='space-y-1'>
              {categories && categories.length > 0 ? (
                categories.map((category) => (
                  <li
                    key={category.id}
                    className='flex items-center justify-between rounded p-2 hover:bg-white/50 transition-colors duration-200'
                  >
                    <div className='flex items-center flex-1'>
                      <div className='h-4 w-4 rounded bg-purple-500'></div>
                      {editingIndex === category.id ? (
                        <input
                          type='text'
                          value={tempCategory}
                          onChange={(e) => {
                            const value = e.target.value
                            if (value.length <= 15) setTempCategory(value)
                          }}
                          onKeyDown={(e) =>
                            e.key === 'Enter' &&
                            handleUpdateCategory(category.id)
                          }
                          onBlur={() => handleUpdateCategory(category.id)}
                          className='ml-2 flex-1 rounded border border-gray-300 px-2 py-1 transition-all duration-200'
                          style={{
                            width: `${Math.min(
                              newCategoryName.length * 12 + 20,
                              200
                            )}px`,
                            maxWidth: '100%',
                          }}
                          autoFocus
                        />
                      ) : (
                        <span
                          onDoubleClick={() => {
                            setEditingIndex(category.id)
                            setTempCategory(category.name)
                          }}
                          className='ml-2 cursor-pointer'
                        >
                          {category.name}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => handleDeleteCategory(category.id)}
                      className='text-gray-500 hover:text-red-500 transition-colors duration-200'
                    >
                      <Trash2 className='h-4 w-4' />
                    </button>
                  </li>
                ))
              ) : (
                <p>No categories available</p>
              )}
              {newCategory && (
                <li className='flex items-center rounded p-2 hover:bg-white/50 transition-colors duration-200'>
                  <div className='h-4 w-4 rounded bg-purple-500'></div>
                  <input
                    type='text'
                    value={newCategoryName}
                    onChange={(e) => {
                      const value = e.target.value
                      if (value.length <= 15) setNewCategoryName(value)
                    }}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
                    onBlur={handleAddCategory}
                    className='ml-2 flex-1 rounded border border-gray-300 px-2 py-1 transition-all duration-200'
                    style={{
                      width: `${Math.min(
                        newCategoryName.length * 12 + 20,
                        200
                      )}px`,
                      maxWidth: '100%',
                    }}
                    autoFocus
                  />
                </li>
              )}
            </ul>
          </div>
        </div>
      )}
    </aside>
  )
}
