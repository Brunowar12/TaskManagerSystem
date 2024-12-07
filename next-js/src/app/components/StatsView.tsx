import { BarChart2, PieChart, TrendingUp } from 'lucide-react'

export default function StatsView() {
  return (
    <div className="flex flex-col h-full overflow-hidden animate-fadeIn">
      <div className="mb-6 bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-gray-800">Statistics</h2>
        <p className="text-gray-600">Overview of your task management</p>
      </div>
      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-700">Tasks Completed</h3>
              <BarChart2 className="h-6 w-6 text-purple-500" />
            </div>
            <p className="text-3xl font-bold text-gray-800 mt-2">24</p>
            <p className="text-sm text-gray-500 mt-1">Last 7 days</p>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-700">Productivity Score</h3>
              <TrendingUp className="h-6 w-6 text-green-500" />
            </div>
            <p className="text-3xl font-bold text-gray-800 mt-2">85%</p>
            <p className="text-sm text-gray-500 mt-1">+5% from last week</p>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-700">Task Distribution</h3>
              <PieChart className="h-6 w-6 text-blue-500" />
            </div>
            <div className="mt-2 space-y-2">
              <div className="flex items-center">
                <div className="w-2 h-2 rounded-full bg-purple-500 mr-2"></div>
                <span className="text-sm text-gray-600">Work: 45%</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 rounded-full bg-blue-500 mr-2"></div>
                <span className="text-sm text-gray-600">Personal: 30%</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                <span className="text-sm text-gray-600">Shopping: 25%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

