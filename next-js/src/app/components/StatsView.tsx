'use client'

import { useState } from 'react'
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { useStatsContext } from '@/contexts/StatsContext'
import { useTaskContext } from '@/contexts/TaskManagementContext'

export default function StatsView() {
  const { productivityScore, taskDistribution } = useStatsContext()
  const { tasks } = useTaskContext()

  const completedTasks = tasks.filter((task) => task.completed).length
  const remainingTasks = tasks.length - completedTasks

  const completedData = [
    { name: 'Tasks Completed', value: completedTasks },
    { name: 'Remaining', value: remainingTasks },
  ]

  const categoryCounts: Record<string, number> = {}
  tasks.forEach((task) => {
    const category = task.category || 'Uncategorized'
    categoryCounts[category] = (categoryCounts[category] || 0) + 1
  })

  const distributionData = Object.entries(taskDistribution).map(
    ([name, value]) => ({
      name,
      value,
    })
  )

  const productivityData = [
    { name: 'This Week', value: productivityScore },
    { name: 'Last Week', value: 100 - productivityScore },
  ]

  const chartDataMap = {
    distribution: distributionData,
    productivity: productivityData,
    completed: completedData,
  }

  const COLORS = ['#8b5cf6', '#3b82f6', '#22c55e', '#f97316', '#e11d48']

  const [selectedData, setSelectedData] = useState<
    'distribution' | 'productivity' | 'completed'
  >('distribution')
  const [chartType, setChartType] = useState<'bar' | 'pie'>('bar')

  const chartData = chartDataMap[selectedData]

  return (
    <div className='flex flex-col h-full overflow-auto p-4 bg-gray-50 animate-fadeIn'>
      <div className='mb-6 bg-white p-4 sm:p-6 rounded-lg shadow-md'>
        <h2 className='text-xl sm:text-2xl font-bold text-gray-800'>
          Statistics
        </h2>
        <p className='text-sm sm:text-base text-gray-600'>
          Overview of your task management
        </p>
      </div>

      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6'>
        <div className='bg-white rounded-lg shadow-lg p-4 sm:p-6'>
          <h3 className='text-sm sm:text-lg font-semibold text-gray-700'>
            Tasks Completed
          </h3>
          <p className='text-2xl sm:text-3xl font-bold text-gray-800 mt-2'>
            {completedTasks}
          </p>
          <p className='text-xs sm:text-sm text-gray-500 mt-1'>
            Remaining: {remainingTasks}
          </p>
        </div>

        <div className='bg-white rounded-lg shadow-lg p-4 sm:p-6'>
          <h3 className='text-sm sm:text-lg font-semibold text-gray-700'>
            Productivity Score
          </h3>
          <p className='text-2xl sm:text-3xl font-bold text-gray-800 mt-2'>
            {productivityScore}%
          </p>
          <p className='text-xs sm:text-sm text-gray-500 mt-1'>
            +5% from last week
          </p>
        </div>

        <div className='bg-white rounded-lg shadow-lg p-4 sm:p-6'>
          <h3 className='text-sm sm:text-lg font-semibold text-gray-700'>
            Task Distribution
          </h3>
          <div className='mt-2 space-y-1 sm:space-y-2'>
            {distributionData.map(({ name, value }, index) => (
              <div key={name} className='flex items-center'>
                <div
                  className='w-2 h-2 sm:w-3 sm:h-3 rounded-full mr-2'
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                ></div>
                <span className='text-xs sm:text-sm text-gray-600'>
                  {name}: {value}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className='bg-white p-4 sm:p-6 rounded-lg shadow-md'>
        <div className='flex flex-col sm:flex-row sm:justify-between items-start sm:items-center mb-4'>
          <h3 className='text-sm sm:text-lg font-bold text-gray-800 mb-2 sm:mb-0'>
            Task Statistics
          </h3>
          <div className='flex space-x-2'>
            <button
              onClick={() => setChartType('bar')}
              className={`px-4 py-2 text-xs sm:text-sm rounded-lg text-white ${
                chartType === 'bar' ? 'bg-purple-600' : 'bg-gray-400'
              }`}
            >
              Bar Chart
            </button>
            <button
              onClick={() => setChartType('pie')}
              className={`px-4 py-2 text-xs sm:text-sm rounded-lg text-white ${
                chartType === 'pie' ? 'bg-purple-600' : 'bg-gray-400'
              }`}
            >
              Pie Chart
            </button>
          </div>
        </div>

        <div className='flex justify-center mb-4'>
          {['distribution', 'productivity', 'completed'].map((type) => (
            <button
              key={type}
              onClick={() =>
                setSelectedData(
                  type as 'distribution' | 'productivity' | 'completed'
                )
              }
              className={`mx-1 sm:mx-2 px-4 py-2 text-xs sm:text-sm rounded-lg text-white ${
                selectedData === type ? 'bg-purple-600' : 'bg-gray-400'
              }`}
            >
              {type === 'distribution'
                ? 'Task Distribution'
                : type === 'productivity'
                ? 'Productivity Score'
                : 'Tasks Completed'}
            </button>
          ))}
        </div>

        <div className='h-64'>
          <ResponsiveContainer width='100%' height='100%'>
            {chartType === 'bar' ? (
              <BarChart data={chartData}>
                <XAxis dataKey='name' />
                <YAxis />
                <Bar dataKey='value' fill='#8b5cf6' />
                <Tooltip
                  formatter={(value: number) =>
                    selectedData === 'distribution' ||
                    selectedData === 'productivity'
                      ? `${value}%`
                      : value
                  }
                />
                <Legend />
              </BarChart>
            ) : (
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey='value'
                  nameKey='name'
                  outerRadius={80}
                  fill='#8b5cf6'
                  label={(entry) =>
                    selectedData === 'distribution' ||
                    selectedData === 'productivity'
                      ? `${entry.name}: ${entry.value}%`
                      : `${entry.name}: ${entry.value}`
                  }
                >
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) =>
                    selectedData === 'distribution' ||
                    selectedData === 'productivity'
                      ? `${value}%`
                      : value
                  }
                />
                <Legend />
              </PieChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
