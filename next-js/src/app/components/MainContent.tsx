'use client'

import { useState } from 'react'
import { Search, Filter, ChevronDown, Edit, Star, Trash, Plus, Calendar, Clock } from 'lucide-react'
import TaskCreationPopup from './TaskCreationPopup'
import TaskEditPopup from './TaskEditPopup'
import { useNotification } from '@/contexts/notification-context'

interface Task {
  id: number;
  title: string;
  description: string;
  createdAt: string;
  dueDate: string;
  category: string;
  priority: 'high' | 'medium' | 'low';
  completed: boolean;
  starred: boolean;
}

export default function MainContent() {
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: 1,
      title: 'Complete project proposal',
      description: 'Finish the draft and send it for review',
      createdAt: '2023-06-08T10:00:00',
      dueDate: '2023-06-15T17:00:00',
      category: 'Work',
      priority: 'high',
      completed: false,
      starred: false,
    },
    {
      id: 2,
      title: 'Buy groceries',
      description: 'Get items for the week',
      createdAt: '2023-06-09T14:30:00',
      dueDate: '2023-06-10T18:00:00',
      category: 'Shopping',
      priority: 'medium',
      completed: true,
      starred: true,
    },
    {
      id: 3,
      title: 'Schedule dentist appointment',
      description: 'Call the clinic for a check-up',
      createdAt: '2023-06-10T09:15:00',
      dueDate: '2023-06-20T11:00:00',
      category: 'Personal',
      priority: 'low',
      completed: false,
      starred: false,
    },
  ])
  
  const [isCreationPopupOpen, setCreationPopupOpen] = useState(false)
  const [isEditPopupOpen, setEditPopupOpen] = useState(false)
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null)
  const { addNotification } = useNotification();

  const toggleTaskCompletion = (id: number) => {
    setTasks(tasks.map(task =>
      task.id === id ? { ...task, completed: !task.completed } : task
    ))
    const task = tasks.find(task => task.id === id);
    if (task) {
      addNotification(
        'info',
        task.completed ? 'Task marked as incomplete.' : 'Task completed!'
      );
    }
  }

  const toggleTaskStarred = (id: number) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, starred: !task.starred } : task
    ));
    const task = tasks.find(task => task.id === id);
    if (task) {
      addNotification(
        'success',
        task.starred ? 'Task removed from favorites.' : 'Task added to favorites!'
      );
    }
  };

  const handleCreateTask = (task: Partial<Task>) => {
    setTasks(prev => [
      ...prev,
      {
        id: prev.length + 1,
        title: task.title || 'New Task',
        description: task.description || '',
        createdAt: new Date().toISOString(),
        dueDate: task.dueDate || new Date().toISOString(),
        category: task.category || 'Uncategorized',
        priority: task.priority || 'low',
        completed: false,
        starred: false,
      },
    ])
    
  }

  const handleEditTask = (updatedTask: Task) => {
    setTasks(prev =>
      prev.map(task => (task.id === updatedTask.id ? updatedTask : task))
    )
    setEditPopupOpen(false)
    addNotification('info', 'Task updated successfully!');
  }

  const openEditPopup = (task: Task) => {
    setTaskToEdit(task)
    setEditPopupOpen(true)
  }

  const handleDeleteTask = (id: number) => {
    setTasks(tasks.filter(task => task.id !== id));
    addNotification('success', 'Task deleted successfully!');
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-500'
      case 'medium':
        return 'bg-orange-500'
      case 'low':
        return 'bg-green-500'
      default:
        return 'bg-gray-500'
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
    })
  }

  return (
    <div className="flex flex-col h-full overflow-hidden animate-fadeIn">
      <TaskCreationPopup
        isOpen={isCreationPopupOpen}
        onClose={() => setCreationPopupOpen(false)}
        onSave={handleCreateTask}
        categories={['Work', 'Shopping', 'Personal']}
      />
      {taskToEdit && (
        <TaskEditPopup
          isOpen={isEditPopupOpen}
          onClose={() => setEditPopupOpen(false)}
          onSave={handleEditTask}
          
          categories={['Work', 'Shopping', 'Personal']}
        />
      )}

      <div className="mb-6">
        <div className="inline-block bg-white rounded-full px-4 py-2 shadow-md">
          <h2 className="text-lg font-semibold text-gray-800">
            My Day · {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
          </h2>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto space-y-6">
        {/* Filters and Search */}
        <div className="rounded-lg bg-white bg-opacity-75 p-6 shadow-lg">
          <h3 className="mb-4 text-xl font-semibold">Filters and Search</h3>
          <div className="mb-4 flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <input type="text" className="w-full rounded-md border border-gray-300 py-2 pl-10 pr-3 focus:border-transparent focus:ring-2 focus:ring-purple-500 transition-all duration-200" placeholder="Search tasks..." />
                <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
              </div>
            </div>
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <select className="w-full appearance-none rounded-md border border-gray-300 py-2 pl-3 pr-10 focus:border-transparent focus:ring-2 focus:ring-purple-500 transition-all duration-200">
                  <option>All Status</option>
                  <option>Completed</option>
                  <option>Incomplete</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-2.5 text-gray-400" size={20} />
              </div>
            </div>
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <select className="w-full appearance-none rounded-md border border-gray-300 py-2 pl-3 pr-10 focus:border-transparent focus:ring-2 focus:ring-purple-500 transition-all duration-200">
                  <option>All Priority</option>
                  <option>High</option>
                  <option>Medium</option>
                  <option>Low</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-2.5 text-gray-400" size={20} />
              </div>
            </div>
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <select className="w-full appearance-none rounded-md border border-gray-300 py-2 pl-3 pr-10 focus:border-transparent focus:ring-2 focus:ring-purple-500 transition-all duration-200">
                  <option>Sort by Due Date</option>
                  <option>Sort by Priority</option>
                  <option>Sort Alphabetically</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-2.5 text-gray-400" size={20} />
              </div>
            </div>
          </div>
          <button className="rounded-md bg-purple-600 px-4 py-2 text-white transition-colors hover:bg-purple-700 duration-200">
            Clear Filters
          </button>
        </div>
        
        <div className="mb-6">
          <button
            onClick={() => setCreationPopupOpen(true)}
            className="flex items-center rounded-md bg-purple-600 px-4 py-2 text-white shadow-md transition-colors hover:bg-purple-700 duration-200"
          >
            <Plus className="mr-2" size={20} />
            Create Task
          </button>
        </div>
        
        <div className="rounded-lg bg-white bg-opacity-75 p-6 shadow-lg">
          <ul className="space-y-4">
            {tasks.map(task => (
              <li key={task.id} className="overflow-hidden rounded-lg bg-white shadow-md transition-all duration-200 hover:shadow-lg">
                <div className="flex items-center justify-between border-b border-gray-200 p-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => toggleTaskCompletion(task.id)}
                      className="mr-4 h-5 w-5 rounded text-purple-600 focus:ring-purple-500 transition-all duration-200"
                    />
                    <h4 className={`text-lg font-semibold ${task.completed ? 'line-through text-gray-400' : ''} transition-all duration-200`}>{task.title}</h4>
                  </div>
                  <div className="flex space-x-2">
                    <button onClick={() => openEditPopup(task)} className="text-gray-400 transition-colors hover:text-purple-600 duration-200"><Edit size={20} /></button>
                
                    <button 
                             onClick={() => toggleTaskStarred(task.id)} 
                            className={`text-gray-400 transition-colors hover:text-yellow-500 duration-200 ${
                            task.starred ? 'text-yellow-500' : 'text-gray-400'
                              }`}
                              >
  <Star size={20} fill={task.starred ? 'currentColor' : 'none'} />
</button>
                    
                    <button onClick={() => handleDeleteTask(task.id)} className="text-gray-400 transition-colors hover:text-red-500 duration-200"><Trash size={20} /></button>
                  </div>
                </div>
                <div className="p-4">
                  <p className="mb-4 text-gray-600">{task.description}</p>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                    <div className="flex items-center">
                      <Calendar size={16} className="mr-1" />
                      <span>Created: {formatDate(task.createdAt)}</span>
                    </div>
                    <div className="flex items-center">
                      <Clock size={16} className="mr-1" />
                      <span>Due: {formatDate(task.dueDate)}</span>
                    </div>
                    <div className="flex items-center">
                      <div className="mr-1 h-3 w-3 rounded-full bg-[#9d75b5]" />
                      <span>{task.category}</span>
                    </div>
                    <div className={`flex items-center rounded-full px-2 py-1 text-white ${getPriorityColor(task.priority)} transition-all duration-200`}>
                      {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} Priority
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex justify-center">
            <button className="rounded-md bg-purple-600 px-6 py-2 text-white shadow-md transition-transform transform hover:scale-105 active:scale-95 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2">
              Load More
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
