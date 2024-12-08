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

interface TaskCreationPopupProps {
  isOpen: boolean
  onClose: () => void
  onSave: (task: any) => void
  categories: string[]
}

export default function TaskCreationPopup({
  isOpen,
  onClose,
  onSave,
  categories,
}: TaskCreationPopupProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState()
  const [dueDate, setDueDate] = useState('')
  const [dueTime, setDueTime] = useState('23:59')
  const [priority, setPriority] = useState('medium')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const { addNotification } = useNotification()

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
      newErrors.dueDate = 'Due date is required'
      newErrors.dueTime = 'Due time is required'
    } else if (selectedDate < currentDate) {
      newErrors.dueDate = 'Date and time cannot be in the past'
      newErrors.dueTime = 'Date and time cannot be in the past'
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

    onSave({
      title,
      description,
      category,
      dueDate: `${dueDate}T${dueTime}`,
      priority,
    })

    addNotification('success', 'Task created successfully!')

    setTitle('')
    setDescription('')
    setCategory(categories[0])
    setDueDate('')
    setDueTime('23:59')
    setPriority('medium')
    setErrors({})
    onClose()
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
                Create New Task
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
                      <option value={null}>Select Category</option>
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
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
                      onChange={(e) => setPriority(e.target.value)}
                      className='flex-grow rounded-lg border border-gray-300 px-3 py-2 bg-white bg-opacity-70 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors duration-200'
                    >
                      <option value='low'>Low</option>
                      <option value='medium'>Medium</option>
                      <option value='high'>High</option>
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
                            errors.dueTime
                              ? 'border-red-500'
                              : 'border-gray-300'
                          } px-3 py-2 bg-white bg-opacity-70 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors duration-200`}
                        />
                      </div>
                    </div>
                  </div>
                  {(errors.dueDate || errors.dueTime) && (
                    <p className='text-red-500 text-sm'>
                      {errors.dueDate || errors.dueTime}
                    </p>
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
                    Create Task
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
