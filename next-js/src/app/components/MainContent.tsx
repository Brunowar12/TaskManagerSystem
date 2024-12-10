'use client'

import { useState } from 'react'
import {
  Search,
  Filter,
  Edit,
  Star,
  Trash,
  Plus,
  Calendar,
  Clock,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import TaskCreationPopup from './TaskCreationPopup'
import TaskEditPopup from './TaskEditPopup'
import { useNotification } from '@/contexts/notification-context'
import { useTaskContext } from '@/contexts/TaskManagementContext'
import { useCategoryContext } from '@/contexts/CategoryManagement'

export default function MainContent() {
  const {
    tasks,
    nextPageUrl,
    fetchTasks,
    addTask,
    updateTaskById,
    deleteTaskById,
  } = useTaskContext()

  const [isCreationPopupOpen, setCreationPopupOpen] = useState(false)
  const [isEditPopupOpen, setEditPopupOpen] = useState(false)
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null)
  const { addNotification } = useNotification()
  const { categories } = useCategoryContext()
  const [searchQuery, setSearchQuery] = useState('')
  const [ordering, setOrdering] = useState<string | null>(null)
  const [priority, setPriority] = useState<string | null>(null)
  const [completionFilter, setCompletionFilter] = useState<string | null>(null)
  const [isFiltersVisible, setFiltersVisible] = useState(true)

  const toggleFiltersVisibility = () => {
    setFiltersVisible(!isFiltersVisible)
  }

  const handleSearch = () => {
    // Всегда используем текущие значения всех фильтров
    fetchTasks('http://127.0.0.1:8000/tasks/', {
      search: searchQuery,
      ordering,
      priority,
      completed:
        completionFilter === 'Completed'
          ? true
          : completionFilter === 'Incomplete'
          ? false
          : undefined,
    })
  }

  const handlePriorityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value
    setPriority(value === 'All' ? null : value)
    fetchTasks('http://127.0.0.1:8000/tasks/', {
      search: searchQuery,
      ordering,
      priority: value === 'All' ? undefined : value,
      completed:
        completionFilter === 'Completed'
          ? true
          : completionFilter === 'Incomplete'
          ? false
          : undefined,
    })
  }

  const handleCompletionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value
    setCompletionFilter(value === 'All Status' ? null : value)
    fetchTasks('http://127.0.0.1:8000/tasks/', {
      search: searchQuery,
      ordering,
      priority,
      completed:
        value === 'Completed'
          ? true
          : value === 'Incomplete'
          ? false
          : undefined,
    })
  }

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value
    setOrdering(value)
    fetchTasks('http://127.0.0.1:8000/tasks/', {
      search: searchQuery,
      ordering: value,
      priority,
      completed:
        completionFilter === 'Completed'
          ? true
          : completionFilter === 'Incomplete'
          ? false
          : undefined,
    })
  }

  const clearFilters = () => {
    setSearchQuery('')
    setOrdering(null)
    setPriority(null)
    setCompletionFilter(null)
    fetchTasks('http://127.0.0.1:8000/tasks/')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const getCategoryNameById = (id: number): string => {
    const category = categories.find((cat) => cat.id === id)
    return category ? category.name : 'Unknown'
  }

  const toggleTaskCompletion = async (id: number, completed: boolean) => {
    try {
      await updateTaskById(id, { completed: !completed })
      addNotification(
        'info',
        !completed ? 'Task marked as completed!' : 'Task marked as incomplete.'
      )
      fetchTasks()
    } catch (error) {
      console.error('Error toggling task completion:', error)
      addNotification('error', 'Failed to update task completion status.')
    }
  }

  const toggleTaskStarred = async (id: number, is_favorite: boolean) => {
    try {
      await updateTaskById(id, { is_favorite: !is_favorite })
      addNotification(
        'success',
        !is_favorite
          ? 'Task added to favorites!'
          : 'Task removed from favorites.'
      )
    } catch (error) {
      console.error('Error toggling task favorite status:', error)
      addNotification('error', 'Failed to update favorite status.')
    }
  }

  const handleCreateTask = async (task: {
    title: string
    description?: string
    category_id: number
    due_date: string
    priority: 'L' | 'M' | 'H'
  }) => {
    try {
      // console.log('Task being sent to server:', task)
      await addTask(
        task.title,
        task.description,
        task.category_id,
        task.due_date,
        task.priority
      )

      await fetchTasks()

      setCreationPopupOpen(false)
      addNotification('success', 'Task created successfully!')
    } catch (error) {
      console.error('Error creating task:', error)
      addNotification('error', 'Failed to create task. Please try again.')
    }
  }

  const handleEditTask = async (
    id: number,
    data: Partial<{
      title: string
      description: string
      category: string
      due_date: string
      priority: 'L' | 'M' | 'H'
    }>
  ) => {
    try {
      await updateTaskById(id, data)
      setEditPopupOpen(false)
      addNotification('info', 'Task updated successfully!')
    } catch (error) {
      console.error('Error updating task:', error)
      addNotification('error', 'Failed to update task.')
    }
  }

  const openEditPopup = (task: Task) => {
    setTaskToEdit(task)
    setEditPopupOpen(true)
  }

  const handleDeleteTask = async (id: number) => {
    try {
      await deleteTaskById(id)
      await fetchTasks()
      addNotification('success', 'Task deleted successfully!')
    } catch (error) {
      console.error('Error deleting task:', error)
      addNotification('error', 'Failed to delete task.')
    }
  }

  const loadMoreTasks = () => {
    if (nextPageUrl) {
      fetchTasks(nextPageUrl)
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'H':
        return 'bg-red-500'
      case 'medium':
        return 'bg-orange-500'
      case 'L':
        return 'bg-green-500'
      default:
        return 'bg-orange-500'
    }
  }

  const formatPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'H':
        return 'High'
      case 'M':
        return 'Medium'
      case 'L':
        return 'Low'
      default:
        return 'Unknown'
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'UTC',
      hour12: false,
    })
  }

  return (
    <div className='flex flex-col h-full overflow-hidden animate-fadeIn'>
      <TaskCreationPopup
        isOpen={isCreationPopupOpen}
        onClose={() => setCreationPopupOpen(false)}
        onSave={handleCreateTask}
        categories={categories}
      />
      {taskToEdit && (
        <TaskEditPopup
          isOpen={isEditPopupOpen}
          onClose={() => setEditPopupOpen(false)}
          onSave={(title, description, categoryId, due_date, priority) =>
            handleEditTask(taskToEdit.id, {
              title,
              description,
              category: categoryId,
              due_date,
              priority,
            })
          }
          categories={categories} // Transfer categories in the format [{ id: 1, name: 'Work' }, ...]
          task={taskToEdit} // Transferring data of the current task
        />
      )}

      <div className='mb-6'>
        <div className='inline-block bg-white rounded-full px-4 py-2 shadow-md'>
          <h2 className='text-lg font-semibold text-gray-800'>
            My Day ·{' '}
            {new Date().toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </h2>
        </div>
      </div>

      <div className='flex-1 overflow-y-auto space-y-6'>
        {/* Filters and Search */}
        <div className='rounded-lg bg-white bg-opacity-75 p-6 shadow-lg'>
          <div className='flex items-center justify-between mb-4'>
            <h3 className='text-xl font-semibold'>Filters and Search</h3>
            <button
              onClick={toggleFiltersVisibility}
              className='text-gray-500 hover:text-gray-800'
            >
              {isFiltersVisible ? (
                <ChevronUp size={24} />
              ) : (
                <ChevronDown size={24} />
              )}
            </button>
          </div>

          {isFiltersVisible && (
            <div className='mb-4 flex flex-wrap gap-4'>
              <div className='flex-1 min-w-[200px]'>
                <div className='relative'>
                  <input
                    type='text'
                    className='w-full rounded-md border border-gray-300 py-2 pl-10 pr-3 focus:border-transparent focus:ring-2 focus:ring-purple-500 transition-all duration-200'
                    placeholder='Search tasks...'
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                  />

                  <Search
                    className='absolute left-3 top-2.5 text-gray-400'
                    size={20}
                  />
                </div>
              </div>
              <div className='flex-1 min-w-[200px]'>
                <div className='relative'>
                  <select
                    className='w-full appearance-none rounded-md border border-gray-300 py-2 pl-3 pr-10 focus:border-transparent focus:ring-2 focus:ring-purple-500 transition-all duration-200'
                    value={completionFilter || 'All Status'}
                    onChange={handleCompletionChange}
                  >
                    <option value='All Status'>All Status</option>
                    <option value='Completed'>Completed</option>
                    <option value='Incomplete'>Incomplete</option>
                  </select>
                  <ChevronDown
                    className='pointer-events-none absolute right-3 top-2.5 text-gray-400'
                    size={20}
                  />
                </div>
              </div>
              <div className='flex-1 min-w-[200px]'>
                <div className='relative'>
                  <select
                    className='w-full appearance-none rounded-md border border-gray-300 py-2 pl-3 pr-10 focus:border-transparent focus:ring-2 focus:ring-purple-500 transition-all duration-200'
                    value={priority || 'All'}
                    onChange={handlePriorityChange}
                  >
                    <option value='All'>All Priority</option>
                    <option value='H'>High</option>
                    <option value='M'>Medium</option>
                    <option value='L'>Low</option>
                  </select>
                  <ChevronDown
                    className='pointer-events-none absolute right-3 top-2.5 text-gray-400'
                    size={20}
                  />
                </div>
              </div>
              <div className='flex-1 min-w-[200px]'>
                <div className='relative'>
                  <select
                    className='w-full appearance-none rounded-md border border-gray-300 py-2 pl-3 pr-10 focus:border-transparent focus:ring-2 focus:ring-purple-500 transition-all duration-200'
                    value={ordering || ''}
                    onChange={handleSortChange}
                  >
                    <option value=''>Sort by Default</option>
                    <option value='due_date'>Due Date (Ascending)</option>
                    <option value='-due_date'>Due Date (Descending)</option>
                    <option value='title'>Title (A-Z)</option>
                    <option value='-title'>Title (Z-A)</option>
                  </select>
                  <ChevronDown
                    className='pointer-events-none absolute right-3 top-2.5 text-gray-400'
                    size={20}
                  />
                </div>
              </div>

              <button
                className='rounded-md bg-purple-600 px-4 py-2 text-white transition-colors hover:bg-purple-700 duration-200'
                onClick={() => clearFilters()}
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>

        <div className='mb-6'>
          <button
            onClick={() => setCreationPopupOpen(true)}
            className='flex items-center rounded-md bg-purple-600 px-4 py-2 text-white shadow-md transition-colors hover:bg-purple-700 duration-200'
          >
            <Plus className='mr-2' size={20} />
            Create Task
          </button>
        </div>
        {/* Tasks List */}
        <div className='rounded-lg bg-white bg-opacity-75 p-6 shadow-lg'>
          <ul className='space-y-4'>
            {tasks.map((task) => (
              <li
                key={task.id}
                className={`overflow-hidden rounded-lg shadow-md ${
                  task.isOverdue ? 'overdue-task' : 'bg-white'
                }`}
              >
                <div className='flex items-center justify-between border-b border-gray-200 p-4'>
                  <div className='flex items-center'>
                    <input
                      type='checkbox'
                      checked={task.completed}
                      onChange={() =>
                        toggleTaskCompletion(task.id, task.completed)
                      }
                      className='mr-4 h-5 w-5 rounded text-purple-600 focus:ring-purple-500'
                    />
                    <h4
                      className={`text-lg font-semibold ${
                        task.completed ? 'line-through text-gray-400' : ''
                      }`}
                    >
                      {task.title}
                    </h4>
                    {task.isOverdue && (
                      <span className='ml-2 text-sm text-red-600 font-semibold'>
                        Deadline missed!
                      </span>
                    )}
                  </div>
                  <div className='flex space-x-2'>
                    <button
                      onClick={() => openEditPopup(task)}
                      className='text-gray-400 hover:text-purple-600'
                    >
                      <Edit size={20} />
                    </button>
                    <button
                      onClick={() =>
                        toggleTaskStarred(task.id, task.is_favorite)
                      }
                      className={`text-gray-400 hover:text-yellow-500 ${
                        task.is_favorite ? 'text-yellow-500' : ''
                      }`}
                    >
                      <Star
                        size={20}
                        fill={task.is_favorite ? 'currentColor' : 'none'}
                      />
                    </button>
                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      className='text-gray-400 hover:text-red-500'
                    >
                      <Trash size={20} />
                    </button>
                  </div>
                </div>
                <div className='p-4'>
                  <p className='mb-4 text-gray-600'>{task.description}</p>
                  <div className='flex flex-wrap gap-4 text-sm text-gray-500'>
                    <div className='flex items-center'>
                      <Calendar size={16} className='mr-1' />
                      <span>Created: {formatDate(task.created_at)}</span>
                    </div>
                    <div className='flex items-center'>
                      <Clock size={16} className='mr-1' />
                      <span
                        className={`${
                          task.isOverdue ? 'text-red-600 font-bold' : ''
                        }`}
                      >
                        Due: {formatDate(task.due_date)}
                      </span>
                    </div>
                    {task.category && (
                      <div className='flex items-center'>
                        <div className='mr-1 h-3 w-3 rounded-full bg-[#9d75b5]' />
                        <span>{getCategoryNameById(task.category)}</span>
                      </div>
                    )}
                    <div
                      className={`flex items-center rounded-full px-2 py-1 text-white ${getPriorityColor(
                        task.priority
                      )}`}
                    >
                      {formatPriorityLabel(task.priority)} Priority
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
          {nextPageUrl && (
            <div className='mt-4 flex justify-center'>
              <button
                onClick={loadMoreTasks}
                className='rounded-md bg-purple-600 px-6 py-2 text-white shadow-md hover:bg-purple-700'
              >
                Load More
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
