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
    <div className='grid grid-cols-7 gap-1 sm:gap-2'>
      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
        <div key={day} className='text-center font-bold text-xs sm:text-sm'>
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
            className={`border p-1 rounded-lg sm:p-2 h-16 sm:h-24 overflow-hidden ${
              isToday(day)
                ? 'ring-2 ring-purple-500 shadow-lg'
                : 'hover:bg-gray-100'
            } transition-colors duration-200`}
          >
            <div className='font-semibold text-xs sm:text-sm'>{day}</div>
            {/* For small screens, we only show the number of tasks */}
            <div className='block sm:hidden text-[10px] text-gray-500'>
              {dayTasks.length > 0 ? `${dayTasks.length} task(s)` : ''}
            </div>
            {/* For large screens we show tasks */}
            <div className='hidden sm:block'>
              {dayTasks.map((task) => (
                <div
                  key={task.id}
                  className={`text-[8px] sm:text-[10px] mt-1 p-[2px] rounded-sm ${
                    task.completed ? 'bg-green-500' : 'bg-red-500'
                  } text-white`}
                  title={task.title}
                >
                  {task.title}
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )

  const renderWeekView = () => {
    const startOfWeek = new Date(currentDate)
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay())

    return (
      <div className='grid grid-cols-7 gap-1 sm:gap-2'>
        {Array.from({ length: 7 }).map((_, index) => {
          const day = new Date(startOfWeek)
          day.setDate(startOfWeek.getDate() + index)
          const dayTasks = getDayTasks(day.getDate())

          return (
            <div
              key={index}
              className={`border p-1 rounded-lg sm:p-2 min-h-[80px] sm:min-h-[100px] overflow-hidden ${
                isToday(day.getDate())
                  ? 'ring-2 ring-purple-500 shadow-lg'
                  : 'hover:bg-gray-100'
              } transition-colors duration-200`}
            >
              <div className='font-semibold text-xs sm:text-sm'>
                {day.toLocaleDateString('en-US', {
                  weekday: 'short',
                  day: 'numeric',
                })}
              </div>
              <div className='block sm:hidden text-[10px] text-gray-500'>
                {dayTasks.length > 0 ? `${dayTasks.length} task(s)` : ''}
              </div>
              <div className='hidden sm:block'>
                {dayTasks.map((task) => (
                  <div
                    key={task.id}
                    className={`text-[8px] sm:text-[10px] mt-1 p-[2px] rounded-sm ${
                      task.completed ? 'bg-green-500' : 'bg-red-500'
                    } text-white`}
                    title={task.title}
                  >
                    {task.title}
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div className='bg-white p-3 sm:p-4 rounded-lg shadow-md'>
      <div className='flex flex-wrap justify-between items-center mb-2 sm:mb-4'>
        <h2 className='text-lg sm:text-xl font-bold'>
          {currentDate.toLocaleDateString('en-US', {
            month: 'long',
            year: 'numeric',
          })}
        </h2>
        <div className='flex flex-wrap items-center space-x-1 sm:space-x-2'>
          <select
            value={filter}
            onChange={(e) =>
              setFilter(e.target.value as 'all' | 'completed' | 'not_completed')
            }
            className='border rounded p-1 text-xs sm:text-sm'
          >
            <option value='all'>All Tasks</option>
            <option value='completed'>Completed</option>
            <option value='not_completed'>Not Completed</option>
          </select>
          <button
            onClick={prevMonth}
            className='p-1 rounded hover:bg-gray-200 text-xs sm:text-sm'
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={nextMonth}
            className='p-1 rounded hover:bg-gray-200 text-xs sm:text-sm'
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
      {view === 'month' ? renderMonthView() : renderWeekView()}
    </div>
  )
}

export default Calendar
