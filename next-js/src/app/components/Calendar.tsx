import React, { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface Task {
  id: number
  title: string
  dueDate: string
  completed: boolean
}

interface CalendarProps {
  tasks: Task[]
}

const Calendar: React.FC<CalendarProps> = ({ tasks }) => {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [view, setView] = useState<'month' | 'week'>('month')
  const [filter, setFilter] = useState<'all' | 'completed' | 'not_completed'>(
    'all'
  )

  const daysInMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  ).getDate()
  const firstDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  ).getDay()

  const prevMonth = () =>
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
    )
  const nextMonth = () =>
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
    )

  const today = new Date()

  const isToday = (day: number) =>
    today.getDate() === day &&
    today.getMonth() === currentDate.getMonth() &&
    today.getFullYear() === currentDate.getFullYear()

  const getDayTasks = (day: number) => {
    return tasks.filter((task) => {
      const taskDate = new Date(task.dueDate)
      return (
        taskDate.getDate() === day &&
        taskDate.getMonth() === currentDate.getMonth() &&
        taskDate.getFullYear() === currentDate.getFullYear() &&
        (filter === 'all' ||
          (filter === 'completed' && task.completed) ||
          (filter === 'not_completed' && !task.completed))
      )
    })
  }

  const renderMonthView = () => (
    <div className='grid grid-cols-7 gap-2'>
      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
        <div key={day} className='text-center font-bold'>
          {day}
        </div>
      ))}
      {Array.from({ length: firstDayOfMonth }).map((_, index) => (
        <div key={`empty-${index}`} />
      ))}
      {Array.from({ length: daysInMonth }).map((_, index) => {
        const day = index + 1
        const dayTasks = getDayTasks(day)
        return (
          <div
            key={day}
            className={`border p-2 h-24 overflow-y-auto ${
              isToday(day) ? 'bg-yellow-200' : 'hover:bg-gray-100'
            } transition-colors duration-200`}
          >
            <div className='font-semibold'>{day}</div>
            {dayTasks.map((task) => (
              <div
                key={task.id}
                className={`text-xs mt-1 p-1 rounded ${
                  task.completed ? 'bg-green-500' : 'bg-red-500'
                } text-white`}
                title={task.title}
              >
                {task.title}
              </div>
            ))}
          </div>
        )
      })}
    </div>
  )

  const renderWeekView = () => {
    const startOfWeek = new Date(currentDate)
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay())

    return (
      <div className='grid grid-cols-7 gap-2'>
        {Array.from({ length: 7 }).map((_, index) => {
          const day = new Date(startOfWeek)
          day.setDate(startOfWeek.getDate() + index)
          const dayTasks = getDayTasks(day.getDate())

          return (
            <div
              key={index}
              className={`border p-2 min-h-[200px] overflow-y-auto ${
                isToday(day.getDate()) ? 'bg-yellow-200' : 'hover:bg-gray-100'
              } transition-colors duration-200`}
            >
              <div className='font-semibold'>
                {day.toLocaleDateString('en-US', {
                  weekday: 'short',
                  day: 'numeric',
                })}
              </div>
              {dayTasks.map((task) => (
                <div
                  key={task.id}
                  className={`text-xs mt-1 p-1 rounded ${
                    task.completed ? 'bg-green-500' : 'bg-red-500'
                  } text-white`}
                  title={task.title}
                >
                  {task.title}
                </div>
              ))}
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div className='bg-white p-4 rounded-lg shadow-md'>
      <div className='flex justify-between items-center mb-4'>
        <h2 className='text-xl font-bold'>
          {currentDate.toLocaleDateString('en-US', {
            month: 'long',
            year: 'numeric',
          })}
        </h2>
        <div className='flex items-center space-x-4'>
          <select
            value={view}
            onChange={(e) => setView(e.target.value as 'month' | 'week')}
            className='border rounded p-1'
          >
            <option value='month'>Month</option>
            <option value='week'>Week</option>
          </select>
          <select
            value={filter}
            onChange={(e) =>
              setFilter(e.target.value as 'all' | 'completed' | 'not_completed')
            }
            className='border rounded p-1'
          >
            <option value='all'>All Tasks</option>
            <option value='completed'>Completed</option>
            <option value='not_completed'>Not Completed</option>
          </select>
          <button onClick={prevMonth} className='p-1 rounded hover:bg-gray-200'>
            <ChevronLeft size={20} />
          </button>
          <button onClick={nextMonth} className='p-1 rounded hover:bg-gray-200'>
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
      {view === 'month' ? renderMonthView() : renderWeekView()}
    </div>
  )
}

export default Calendar
