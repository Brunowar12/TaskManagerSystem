'use client'

import { useState, useEffect } from 'react'
import { X, CalendarIcon, Clock, Tag, BarChart, FileText } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNotification } from '@/contexts/notification-context'

interface Task {
  id: number
  title: string
  description: string
  category: string | number
  due_date: string // Format: "2024-12-08T22:24:00Z"
  due_time: string
  priority: 'L' | 'M' | 'H'
}

interface TaskEditPopupProps {
  isOpen: boolean
  onClose: () => void
  onSave: (
    title: string,
    description: string,
    categoryId: number | null,
    due_date: string,
    priority: 'L' | 'M' | 'H'
  ) => void
  categories: { id: number; name: string }[]
  task: Task | null
}

export default function TaskEditPopup({
  isOpen,
  onClose,
  onSave,
  categories,
  task,
}: TaskEditPopupProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [dueTime, setDueTime] = useState('')
  const [priority, setPriority] = useState<'L' | 'M' | 'H'>('L')
  const { addNotification } = useNotification()
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  useEffect(() => {
    if (task) {
      setTitle(task.title)
      setDescription(task.description || '')
      setCategory(task.category ? task.category.toString() : '')

      // Date and Time Conversion
      if (task.due_date) {
        const utcDate = new Date(task.due_date) // Парсим дату в UTC
        const localDate = new Date(
          utcDate.getTime() + utcDate.getTimezoneOffset() * 60000
        ) // Корректируем смещение UTC

        // Устанавливаем значения для локального времени
        setDueDate(localDate.toISOString().split('T')[0]) // yyyy-MM-dd
        setDueTime(localDate.toTimeString().slice(0, 5)) // HH:mm
      } else {
        setDueDate('')
        setDueTime('')
      }

      setPriority(task.priority)
    }
  }, [task])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    const currentDate = new Date()
    const selectedDate = new Date(`${dueDate}T${dueTime}`)

    if (!title.trim()) {
      newErrors.title = 'Title is required'
    }
    if (!dueDate || !dueTime) {
      newErrors.dueDate = 'Due date and time are required'
    } else if (selectedDate < currentDate) {
      newErrors.dueDate = 'Date and time cannot be in the past'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      const form = document.getElementById('task-form')
      form?.classList.add('animate-shake')
      setTimeout(() => {
        form?.classList.remove('animate-shake')
      }, 500)
      addNotification('error', 'Please fix the errors in the form.')
      return
    }

    let categoryId: number | null = null

    if (category) {
      // Convert category to number if it is selected
      const parsedCategoryId = parseInt(category, 10)
      const categoryObj = categories.find((cat) => cat.id === parsedCategoryId)
      if (!categoryObj) {
        // console.error('Category not found!')
        addNotification('error', 'Invalid category selection.')
        return
      }
      categoryId = categoryObj.id
    }

    // Log data before sending to the server
    /*
    console.log('Данные, которые будут отправлены на сервер:', {
      title,
      description,
      categoryId: categoryId, // May be null if no category is selected
      dueDate: `${dueDate}T${dueTime}`,
      priority,
    })
    */
    onSave(
      title,
      description,
      categoryId, // Send null if no category is selected
      `${dueDate}T${dueTime}`,
      priority
    )

    setErrors({})
    onClose()
    addNotification('success', `Task "${title}" updated successfully!`)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className='fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6'
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className='absolute inset-0 bg-black bg-opacity-30 backdrop-blur-sm'
            onClick={onClose}
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', damping: 15, stiffness: 300 }}
            className='relative w-full max-w-3xl overflow-hidden rounded-xl shadow-xl'
          >
            <div className='absolute inset-0 bg-gradient-to-br from-purple-300 via-pink-200 to-blue-300 opacity-80' />
            <motion.div
              className='absolute inset-0 bg-gradient-to-br from-transparent via-white to-transparent opacity-40'
              animate={{
                backgroundPosition: ['0% 0%', '100% 100%'],
                transition: {
                  duration: 5,
                  repeat: Infinity,
                  repeatType: 'reverse',
                },
              }}
            />
            <div className='relative bg-white bg-opacity-60 p-6 backdrop-blur-sm'>
              <button
                onClick={onClose}
                className='absolute top-4 right-4 text-gray-600 hover:text-gray-800 transition-colors duration-200'
              >
                <X className='w-6 h-6' />
              </button>

              <h2 className='text-2xl font-bold text-gray-800 mb-6'>
                Edit Task
              </h2>

              <form
                id='task-form'
                onSubmit={handleSubmit}
                className='grid grid-cols-1 sm:grid-cols-2 gap-4'
              >
                {/* Title */}
                <div className='space-y-1 sm:col-span-2'>
                  <label className='block text-sm font-medium text-gray-700'>
                    Title
                  </label>
                  <input
                    type='text'
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className={`w-full rounded-lg border ${
                      errors.title ? 'border-red-500' : 'border-gray-300'
                    } px-3 py-2 bg-white bg-opacity-70 focus:outline-none`}
                    placeholder='Enter task title'
                  />
                  {errors.title && (
                    <p className='text-red-500 text-sm'>{errors.title}</p>
                  )}
                </div>

                {/* Description */}
                <div className='space-y-1 sm:col-span-2'>
                  <label className='block text-sm font-medium text-gray-700'>
                    Description
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className={`w-full rounded-lg border px-3 py-2 bg-white bg-opacity-70 focus:outline-none`}
                    placeholder='Enter task description'
                    rows={3}
                  ></textarea>
                </div>

                {/* Category */}
                <div className='space-y-1'>
                  <label className='block text-sm font-medium text-gray-700'>
                    Category
                  </label>
                  <select
                    value={
                      categories.find((cat) => cat.id === Number(category))
                        ?.id || ''
                    }
                    onChange={(e) => setCategory(e.target.value)}
                    className='w-full rounded-lg border border-gray-300 px-3 py-2 bg-white bg-opacity-70 focus:outline-none'
                  >
                    <option value=''>Select Category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Priority */}
                <div className='space-y-1'>
                  <label className='block text-sm font-medium text-gray-700'>
                    Priority
                  </label>
                  <select
                    value={priority}
                    onChange={(e) =>
                      setPriority(e.target.value as 'L' | 'M' | 'H')
                    }
                    className='w-full rounded-lg border border-gray-300 px-3 py-2 bg-white bg-opacity-70 focus:outline-none'
                  >
                    <option value='L'>Low</option>
                    <option value='M'>Medium</option>
                    <option value='H'>High</option>
                  </select>
                </div>

                {/* Due Date and Time */}
                <div className='space-y-1 sm:col-span-2'>
                  <label className='block text-sm font-medium text-gray-700'>
                    Due Date and Time
                  </label>
                  <div className='flex space-x-2'>
                    <input
                      type='date'
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className={`flex-grow rounded-lg border ${
                        errors.dueDate ? 'border-red-500' : 'border-gray-300'
                      } px-3 py-2 bg-white bg-opacity-70 focus:outline-none`}
                    />
                    <input
                      type='time'
                      value={dueTime}
                      onChange={(e) => setDueTime(e.target.value)}
                      className={`flex-grow rounded-lg border ${
                        errors.dueDate ? 'border-red-500' : 'border-gray-300'
                      } px-3 py-2 bg-white bg-opacity-70 focus:outline-none`}
                    />
                  </div>
                  {errors.dueDate && (
                    <p className='text-red-500 text-sm'>{errors.dueDate}</p>
                  )}
                </div>

                {/* Buttons */}
                <div className='sm:col-span-2 flex justify-end space-x-4'>
                  <button
                    type='button'
                    onClick={onClose}
                    className='rounded-lg bg-gray-200 text-gray-700 px-4 py-2 hover:bg-gray-300'
                  >
                    Cancel
                  </button>
                  <button
                    type='submit'
                    className='rounded-lg bg-purple-500 text-white px-4 py-2 hover:bg-purple-600'
                  >
                    Save Task
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
