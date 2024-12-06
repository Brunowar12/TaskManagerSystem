'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { registerUser, loginUser } from '@/services/authService'

export default function RegistrationForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (password !== confirmPassword) {
      alert('Passwords do not match')
      return
    }

    try {
      // Регистрация пользователя
      await registerUser(email, password)

      // Авторизация пользователя
      const loginData = await loginUser(email, password)

      // Сохранение токенов
      localStorage.setItem('accessToken', loginData.access)
      localStorage.setItem('refreshToken', loginData.refresh)

      // Перенаправление на главную
      router.replace('/')
    } catch (error: any) {
      alert(error.message || 'An error occurred. Please try again.')
    }
  }

  return (
    <div className='w-full flex flex-col items-center'>
      <h2 className='text-3xl font-bold text-blue-800 dark:text-violet-200 mb-6 text-center'>
        New User Registration
      </h2>
      <form onSubmit={handleSubmit} className='space-y-6 w-full max-w-md'>
        <div className='space-y-2'>
          <label className='text-blue-800 dark:text-violet-200 text-sm font-medium'>
            Email
          </label>
          <div className='relative group'>
            <Mail className='absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-600 dark:text-blue-300 group-hover:text-blue-800 dark:group-hover:text-white transition-colors duration-200' />
            <Input
              type='email'
              placeholder='Enter your email address'
              className='pl-10 w-full bg-white bg-opacity-50 dark:bg-opacity-20 text-blue-800 dark:text-violet-100 placeholder-blue-400 dark:placeholder-violet-300 border border-blue-300 dark:border-violet-400 focus:border-blue-500 dark:focus:border-violet-300 focus:ring-2 focus:ring-blue-500 dark:focus:ring-violet-400 rounded-lg py-3 transition-all duration-200 focus:bg-opacity-70 dark:focus:bg-opacity-30 group-hover:bg-opacity-70 dark:group-hover:bg-opacity-30'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
        </div>
        <div className='space-y-2'>
          <label className='text-blue-800 dark:text-violet-200 text-sm font-medium'>
            Password
          </label>
          <div className='relative group'>
            <Lock className='absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-600 dark:text-blue-300 group-hover:text-blue-800 dark:group-hover:text-white transition-colors duration-200' />
            <Input
              type={showPassword ? 'text' : 'password'}
              placeholder='Create and enter your password'
              className='pl-10 pr-10 w-full bg-white bg-opacity-50 dark:bg-opacity-20 text-blue-800 dark:text-violet-100 placeholder-blue-400 dark:placeholder-violet-300 border border-blue-300 dark:border-violet-400 focus:border-blue-500 dark:focus:border-violet-300 focus:ring-2 focus:ring-blue-500 dark:focus:ring-violet-400 rounded-lg py-3 transition-all duration-200 focus:bg-opacity-70 dark:focus:bg-opacity-30 group-hover:bg-opacity-70 dark:group-hover:bg-opacity-30'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type='button'
              className='absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-600 dark:text-blue-300 hover:text-blue-800 dark:hover:text-white transition-colors duration-200'
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff className='w-5 h-5' />
              ) : (
                <Eye className='w-5 h-5' />
              )}
            </button>
          </div>
        </div>
        <div className='space-y-2'>
          <label className='text-blue-800 dark:text-violet-200 text-sm font-medium'>
            Confirm Password
          </label>
          <div className='relative group'>
            <Lock className='absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-600 dark:text-blue-300 group-hover:text-blue-800 dark:group-hover:text-white transition-colors duration-200' />
            <Input
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder='Enter created password'
              className='pl-10 pr-10 w-full bg-white bg-opacity-50 dark:bg-opacity-20 text-blue-800 dark:text-violet-100 placeholder-blue-400 dark:placeholder-violet-300 border border-blue-300 dark:border-violet-400 focus:border-blue-500 dark:focus:border-violet-300 focus:ring-2 focus:ring-blue-500 dark:focus:ring-violet-400 rounded-lg py-3 transition-all duration-200 focus:bg-opacity-70 dark:focus:bg-opacity-30 group-hover:bg-opacity-70 dark:group-hover:bg-opacity-30'
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <button
              type='button'
              className='absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-600 dark:text-blue-300 hover:text-blue-800 dark:hover:text-white transition-colors duration-200'
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? (
                <EyeOff className='w-5 h-5' />
              ) : (
                <Eye className='w-5 h-5' />
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
