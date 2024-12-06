'use client'

import { useState } from 'react'
import { useUser } from '@/context/UserContext'
import EditProfilePopup from '../components/EditProfilePopup'
import { formatDate } from '@/services/getUserInfoService'
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

interface ProfileStats {
  completedTasks: number
  ongoingTasks: number
  totalTasks: number
}

export default function Profile({
  onBackToTasks,
}: {
  onBackToTasks: () => void
}) {
  const { user, isLoading } = useUser()

  const [isPopupOpen, setIsPopupOpen] = useState(false) // State for popup visibility

  const openPopup = () => setIsPopupOpen(true) // Function to open the popup
  const closePopup = () => setIsPopupOpen(false) // Function to close the popup

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (!user) {
    return <div>No user data available</div>
  }

  // Task statistics (temporary example if context data is not used)
  const stats: ProfileStats = {
    completedTasks: 20,
    ongoingTasks: 5,
    totalTasks: 25,
  }

  return (
    <div className='max-w-4xl mx-auto p-4 sm:p-6 space-y-6 animate-fadeIn'>
      <div className='bg-white rounded-xl shadow-lg p-6 transition-all duration-300 hover:shadow-xl animate-scaleIn'>
        {/* Profile Header */}
        <div className='flex justify-between items-center mb-8'>
          <h1 className='text-2xl font-bold text-gray-800'>Profile</h1>
          <button
            onClick={onBackToTasks}
            className='inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-200'
          >
            <ArrowLeft className='w-4 h-4 mr-2' />
            Back to Tasks
          </button>
        </div>

        {/* Main Profile Content */}
        <div className='flex flex-col md:flex-row gap-8'>
          {/* Avatar Section */}
          <div className='flex flex-col items-center md:items-start'>
            <div className='relative w-32 h-32 rounded-full overflow-hidden ring-4 ring-purple-100 mb-4'>
              <img
                src={user.avatarUrl}
                alt='Profile'
                className='w-full h-full object-cover'
              />
            </div>
            <div className='space-y-2 w-full'>
              <button
                onClick={openPopup} // Open the popup when the button is clicked
                className='w-full inline-flex items-center justify-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all duration-200'
              >
                <Edit2 className='w-4 h-4 mr-2' />
                Edit Profile
              </button>
              <button className='w-full inline-flex items-center justify-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-200'>
                <Settings className='w-4 h-4 mr-2' />
                Settings
              </button>
              <button className='w-full inline-flex items-center justify-center px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-all duration-200'>
                <LogOut className='w-4 h-4 mr-2' />
                Logout
              </button>
            </div>
          </div>

          {/* User Info Section */}
          <div className='flex-1 space-y-4'>
            <h2 className='text-2xl font-bold text-gray-800 mb-4'>
              {user.username}
            </h2>
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
              <div className='flex items-center space-x-2 text-gray-600'>
                <Mail className='w-5 h-5 text-purple-500' />
                <span>{user.email}</span>
              </div>
              <div className='flex items-center space-x-2 text-gray-600'>
                <Phone className='w-5 h-5 text-purple-500' />
                <span>{user.phone_number}</span>
              </div>
              <div className='flex items-center space-x-2 text-gray-600'>
                <Building2 className='w-5 h-5 text-purple-500' />
                <span>{user.place_of_work}</span>
              </div>
              <div className='flex items-center space-x-2 text-gray-600'>
                <User2 className='w-5 h-5 text-purple-500' />
                <span>Age: {user.age}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
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
              <span>Last login: {formatDate(user.logged_in)}</span>
            </div>
            <div className='flex items-center text-sm text-gray-600'>
              <Clock className='w-4 h-4 mr-2 text-purple-500' />
              <span>Profile edited: {formatDate(user.profile_edited)}</span>
            </div>
            <div className='flex items-center text-sm text-gray-600'>
              <Clock className='w-4 h-4 mr-2 text-purple-500' />
              <span>
                Last task completed: {formatDate(user.task_n_completed)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Popup */}
      <EditProfilePopup isOpen={isPopupOpen} onClose={closePopup} user={user} />
    </div>
  )
}
