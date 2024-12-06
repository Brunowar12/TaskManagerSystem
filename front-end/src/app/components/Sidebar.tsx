'use client'

import { useState } from 'react'
import Image from 'next/image'
import { BarChart, ListTodo, Calendar, Plus, Trash2 } from 'lucide-react'

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
  const [categories, setCategories] = useState(['Work', 'Personal', 'Shopping'])
  const [newCategory, setNewCategory] = useState('')

  const addCategory = () => {
    if (newCategory.trim()) {
      setCategories([...categories, newCategory.trim()])
      setNewCategory('')
    }
  }

  const deleteCategory = (index: number) => {
    setCategories(categories.filter((_, i) => i !== index))
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
          <div className='h-10 w-10 overflow-hidden rounded-full'>
            <Image
              src='/logo.png?height=40&width=40'
              alt='Logo'
              width={40}
              height={40}
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
        <div className='flex-1 overflow-y-auto p-4'>
          <div className='mb-4'>
            <div className='flex items-center justify-between'>
              <h2 className='text-lg font-semibold'>My Calendar Categories</h2>
              <button
                onClick={() => setNewCategory('')}
                className='text-purple-600 hover:text-purple-800 transition-colors duration-200'
              >
                <Plus className='h-5 w-5' />
              </button>
            </div>
            {newCategory !== '' && (
              <div className='mt-2 flex gap-2'>
                <input
                  type='text'
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className='flex-1 rounded border border-gray-300 px-2 py-1'
                  placeholder='New category'
                />
                <button
                  onClick={addCategory}
                  className='rounded bg-purple-600 px-3 py-1 text-white hover:bg-purple-700 transition-colors duration-200'
                >
                  Add
                </button>
              </div>
            )}
          </div>

          <ul className='space-y-1'>
            {categories.map((category, index) => (
              <li
                key={index}
                className='flex items-center justify-between rounded p-2 hover:bg-white/50 transition-colors duration-200'
              >
                <div className='flex items-center'>
                  <div className='h-4 w-4 rounded bg-[#9d75b5]' />
                  <span className='ml-2'>{category}</span>
                </div>
                <button
                  onClick={() => deleteCategory(index)}
                  className='text-gray-500 hover:text-red-500 transition-colors duration-200'
                >
                  <Trash2 className='h-4 w-4' />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </aside>
  )
}
