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

interface EditProfilePopupProps {
  isOpen: boolean
  onClose: () => void
  user: {
    username: string
    email: string
    phone_number: string
    place_of_work: string
    age: number
    avatarUrl: string
  }
}

export default function EditProfilePopup({
  isOpen,
  onClose,
  user,
}: EditProfilePopupProps) {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    age: '',
    placeOfWork: '',
    phoneNumber: '',
  })
  const [success, setSuccess] = useState(false)
  const [image, setImage] = useState<string | null>(user.avatarUrl || null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Инициализация формы из данных пользователя
  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || '',
        email: user.email || '',
        age: user.age.toString() || '',
        placeOfWork: user.place_of_work || '',
        phoneNumber: user.phone_number || '',
      })
      setImage(user.avatarUrl || null)
    }
  }, [user])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
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
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setSuccess(true)
    setTimeout(() => {
      setSuccess(false)
      onClose()
    }, 2000)
  }

  const inputVariants = {
    focus: {
      scale: 1.02,
      transition: { type: 'spring', stiffness: 300, damping: 10 },
    },
  }

  const successVariants = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className='fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50'
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
            <motion.div
              className='absolute inset-0 bg-gradient-to-br from-purple-100 to-purple-200 opacity-50'
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              transition={{ duration: 0.5 }}
            />
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

              <form onSubmit={handleSubmit} className='space-y-3'>
                <motion.div
                  className='space-y-3'
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
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
                      type: 'tel',
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
                          className='w-full pl-10 pr-4 py-1.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all duration-300 text-gray-800 bg-white hover:border-purple-300 relative z-0'
                        />
                      </div>
                    </div>
                  ))}
                </motion.div>

                <motion.div
                  className='relative'
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <label className='text-sm font-medium text-gray-700 mb-1 block'>
                    Profile Picture (Optional)
                  </label>
                  <div className='mt-1 flex items-center gap-4'>
                    {image ? (
                      <div className='relative w-12 h-12 rounded-full overflow-hidden'>
                        <img
                          src={image}
                          alt='Profile'
                          className='w-full h-full object-cover'
                        />
                        <button
                          type='button'
                          onClick={() => setImage(null)}
                          className='absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center text-white'
                        >
                          <X className='h-4 w-4' />
                        </button>
                      </div>
                    ) : (
                      <div className='w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-400'>
                        <ImageIcon className='h-6 w-6' />
                      </div>
                    )}
                    <motion.button
                      type='button'
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => fileInputRef.current?.click()}
                      className='px-3 py-1.5 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500'
                    >
                      <Upload className='h-4 w-4 inline-block mr-2' />
                      Upload
                    </motion.button>
                    <input
                      type='file'
                      ref={fileInputRef}
                      onChange={handleImageUpload}
                      accept='image/*'
                      className='hidden'
                    />
                  </div>
                </motion.div>

                <motion.div
                  className='flex flex-col sm:flex-row sm:justify-end gap-3 mt-6'
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  <motion.button
                    type='button'
                    onClick={onClose}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className='inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500'
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    type='submit'
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className='inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-purple-600 text-sm font-medium text-white hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500'
                  >
                    Save Changes
                  </motion.button>
                </motion.div>
              </form>

              <AnimatePresence>
                {success && (
                  <motion.div
                    initial='initial'
                    animate='animate'
                    exit='exit'
                    variants={successVariants}
                    className='absolute top-0 left-0 right-0 text-center text-green-600 text-sm p-2 bg-green-100 border-t-2 border-green-600 shadow-md'
                  >
                    Profile updated successfully!
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
