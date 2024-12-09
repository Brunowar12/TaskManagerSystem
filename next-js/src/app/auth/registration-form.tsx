'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useNotification } from '@/contexts/notification-context'
import { register, login } from '@/services/authService'
import { useCategoryContext } from '@/contexts/CategoryManagement'
import { useUserContext } from '@/contexts/UserManagement'
import { useTaskContext } from '@/contexts/TaskManagementContext'

export default function RegistrationForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const router = useRouter()
  const { addNotification, setPendingNotification } = useNotification()
  const { fetchCategories } = useCategoryContext()
  const { fetchUserProfile } = useUserContext()
  const { fetchTasks } = useTaskContext()

  const validateField = (name: string, value: string): string => {
    let error = ''
    const containsCyrillic = /[а-яА-ЯёЁ]/.test(value)

    if (containsCyrillic) {
      error = 'Only Latin characters are allowed.'
    } else {
      switch (name) {
        case 'email':
          if (!value.trim()) {
            error = 'Email is required.'
          } else if (!/\S+@\S+\.\S+/.test(value)) {
            error = 'Invalid email format.'
          }
          break
        case 'password':
          if (!value.trim()) {
            error = 'Password is required.'
          } else if (value.length < 8) {
            error = 'Password must be at least 8 characters long.'
          } else if (!/[A-Z]/.test(value) || !/[0-9]/.test(value)) {
            error =
              'Password must include at least one uppercase letter and one number.'
          }
          break
        case 'confirmPassword':
          if (!value.trim()) {
            error = 'Password confirmation is required.'
          } else if (value !== password) {
            error = 'Passwords do not match.'
          }
          break
      }
    }
    return error
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setErrors((prev) => ({ ...prev, [name]: '' }))
    if (name === 'email') setEmail(value)
    if (name === 'password') setPassword(value)
    if (name === 'confirmPassword') setConfirmPassword(value)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const emailError = validateField('email', email)
    const passwordError = validateField('password', password)
    const confirmPasswordError = validateField(
      'confirmPassword',
      confirmPassword
    )

    if (emailError || passwordError || confirmPasswordError) {
      setErrors({
        email: emailError,
        password: passwordError,
        confirmPassword: confirmPasswordError,
      })

      if (emailError) addNotification('error', emailError)
      if (passwordError) addNotification('error', passwordError)
      if (confirmPasswordError) addNotification('error', confirmPasswordError)
    } else {
      try {
        await register(email, password)
        setPendingNotification(
          'success',
          'Registration successful! Logging you in...',
          5000
        )

        // Perform login after registration
        const userData = await login(email, password)
        setPendingNotification(
          'success',
          `Welcome, ${userData.username}!`,
          5000
        )
        await Promise.all([fetchCategories(), fetchUserProfile(), fetchTasks()])
        router.push('/')
      } catch (err: any) {
        addNotification('error', err.message)
      }
    }
  }

  return (
    <div className='w-full flex flex-col items-center'>
      <h2 className='text-3xl font-bold text-blue-800 dark:text-violet-200 mb-6 text-center'>
        New User Registration
      </h2>
      <form
        onSubmit={handleSubmit}
        noValidate
        className='space-y-6 w-full max-w-md'
      >
        {/* Email Field */}
        <div className='space-y-2'>
          <label className='text-blue-800 dark:text-violet-200 text-sm font-medium'>
            Email
          </label>
          <div className='relative group'>
            <Mail className='absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-600 dark:text-blue-300 group-hover:text-blue-800 dark:group-hover:text-white transition-colors duration-200' />
            <Input
              type='email'
              name='email'
              placeholder='Enter your email address'
              className={`pl-10 w-full bg-white bg-opacity-50 dark:bg-opacity-20 text-blue-800 dark:text-violet-100 placeholder-blue-400 dark:placeholder-violet-300 border ${
                errors.email
                  ? 'border-red-500'
                  : 'border-blue-300 dark:border-violet-400'
              } focus:border-blue-500 dark:focus:border-violet-300 focus:ring-2 focus:ring-blue-500 dark:focus:ring-violet-400 rounded-lg py-3 transition-all duration-200 focus:bg-opacity-70 dark:focus:bg-opacity-30 group-hover:bg-opacity-70 dark:group-hover:bg-opacity-30`}
              value={email}
              onChange={handleChange}
            />
          </div>
        </div>
        {/* Password Field */}
        <div className='space-y-2'>
          <label className='text-blue-800 dark:text-violet-200 text-sm font-medium'>
            Password
          </label>
          <div className='relative group'>
            <Lock className='absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-600 dark:text-blue-300 group-hover:text-blue-800 dark:group-hover:text-white transition-colors duration-200' />
            <Input
              type={showPassword ? 'text' : 'password'}
              name='password'
              placeholder='Create and enter your password'
              className={`pl-10 pr-10 w-full bg-white bg-opacity-50 dark:bg-opacity-20 text-blue-800 dark:text-violet-100 placeholder-blue-400 dark:placeholder-violet-300 border ${
                errors.password
                  ? 'border-red-500'
                  : 'border-blue-300 dark:border-violet-400'
              } focus:border-blue-500 dark:focus:border-violet-300 focus:ring-2 focus:ring-blue-500 dark:focus:ring-violet-400 rounded-lg py-3 transition-all duration-200 focus:bg-opacity-70 dark:focus:bg-opacity-30 group-hover:bg-opacity-70 dark:group-hover:bg-opacity-30`}
              value={password}
              onChange={handleChange}
            />
            <button
              type='button'
              className='absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-600 dark:text-blue-300 hover:text-blue-800 dark:hover:text-white transition-colors duration-200'
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff className='w-5 h-5 transition-transform duration-200 hover:scale-110' />
              ) : (
                <Eye className='w-5 h-5 transition-transform duration-200 hover:scale-110' />
              )}
            </button>
          </div>
        </div>
        {/* Confirm Password Field */}
        <div className='space-y-2'>
          <label className='text-blue-800 dark:text-violet-200 text-sm font-medium'>
            Confirm Password
          </label>
          <div className='relative group'>
            <Lock className='absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-600 dark:text-blue-300 group-hover:text-blue-800 dark:group-hover:text-white transition-colors duration-200' />
            <Input
              type={showConfirmPassword ? 'text' : 'password'}
              name='confirmPassword'
              placeholder='Confirm your password'
              className={`pl-10 pr-10 w-full bg-white bg-opacity-50 dark:bg-opacity-20 text-blue-800 dark:text-violet-100 placeholder-blue-400 dark:placeholder-violet-300 border ${
                errors.confirmPassword
                  ? 'border-red-500'
                  : 'border-blue-300 dark:border-violet-400'
              } focus:border-blue-500 dark:focus:border-violet-300 focus:ring-2 focus:ring-blue-500 dark:focus:ring-violet-400 rounded-lg py-3 transition-all duration-200 focus:bg-opacity-70 dark:focus:bg-opacity-30 group-hover:bg-opacity-70 dark:group-hover:bg-opacity-30`}
              value={confirmPassword}
              onChange={handleChange}
            />
            <button
              type='button'
              className='absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-600 dark:text-blue-300 hover:text-blue-800 dark:hover:text-white transition-colors duration-200'
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? (
                <EyeOff className='w-5 h-5 transition-transform duration-200 hover:scale-110' />
              ) : (
                <Eye className='w-5 h-5 transition-transform duration-200 hover:scale-110' />
              )}
            </button>
          </div>
        </div>
        <Button
          type='submit'
          className='w-full bg-gradient-to-r from-blue-500 to-teal-400 hover:from-blue-600 hover:to-teal-500 dark:from-violet-600 dark:to-blue-500 dark:hover:from-violet-700 dark:hover:to-blue-600 text-white font-medium py-3 rounded-lg transition-all duration-200 transform hover:scale-105 hover:shadow-lg animate-frost'
        >
          Create account
        </Button>
      </form>
    </div>
  )
}
