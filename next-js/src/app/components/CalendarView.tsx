import React, { useMemo } from 'react'
import Calendar from './Calendar'
import { useTaskContext } from '@/contexts/TaskManagementContext'

export default function CalendarView() {
  const { tasks } = useTaskContext()

  // Preparing tasks for the calendar
  const calendarTasks = useMemo(
    () =>
      tasks.map((task) => ({
        id: task.id,
        title: task.title,
        dueDate: task.due_date,
        completed: task.completed,
      })),
    [tasks]
  )

  return (
    <div className='flex flex-col h-full overflow-hidden animate-fadeIn'>
      <div className='mb-6 bg-white p-4 rounded-lg shadow-md'>
        <h2 className='text-xl font-bold text-gray-800'>Calendar</h2>
      </div>
      <div className='flex-1 overflow-y-auto'>
        <Calendar tasks={calendarTasks} />
      </div>
    </div>
  )
}
