'use client'

import { useState, useEffect } from 'react'
import { X, CalendarIcon, Clock } from 'lucide-react'

interface TaskCreationPopupProps {
  isOpen: boolean
  onClose: () => void
  onSave: (task: any) => void
  categories: string[]
}

export default function TaskCreationPopup({ isOpen, onClose, onSave, categories }: TaskCreationPopupProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState(categories[0])
  const [dueDate, setDueDate] = useState('')
  const [dueTime, setDueTime] = useState('')
  const [priority, setPriority] = useState('medium')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true)
    } else {
      const timer = setTimeout(() => setIsVisible(false), 300)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!title.trim()) {
      newErrors.title = 'Title is required'
    }
    if (!dueDate) {
      newErrors.dueDate = 'Due date is required'
    }
    if (!dueTime) {
      newErrors.dueTime = 'Due time is required'
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
      return
    }

    onSave({
      title,
      description,
      category,
      dueDate: `${dueDate}T${dueTime}`,
      priority,
    })

    setTitle('')
    setDescription('')
    setCategory(categories[0])
    setDueDate('')
    setDueTime('')
    setPriority('medium')
    setErrors({})
    onClose()
  }

  if (!isVisible) return null

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      <div className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative w-full max-w-md bg-white rounded-xl shadow-xl p-6 transition-all duration-300 ${isOpen ? 'scale-100' : 'scale-95'}`}>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors duration-200"
        >
          <X className="w-6 h-6" />
        </button>

        <h2 className="text-2xl font-bold text-gray-800 mb-6">Create New Task</h2>

        <form id="task-form" onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={`w-full rounded-lg border ${
                errors.title ? 'border-red-500' : 'border-gray-300'
              } px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors duration-200`}
              placeholder="Enter task title"
            />
            {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors duration-200"
              placeholder="Enter task description"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors duration-200"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
              <div className="relative">
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className={`w-full rounded-lg border ${
                    errors.dueDate ? 'border-red-500' : 'border-gray-300'
                  } px-3 py-2 pl-10 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors duration-200`}
                />
                <CalendarIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                {errors.dueDate && <p className="text-red-500 text-sm mt-1">{errors.dueDate}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Due Time</label>
              <div className="relative">
                <input
                  type="time"
                  value={dueTime}
                  onChange={(e) => setDueTime(e.target.value)}
                  className={`w-full rounded-lg border ${
                    errors.dueTime ? 'border-red-500' : 'border-gray-300'
                  } px-3 py-2 pl-10 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors duration-200`}
                />
                <Clock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                {errors.dueTime && <p className="text-red-500 text-sm mt-1">{errors.dueTime}</p>}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors duration-200"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200"
            >
              Create Task
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

