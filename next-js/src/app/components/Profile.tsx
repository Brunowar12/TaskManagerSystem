'use client'

import { useState } from 'react'
import {
  User2,
  Mail,
  Phone,
  Building2,
  Clock,
  Edit2,
  Settings,
  LogOut,
  ArrowLeft,
} from 'lucide-react'
import { PieChart } from '@/components/ui/pie-chart'
import EditProfilePopup from '@/components/EditProfilePopup'
import { useUserContext } from '@/contexts/UserManagement'
import { formatDate } from '@/services/formatDateServide'

interface ProfileStats {
  completedTasks: number
  ongoingTasks: number
  totalTasks: number
}

interface ProfileProps {
  stats?: ProfileStats
  onBackToTasks: () => void
}

export default function Profile({
  stats = { completedTasks: 0, ongoingTasks: 0, totalTasks: 0 },
  onBackToTasks,
}: ProfileProps) {
  const [isEditing, setIsEditing] = useState(false)
  const { user } = useUserContext() // Fetch the user from context

  const completionRate =
    stats.totalTasks > 0
      ? Math.round((stats.completedTasks / stats.totalTasks) * 100)
      : 0

  return (
    <div className='max-w-4xl mx-auto p-4 sm:p-6 space-y-6 animate-fadeIn'>
      <div className='bg-white rounded-xl shadow-lg p-6 transition-all duration-300 hover:shadow-xl animate-scaleIn'>
        {/* Profile Header */}
        <div className='flex justify-between items-center mb-8'>
          <h1 className='text-2xl font-bold text-gray-800'>Profile</h1>
          <button
            onClick={onBackToTasks}
            className='inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-200 hover:scale-105'
          >
            <ArrowLeft className='w-4 h-4 mr-2' />
            Back to Tasks
          </button>
        </div>

        {/* Main Profile Card */}
        <div className='flex flex-col sm:flex-row items-center gap-6'>
          {/* Avatar Section */}
          <div className='relative w-32 h-32 rounded-full overflow-hidden ring-4 ring-purple-100'>
            <img
              src={user?.avatarUrl ?? '/profile-image.jpg?height=128&width=128'}
              alt='Profile'
              className='w-full h-full object-cover'
            />
          </div>

          {/* User Info Section */}
          <div className='flex-1 space-y-4 text-center sm:text-left'>
            <div className='flex flex-col sm:flex-row justify-between items-center'>
              <h2 className='text-2xl font-bold text-gray-800 mb-4 sm:mb-0'>
                {user?.username ?? 'Guest User'}
              </h2>
              <div className='space-y-2 sm:space-y-0 sm:space-x-4'>
                <button
                  onClick={() => setIsEditing(true)}
                  className='w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all duration-200 hover:scale-105'
                >
                  <Edit2 className='w-4 h-4 mr-2' />
                  Edit Profile
                </button>
                <EditProfilePopup
                  isOpen={isEditing} // Pass the state to control popup visibility
                  onClose={() => setIsEditing(false)} // Close the popup on click
                  user={user}
                />
              </div>
            </div>

            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
              <div className='flex items-center space-x-2 text-gray-600'>
                <Mail className='w-5 h-5 text-purple-500' />
                <span>Email: {user?.email ?? 'N/A'}</span>
              </div>
              <div className='flex items-center space-x-2 text-gray-600'>
                <Phone className='w-5 h-5 text-purple-500' />
                <span>Phone number: {user?.phone_number ?? 'N/A'}</span>
              </div>
              <div className='flex items-center space-x-2 text-gray-600'>
                <Building2 className='w-5 h-5 text-purple-500' />
                <span>Place of work: {user?.place_of_work ?? 'N/A'}</span>
              </div>
              <div className='flex items-center space-x-2 text-gray-600'>
                <User2 className='w-5 h-5 text-purple-500' />
                <span>Age: {user?.age ?? 'N/A'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
        <div className='bg-white rounded-xl shadow-lg p-6 transition-all duration-300 hover:shadow-xl'>
          <div className='text-center'>
            <h3 className='text-lg font-semibold text-gray-800 mb-2'>
              Task Completion Rate
            </h3>
            <div className='relative w-32 h-32 mx-auto'>
              <PieChart
                data={[
                  { value: completionRate, color: '#9333EA' },
                  { value: 100 - completionRate, color: '#E9D5FF' },
                ]}
              />
              <div className='absolute inset-0 flex items-center justify-center'>
                <span className='text-2xl font-bold bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 bg-clip-text text-transparent'>
                  {completionRate}%
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className='bg-white rounded-xl shadow-lg p-6 transition-all duration-300 hover:shadow-xl'>
          <h3 className='text-lg font-semibold text-gray-800 mb-4'>
            Active Tasks
          </h3>
          <div className='space-y-4'>
            <div>
              <div className='flex justify-between text-sm text-gray-600 mb-1'>
                <span>Ongoing</span>
                <span>{stats.ongoingTasks}</span>
              </div>
              <div className='w-full bg-gray-200 rounded-full h-2'>
                <div
                  className='bg-purple-600 h-2 rounded-full transition-all duration-300'
                  style={{
                    width: `${
                      stats.totalTasks > 0
                        ? (stats.ongoingTasks / stats.totalTasks) * 100
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>
            <div>
              <div className='flex justify-between text-sm text-gray-600 mb-1'>
                <span>Completed</span>
                <span>{stats.completedTasks}</span>
              </div>
              <div className='w-full bg-gray-200 rounded-full h-2'>
                <div
                  className='bg-green-500 h-2 rounded-full transition-all duration-300'
                  style={{
                    width: `${
                      stats.totalTasks > 0
                        ? (stats.completedTasks / stats.totalTasks) * 100
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className='bg-white rounded-xl shadow-lg p-6 transition-all duration-300 hover:shadow-xl'>
          <h3 className='text-lg font-semibold text-gray-800 mb-4'>
            Recent Activity
          </h3>
          <div className='space-y-4'>
            <div className='flex items-center text-sm text-gray-600'>
              <Clock className='w-4 h-4 mr-2 text-purple-500' />
              <span>Last login: {formatDate(user?.logged_in ?? 'N/A')}</span>
            </div>
            <div className='flex items-center text-sm text-gray-600'>
              <Clock className='w-4 h-4 mr-2 text-purple-500' />
              <span>
                Profile edited: {formatDate(user?.profile_edited ?? 'N/A')}
              </span>
            </div>
            <div className='flex items-center text-sm text-gray-600'>
              <Clock className='w-4 h-4 mr-2 text-purple-500' />
              <span>
                Last task completed:{' '}
                {formatDate(user?.task_n_completed ?? 'N/A')}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
