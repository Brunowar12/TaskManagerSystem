'use client'

import { useState, useRef, useEffect } from 'react'
import { UserCircle, LogOut, Menu, ChevronDown, User2 } from 'lucide-react'
import { logout } from '@/services/logoutService'
import { useUserContext } from '@/contexts/UserManagement'

interface HeaderProps {
  toggleSidebar: () => void
  toggleCollapse: () => void
  isCollapsed: boolean
  onProfileClick: () => void
}

export default function Header({
  toggleSidebar,
  toggleCollapse,
  isCollapsed,
  onProfileClick,
}: HeaderProps) {
  const [showDropdown, setShowDropdown] = useState(false)
  const [isDesktop, setIsDesktop] = useState(false)
  const { user } = useUserContext()
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Update the state to determine if the device is a desktop
    const updateIsDesktop = () => {
      if (typeof window !== 'undefined') {
        setIsDesktop(window.innerWidth >= 768)
      }
    }

    updateIsDesktop()
    window.addEventListener('resize', updateIsDesktop)

    return () => window.removeEventListener('resize', updateIsDesktop)
  }, [])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = () => {
    logout()
    console.log('Logged out')
  }

  return (
    <header className='sticky top-0 z-40 flex h-16 items-center justify-between border-b border-gray-200 bg-gradient-to-b from-[#e4e3df] to-[#cdd0ca] px-4'>
      <div className='flex items-center gap-4'>
        <button
          onClick={isDesktop ? toggleCollapse : toggleSidebar}
          className='inline-flex h-10 w-10 items-center justify-center rounded-md hover:bg-gray-100'
          aria-label={
            isDesktop
              ? isCollapsed
                ? 'Expand sidebar'
                : 'Collapse sidebar'
              : 'Toggle sidebar'
          }
        >
          <Menu className='h-6 w-6' />
        </button>
      </div>

      <div className='relative' ref={dropdownRef}>
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className='flex items-center gap-2 rounded-full bg-white px-3 py-2 shadow-sm transition-colors hover:bg-gray-50'
        >
          <UserCircle className='h-6 w-6 text-purple-600' />
          <span className='font-medium'>{user?.username || 'Guest'}</span>
          <ChevronDown
            className={`h-4 w-4 transition-transform ${
              showDropdown ? 'rotate-180' : ''
            }`}
          />
        </button>

        {showDropdown && (
          <div className='absolute right-0 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5'>
            <div className='px-4 py-2'>
              <p className='text-sm'>Signed in as</p>
              <p className='truncate text-sm font-medium'>
                {user?.email || '—'}
              </p>
            </div>
            <div className='border-t border-gray-100'>
              <button
                onClick={() => {
                  onProfileClick()
                  setShowDropdown(false)
                }}
                className='flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100'
              >
                <User2 className='h-4 w-4' />
                Profile
              </button>
              <button
                onClick={handleLogout}
                className='flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100'
              >
                <LogOut className='h-4 w-4' />
                Sign out
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
