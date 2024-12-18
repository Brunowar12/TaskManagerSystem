'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useRef, useEffect } from 'react'
import {
  X,
  User,
  Mail,
  Cake,
  Building2,
  Phone,
  ImageIcon,
  Upload,
} from 'lucide-react'
import { useNotification } from '@/contexts/notification-context'
import { useUserContext } from '@/contexts/UserManagement'

interface EditProfilePopupProps {
  isOpen: boolean
  onClose: () => void
  user: {
    username?: string
    email?: string
    age?: string
    place_of_work?: string
    phone_number?: string
    avatarUrl?: string
  }
}

export default function EditProfilePopup({
  isOpen,
  onClose,
  user,
}: EditProfilePopupProps) {
  const [formData, setFormData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    age: user?.age || '',
    placeOfWork: user?.place_of_work || '',
    phoneNumber: user?.phone_number || '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [notificationShown, setNotificationShown] = useState(false)
  const [image, setImage] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { addNotification } = useNotification()
  const { updateUserProfile } = useUserContext()

  useEffect(() => {
    setFormData({
      username: user?.username || '',
      email: user?.email || '',
      age: user?.age || '',
      placeOfWork: user?.place_of_work || '',
      phoneNumber: user?.phone_number || '',
    })
  }, [user])

  const validateField = (name, value) => {
    let error = ''
    const valueStr = String(value).trim()

    switch (name) {
      case 'username':
        if (!valueStr) {
          error = 'Username is required.'
        } else if (!/^[a-zA-Z]+$/.test(valueStr)) {
          error = 'Username must contain only Latin letters without symbols.'
        } else if (valueStr.length > 20) {
          error = 'Username must be at most 20 characters long.'
        }
        break

      case 'placeOfWork':
        if (valueStr.length > 20) {
          error = 'Place of Work must be at most 20 characters long.'
        } else if (!/^[a-zA-Zа-яА-ЯёЁЇїІіЄєҐґ\s]*$/.test(valueStr)) {
          error =
            'Place of Work can contain only Latin, Cyrillic letters, and spaces.'
        }
        break

      case 'email':
        if (!valueStr) {
          error = 'Email is required.'
        } else if (!/\S+@\S+\.\S+/.test(valueStr)) {
          error = 'Invalid email format.'
        }
        break

      case 'age':
        const age = Number(valueStr)
        if (!valueStr || isNaN(age)) {
          error = 'Age is required and must be a number.'
        } else if (age < 6 || age > 100) {
          error = 'Age must be between 6 and 100.'
        }
        break

      case 'phoneNumber':
        if (!valueStr.startsWith('+')) {
          error = 'Phone number must start with a "+".'
        } else if (!/^\+?[0-9\s-]{1,15}$/.test(valueStr)) {
          error = 'Phone number must contain only digits, spaces, "+" or "-".'
        } else if (valueStr.replace(/[^0-9]/g, '').length > 15) {
          error = 'Invalid phone number (max 15 digits).'
        }
        break
    }

    return error
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    Object.entries(formData).forEach(([key, value]) => {
      const error = validateField(key, value)
      if (error) newErrors[key] = error
    })
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target

    const error = validateField(name, value)

    if (name === 'phoneNumber' && value.replace(/[^0-9]/g, '').length > 15) {
      return
    }

    setFormData((prev) => ({ ...prev, [name]: value }))
    setErrors((prev) => ({ ...prev, [name]: error }))

    if (error && !notificationShown) {
      addNotification('error', error)
      setNotificationShown(true)
    } else if (!error) {
      setNotificationShown(false)
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImage(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) {
      addNotification('error', 'Please fix validation errors.')
      return
    }

    try {
      addNotification('info', 'Updating profile...')
      await updateUserProfile({
        username: formData.username,
        email: formData.email,
        age: formData.age ? Number(formData.age) : undefined,
        place_of_work: formData.placeOfWork,
        phone_number: formData.phoneNumber,
      })

      onClose()
    } catch (error: any) {
      console.error('Error updating user profile:', error)

      // Логируем полный объект ошибки для диагностики
      console.log('Full error:', error)

      // Проверка на ошибку с уже существующим именем пользователя
      if (
        error.message &&
        error.message.includes('user with this username already exists')
      ) {
        addNotification(
          'error',
          'Username already exists. Please choose a different one.'
        )
      } else {
        // Если ошибка другая, выводим общий текст
        addNotification('error', 'Failed to update profile. Please try again.')
      }
    }
  }

  const inputVariants = {
    focus: {
      scale: 1.02,
      transition: { type: 'spring', stiffness: 300, damping: 10 },
    },
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className='fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50'
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className='bg-white rounded-xl shadow-2xl p-3 sm:p-4 w-full max-w-xl relative overflow-hidden'
            onClick={(e) => e.stopPropagation()}
          >
            <div className='relative'>
              <div className='flex justify-between items-center mb-6'>
                <motion.h2
                  className='text-2xl font-semibold text-gray-800'
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  Update Profile
                </motion.h2>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onClose}
                  className='text-gray-500 hover:text-gray-700 transition-colors'
                >
                  <X className='h-6 w-6' />
                </motion.button>
              </div>

              <form onSubmit={handleSubmit} className='space-y-3' noValidate>
                {[
                  {
                    icon: User,
                    label: 'Username',
                    name: 'username',
                    type: 'text',
                    placeholder: 'Enter username',
                  },
                  {
                    icon: Mail,
                    label: 'Email',
                    name: 'email',
                    type: 'email',
                    placeholder: 'Enter email',
                  },
                  {
                    icon: Cake,
                    label: 'Age',
                    name: 'age',
                    type: 'number',
                    placeholder: 'Enter age',
                  },
                  {
                    icon: Building2,
                    label: 'Place of Work',
                    name: 'placeOfWork',
                    type: 'text',
                    placeholder: 'Enter workplace',
                  },
                  {
                    icon: Phone,
                    label: 'Phone Number',
                    name: 'phoneNumber',
                    type: 'text',
                    placeholder: 'Enter phone number',
                  },
                ].map(({ icon: Icon, label, name, type, placeholder }) => (
                  <div key={name} className='relative'>
                    <label className='text-sm font-medium text-gray-700 mb-1 block'>
                      {label}
                    </label>
                    <div className='relative'>
                      <div className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10'>
                        <Icon className='h-5 w-5 bg-white p-0.5 rounded-full' />
                      </div>
                      <motion.input
                        type={type}
                        name={name}
                        value={formData[name as keyof typeof formData]}
                        onChange={handleChange}
                        placeholder={placeholder}
                        whileFocus='focus'
                        variants={inputVariants}
                        maxLength={20}
                        className={`w-full pl-10 pr-4 py-1.5 text-sm border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none transition-all duration-300 text-gray-800 bg-white ${
                          errors[name] ? 'border-red-500' : 'border-gray-200'
                        }`}
                      />
                    </div>
                    {errors[name] && (
                      <span className='text-red-500 text-xs mt-1 block'>
                        {errors[name]}
                      </span>
                    )}
                  </div>
                ))}

                <div className='flex flex-col sm:flex-row sm:gap-4'>
                  <motion.button
                    type='submit'
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className='w-full sm:w-auto px-4 py-2 bg-purple-600 text-white font-semibold rounded-md shadow-md hover:bg-purple-700 focus:ring-2 focus:ring-purple-500 focus:outline-none'
                  >
                    Update Profile
                  </motion.button>
                </div>
              </form>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
