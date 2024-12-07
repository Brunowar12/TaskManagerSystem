'use client'

import React, { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface Task {
  id: number
  title: string
  dueDate: string
  type: 'event' | 'deadline'
}

interface CalendarProps {
  tasks: Task[]
}

const Calendar: React.FC<CalendarProps> = ({ tasks }) => {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [view, setView] = useState<'month' | 'week'>('month')
  const [slideDirection, setSlideDirection] = useState<'left' | 'right'>('right')

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate()
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay()

  const prevMonth = () => {
    setSlideDirection('left')
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  const nextMonth = () => {
    setSlideDirection('right')
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  const isToday = (day: number) => {
    const today = new Date()
    return (
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    )
  }

  const isWeekend = (index: number) => {
    const dayOfWeek = (firstDayOfMonth + index) % 7
    return dayOfWeek === 0 || dayOfWeek === 6
  }

  const getDayTasks = (day: number) => {
    return tasks.filter(task => {
      const taskDate = new Date(task.dueDate)
      return (
        taskDate.getDate() === day &&
        taskDate.getMonth() === currentDate.getMonth() &&
        taskDate.getFullYear() === currentDate.getFullYear()
      )
    })
  }

  const getTaskColor = (type: 'event' | 'deadline') => {
    return type === 'event' ? 'bg-blue-500' : 'bg-red-500'
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg animate-fadeIn">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
        </h2>
        <div className="flex items-center space-x-4">
          <select
            value={view}
            onChange={(e) => setView(e.target.value as 'month' | 'week')}
            className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors duration-200"
          >
            <option value="month">Month</option>
            <option value="week">Week</option>
          </select>
          <div className="flex space-x-2">
            <button
              onClick={prevMonth}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={nextMonth}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className={`transition-transform duration-300 transform ${
        slideDirection === 'right' ? 'translate-x-0' : '-translate-x-0'
      }`}>
        <div className="grid grid-cols-7 gap-4">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center font-semibold text-gray-600 py-2">
              {day}
            </div>
          ))}
          {Array.from({ length: firstDayOfMonth }).map((_, index) => (
            <div key={`empty-${index}`} className="aspect-square" />
          ))}
          {Array.from({ length: daysInMonth }).map((_, index) => {
            const day = index + 1
            const dayTasks = getDayTasks(day)
            const isWeekendDay = isWeekend(index)

            return (
              <div
                key={day}
                className={`
                  aspect-square p-2 rounded-lg transition-all duration-200
                  ${isWeekendDay ? 'bg-gray-100' : 'bg-white'}
                  ${isToday(day) ? 'ring-2 ring-purple-500 shadow-lg' : 'hover:bg-gray-50'}
                  relative group
                `}
              >
                <div className={`
                  text-right font-semibold mb-1
                  ${isToday(day) ? 'text-purple-600 text-lg' : 'text-gray-700'}
                `}>
                  {day}
                </div>
                <div className="space-y-1">
                  {dayTasks.map(task => (
                    <div
                      key={task.id}
                      className={`
                        text-xs p-1 rounded truncate
                        ${getTaskColor(task.type)} text-white
                        transform transition-transform duration-200
                        hover:scale-105 cursor-pointer
                      `}
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
      </div>
    </div>
  )
}

export default Calendar

