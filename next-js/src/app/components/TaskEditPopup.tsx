'use client'

import { useState, useEffect } from 'react'
import {
  X,
  CalendarIcon,
  Clock,
  Tag,
  BarChart,
  FileText,
  ListTodo,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNotification } from '@/contexts/notification-context'

interface Task {
  id: number
  title: string
  description: string
  category: string | number // Имя или ID категории
  due_date: string
  due_time: string
  priority: 'L' | 'M' | 'H'
}

interface TaskEditPopupProps {
  isOpen: boolean
  onClose: () => void
  onSave: (
    title: string,
    description: string,
    categoryId: number,
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
      setDueDate(task.due_date || '')
      setDueTime(task.due_time || '')
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
    if (!description.trim()) {
      newErrors.description = 'Description is required'
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

    // Получаем ID категории из списка категорий
    const categoryObj = categories.find((cat) => cat.name === category)
    if (!categoryObj) {
      console.error('Category not found!')
      addNotification('error', 'Invalid category selection.')
      return
    }

    // Логируем данные перед отправкой на сервер
    console.log('Данные, которые будут отправлены на сервер:', {
      title,
      description,
      categoryId: categoryObj.id, // Используем ID категории
      dueDate: `${dueDate}T${dueTime}`,
      priority,
    })

    onSave(
      title,
      description,
      categoryObj.id,
      `${dueDate}T${dueTime}`,
      priority
    )

    setErrors({})
    onClose()
    addNotification('success', 'Task updated successfully!')
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
                <div className='space-y-1 sm:col-span-2'>
                  <label className='block text-sm font-medium text-gray-700'>
                    Title
                  </label>
                  <div className='flex items-center space-x-2'>
                    <FileText className='w-5 h-5 text-gray-400' />
                    <input
                      type='text'
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className={`flex-grow rounded-lg border ${
                        errors.title ? 'border-red-500' : 'border-gray-300'
                      } px-3 py-2 bg-white bg-opacity-70 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors duration-200`}
                      placeholder='Enter task title'
                    />
                  </div>
                  {errors.title && (
                    <p className='text-red-500 text-sm'>{errors.title}</p>
                  )}
                </div>

                <div className='space-y-1 sm:col-span-2'>
                  <label className='block text-sm font-medium text-gray-700'>
                    Description
                  </label>
                  <div className='flex items-start space-x-2'>
                    <ListTodo className='w-5 h-5 text-gray-400 mt-2' />
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={2}
                      className={`flex-grow rounded-lg border ${
                        errors.description
                          ? 'border-red-500'
                          : 'border-gray-300'
                      } px-3 py-2 bg-white bg-opacity-70 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors duration-200`}
                      placeholder='Enter task description'
                    />
                  </div>
                  {errors.description && (
                    <p className='text-red-500 text-sm mt-1'>
                      {errors.description}
                    </p>
                  )}
                </div>

                <div className='space-y-1'>
                  <label className='block text-sm font-medium text-gray-700'>
                    Category
                  </label>
                  <div className='flex items-center space-x-2'>
                    <Tag className='w-5 h-5 text-gray-400' />
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className='flex-grow rounded-lg border border-gray-300 px-3 py-2 bg-white bg-opacity-70 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors duration-200'
                    >
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.name}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className='space-y-1'>
                  <label className='block text-sm font-medium text-gray-700'>
                    Priority
                  </label>
                  <div className='flex items-center space-x-2'>
                    <BarChart className='w-5 h-5 text-gray-400' />
                    <select
                      value={priority}
                      onChange={(e) =>
                        setPriority(e.target.value as 'L' | 'M' | 'H')
                      }
                      className='flex-grow rounded-lg border border-gray-300 px-3 py-2 bg-white bg-opacity-70 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors duration-200'
                    >
                      <option value='L'>Low</option>
                      <option value='M'>Medium</option>
                      <option value='H'>High</option>
                    </select>
                  </div>
                </div>

                <div className='space-y-1 sm:col-span-2'>
                  <label className='block text-sm font-medium text-gray-700'>
                    Due Date and Time
                  </label>
                  <div className='flex items-center space-x-2'>
                    <CalendarIcon className='w-5 h-5 text-gray-400' />
                    <div className='flex-grow grid grid-cols-1 sm:grid-cols-2 gap-2'>
                      <input
                        type='date'
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                        className={`rounded-lg border ${
                          errors.dueDate ? 'border-red-500' : 'border-gray-300'
                        } px-3 py-2 bg-white bg-opacity-70 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors duration-200`}
                      />
                      <div className='flex items-center space-x-2'>
                        <Clock className='w-5 h-5 text-gray-400' />
                        <input
                          type='time'
                          value={dueTime}
                          onChange={(e) => setDueTime(e.target.value)}
                          className={`flex-grow rounded-lg border ${
                            errors.dueDate
                              ? 'border-red-500'
                              : 'border-gray-300'
                          } px-3 py-2 bg-white bg-opacity-70 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors duration-200`}
                        />
                      </div>
                    </div>
                  </div>
                  {errors.dueDate && (
                    <p className='text-red-500 text-sm'>{errors.dueDate}</p>
                  )}
                </div>

                <div className='flex justify-end space-x-3 mt-6 sm:col-span-2'>
                  <button
                    type='button'
                    onClick={onClose}
                    className='px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200'
                  >
                    Cancel
                  </button>
                  <button
                    type='submit'
                    className='px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200'
                  >
                    Update Task
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
