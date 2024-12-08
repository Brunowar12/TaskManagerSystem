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

export default function StatsView() {
  const { tasksCompleted, productivityScore, taskDistribution } =
    useStatsContext()

  // Форматируем данные для диаграмм
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

  const completedData = [
    { name: 'Tasks Completed', value: tasksCompleted },
    { name: 'Remaining', value: 100 - tasksCompleted }, // Пример: если из 100 задач выполнено N
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
    <div className='flex flex-col h-full overflow-hidden animate-fadeIn'>
      <div className='mb-6 bg-white p-6 rounded-lg shadow-md'>
        <h2 className='text-2xl font-bold text-gray-800'>Statistics</h2>
        <p className='text-gray-600'>Overview of your task management</p>
      </div>

      {/* Карточки */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6'>
        <div className='bg-white rounded-lg shadow-lg p-6'>
          <div className='flex items-center justify-between'>
            <h3 className='text-lg font-semibold text-gray-700'>
              Tasks Completed
            </h3>
          </div>
          <p className='text-3xl font-bold text-gray-800 mt-2'>
            {tasksCompleted}
          </p>
          <p className='text-sm text-gray-500 mt-1'>Last 7 days</p>
        </div>

        <div className='bg-white rounded-lg shadow-lg p-6'>
          <div className='flex items-center justify-between'>
            <h3 className='text-lg font-semibold text-gray-700'>
              Productivity Score
            </h3>
          </div>
          <p className='text-3xl font-bold text-gray-800 mt-2'>
            {productivityScore}%
          </p>
          <p className='text-sm text-gray-500 mt-1'>+5% from last week</p>
        </div>

        <div className='bg-white rounded-lg shadow-lg p-6'>
          <div className='flex items-center justify-between'>
            <h3 className='text-lg font-semibold text-gray-700'>
              Task Distribution
            </h3>
          </div>
          <div className='mt-2 space-y-2'>
            {distributionData.map(({ name, value }, index) => (
              <div key={name} className='flex items-center'>
                <div
                  className='w-2 h-2 rounded-full mr-2'
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                ></div>
                <span className='text-sm text-gray-600'>
                  {name}: {value}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Диаграмма */}
      <div className='bg-white p-6 rounded-lg shadow-md'>
        <div className='flex justify-between items-center mb-4'>
          <h3 className='text-lg font-bold text-gray-800'>Task Statistics</h3>
          <div className='flex space-x-2'>
            <button
              onClick={() => setChartType('bar')}
              className={`px-4 py-2 rounded-lg text-white ${
                chartType === 'bar' ? 'bg-purple-600' : 'bg-gray-400'
              }`}
            >
              Bar Chart
            </button>
            <button
              onClick={() => setChartType('pie')}
              className={`px-4 py-2 rounded-lg text-white ${
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
              className={`mx-2 px-4 py-2 rounded-lg text-white ${
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
                <Tooltip />
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
                >
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
